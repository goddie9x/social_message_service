const BasicService = require('../utils/services/basicService');
const GroupChat = require('../models/groupChat');
const { CONTENT_TYPE } = require('../utils/constants/communication');
const Message = require('../models/message');
const { IncorrectPermission, BadRequestException } = require('../utils/exceptions/commonExceptions');
const { ROLES } = require('../utils/constants/users');
const bindMethodsWithThisContext = require('../utils/classes/bindMethodsWithThisContext');
const { sendUpdateGroupChatToSocketGateway, sendCreatedGroupChatToSocketGateway, sendNewMessageInfoToSocketGateway } = require('../kafka/producer');
const { TARGET_TYPE, GROUP_CHAT } = require('../utils/constants/communication');
const { validateTargetNotExistThrowException } = require('../utils/validate');

class GroupChatService extends BasicService {
    constructor() {
        super();
        bindMethodsWithThisContext(this);
    }

    async createGroupChat({ currentUser, createdAt, ownerId, updatedAt, ...otherGroupChatData }) {
        const groupChatData = {
            ...otherGroupChatData,
            ownerId: currentUser.userId
        }
        let groupChat = new GroupChat(groupChatData);

        groupChat = await groupChat.save();
        groupChat.participants.forEach(user => {
            sendCreatedGroupChatToSocketGateway({
                message: groupChat,
                roomId: user.userId
            })
        });
        return groupChat;
    }
    async createNewMessageInGroupChat({ targetId }) {
        let groupChat = await GroupChat.findById(targetId);

        validateTargetNotExistThrowException(groupChat, 'Group chat not exist');
        return await this.createNewMessageInGroupChatWithSpecificGroupChat({ targetId }, groupChat);
    }
    async createNewMessageInGroupChatWithSpecificGroupChat({ targetId, currentUser, ...data }, groupChat) {
        const newMessage = new Message({
            ...data,
            sender: currentUser.userId,
            target: {
                targetId: groupChat._id,
                targetType: TARGET_TYPE.GROUP_CHAT
            },
            hide: [],
            removed: false,
        });
        const response = await newMessage.save();

        sendNewMessageInfoToSocketGateway({
            roomId: groupChat._id.toString(),
            message: newMessage,
        });
        return response;
    }
    async getGroupChatListWithPagination({ query, page, limit }) {
        return await this.getPaginatedResults({
            model: GroupChat,
            query, page, limit
        });
    }
    async getGroupChatById({ id, currentUser }) {
        const groupChat = await GroupChat.findById(id);

        validateTargetNotExistThrowException(groupChat, 'Group chat');
        this.validateGroupChatModifyPermission(groupChat, currentUser);

        return groupChat;
    }
    validateGroupChatModifyPermission(groupChat, currentUser) {
        if (groupChat.ownerId != currentUser.userId && currentUser.role == ROLES.USER) {
            throw new IncorrectPermission();
        }
    }
    async updateGroupChat({
        id, currentUser, participants, ownerId, ...updateData
    }) {
        let groupChat = await GroupChat.findById(id);
        
        validateTargetNotExistThrowException(groupChat, 'Group chat');
        this.validateGroupChatModifyPermission(groupChat, currentUser);
        groupChat.set(updateData);
        groupChat = await groupChat.save();
        sendUpdateGroupChatToSocketGateway({
            roomId: groupChat._id.toString(),
            message: groupChat
        });
        return groupChat;
    }
    async changeGroupChatOwner({
        id, currentUser, newOwnerId
    }) {
        if (currentUser.userId == newOwnerId) {
            throw new BadRequestException('Same owner');
        }
        let groupChat = await GroupChat.findById(id);

        validateTargetNotExistThrowException(groupChat, 'Group chat');
        this.validateGroupChatModifyPermission(groupChat, currentUser);
        groupChat.ownerId = newOwnerId;
        groupChat = await groupChat.save();
        sendUpdateGroupChatToSocketGateway({
            roomId: groupChat._id.toString(),
            message: groupChat
        });
    }
    getUserIndexInParticipantThrowExceptionIfNot(groupChat, targetUserId) {
        const targetUserIndex = groupChat.participants.findIndex(x => x.userId.equals(targetUserId))
        if (targetUserIndex < 0) {
            throw new BadRequestException('The user target not exist in this group chat');
        }
        return targetUserIndex;
    }
    async removeUserFromGroupChat({
        id, currentUser, targetUserId
    }) {
        const { role, userId } = currentUser;
        let groupChat = await GroupChat.findById(id);

        validateTargetNotExistThrowException(groupChat, 'Group chat');
        const isGroupOwner = groupChat.ownerId.equals(userId);
        if (isGroupOwner && currentUser == targetUserId) {
            throw new BadRequestException('You are the group owner, so that you must change group owner before leave the group');
        }
        if (role == ROLES.USER && !isGroupOwner) {
            throw new IncorrectPermission();
        }
        if (groupChat.participants.length < GROUP_CHAT.MIN_AMOUNT_MEMBER) {
            throw new BadRequestException(`Group chat must have more than ${GROUP_CHAT.MIN_AMOUNT_MEMBER} members, consider to delete the group chat instead`);
        }
        const targetUserIndex = this.getUserIndexInParticipantThrowExceptionIfNot(groupChat, targetUserId);

        groupChat.participants.splice(targetUserIndex, 1);
        groupChat = await groupChat.save();
        const createRemoveUserMessagePayloads = {
            currentUser, contentType: CONTENT_TYPE.TEXT,
            content: isGroupOwner ?
                `User <user>${targetUserId}</user> have been removed by <user>${currentUser.userId}</user>`
                : `<user>${currentUser.userId}</user> has left the group`,
        };
        this.createNewMessageInGroupChatWithSpecificGroupChat(createRemoveUserMessagePayloads, groupChat);
        sendUpdateGroupChatToSocketGateway({
            roomId: groupChat._id.toString(),
            message: groupChat
        });

        return groupChat;
    }
    async addMultipleUserToGroupChat({
        id, currentUser, userIds
    }) {
        const groupChat = await GroupChat.findById(id);
        const listUniqueId = [...new Set(userIds)];
        validateTargetNotExistThrowException(groupChat, 'Group chat');
        if (currentUser.role == ROLES.USER && !groupChat.participants.find(x => x.userId == currentUser.userId)) {
            throw new IncorrectPermission();
        }
        listUniqueId.forEach(userId => {
            groupChat.participants.push({ userId });
        })
        return await groupChat.save();
    }
    async getListMessageFromGroupChat({ currentUser, targetId }) {
        const groupChat = await GroupChat.findById(targetId);

        validateTargetNotExistThrowException(groupChat, 'Group chat');
        if (currentUser.role == ROLES.USER && !groupChat.participants.find(x => x.userId == currentUser.userId)) {
            throw new IncorrectPermission();
        }
        return await this.getListMessageFromGroupChatByQuery({ currentUser, targetId });
    }
    async getListMessageFromGroupChatByQuery({ page, limit, targetId, query = {} }) {
        const queryObject = {
            ...query,
            'target.targetId': targetId,
            'target.targetType': TARGET_TYPE.GROUP_CHAT
        };
        const results = await this.getPaginatedResults({
            model: Message,
            query: queryObject,
            page,
            limit,
            sort: {
                createdAt: -1
            }
        });
        return results;
    }
    async deleteGroupChat({ currentUser, id }) {
        const groupChat = await GroupChat.findById(id);

        validateTargetNotExistThrowException(groupChat, 'Group chat');
        this.getUserIndexInParticipantThrowExceptionIfNot(groupChat, currentUser.userId);
        await Message.deleteMany({
            target: {
                targetId: groupChat._id,
                targetType: TARGET_TYPE.GROUP_CHAT
            }
        });
        return await groupChat.deleteOne();
    }
}

module.exports = new GroupChatService();