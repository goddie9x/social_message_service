const BasicService = require('../utils/services/basicService');
const Contact = require('../models/contact');
const GroupChat = require('../models/groupChat');
const Message = require('../models/message');
const { TargetNotExistException, IncorrectPermission, BadRequestException } = require('../utils/exceptions/commonExceptions');
const { ROLES } = require('../utils/constants/users');
const { TARGET_TYPE } = require('../utils/constants/communication');
const bindMethodsWithThisContext = require('../utils/classes/bindMethodsWithThisContext');
const { sendNewMessageInfoToSocketGateway } = require('../kakfa/producer');
const { MESSAGE_CHANNEL } = require('../utils/constants/socketChannel');
class MessageService extends BasicService {
    constructor() {
        super();
        bindMethodsWithThisContext(this);
    }
    async createNewMessageInbox(payloads) {
        const { targetId, receiverId, currentUser, ...data } = payloads;
        let contact = await Contact.findById(targetId);

        if (!contact && receiverId) {
            contact = new Contact({
                user1: { userId: currentUser.userId },
                user2: { userId: receiverId },
            });
            contact = await contact.save();
        }
        else {
            throw new TargetNotExistException('Contact not exist');
        }
        const newMessage = new Message({
            ...data,
            sender: currentUser.userId,
            target: {
                targetId: contact._id,
                targetType: TARGET_TYPE.CHAT
            },
            hide: [],
            removed: false,
        });

        const response = await newMessage.save();
        sendNewMessageInfoToSocketGateway({
            roomId: MESSAGE_CHANNEL.EVENTS.NEW_MESSAGE + contact._id.toString(),
            message: newMessage,
        });
        return response;
    }
    async createNewMessageInGroupChat(payloads) {
        const { targetId, receiverId, currentUser, ...data } = payloads;
        let groupChat = await GroupChat.findById(targetId);

        if (!groupChat) {
            throw new BadRequestException('Group chat not exist');
        }
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
            roomId: MESSAGE_CHANNEL.EVENTS.NEW_MESSAGE + groupChat._id.toString(),
            message: newMessage,
        });
        return response;
    }
    async deleteMessage(payloads) {
        const { id, currentUser } = payloads;
        const message = await Message.findById(id);

        if (!message.sender.equals(currentUser.userId) && currentUser.role == ROLES.USER) {
            throw new IncorrectPermission();
        }
        return await message.deleteOne();
    }
    async checkCurrentUserInTheGroupChat({
        userId, role, targetId
    }) {
        const groupChat = await GroupChat.findById(targetId);
        if (role == ROLES.USER && !groupChat.participants.find(x => x.userId == userId)) {
            throw new BadRequestException('You are not in the conversation');
        }
    }
    async checkCurrentUserInTheContact({
        userId, role, targetId
    }) {
        const contact = await Contact.findById(targetId);
        if (role == ROLES.USER && !(contact.user1.userId.equals(userId) || contact.user2.userId.equals(userId))) {
            throw new BadRequestException('You are not in the conversation');
        }
    }
    async checkCurrentUserInTheConversation({
        userId, role, targetType, targetId
    }) {
        if (targetType == COMMUNICATION.TARGET_TYPE.CHAT) {
            await this.isCurrentUserInTheContact({ role, targetId, userId })
        }
        else {
            await this.isCurrentUserInTheGroupChat({ role, targetId, userId })
        }
    }
    async hideMessage(payloads) {
        const { id, currentUser } = payloads;
        const { userId, role } = currentUser;

        const message = await Message.findById(id);
        if (userId != message.sender) {
            await checkCurrentUserInTheConversation({
                userId,
                role,
                targetType: message.target.targetType,
                targetId: message.target.targetId
            });
        }
        if (!message.hide.includes(userId)) {
            message.hide.push(userId);

            const messageUpdated = await message.save();

            sendNewMessageInfoToSocketGateway({
                roomId: MESSAGE_CHANNEL.EVENTS.HIDE_MESSAGE + messageUpdated._id,
                message: messageUpdated.target
            });
            return messageUpdated;
        } else {
            throw new BadRequestException('You has already hidden this message.');
        }
    }
    async getContactListWithPagination(payloads) {
        const { query, page, limit } = payloads;

        return await this.getPaginatedResults({
            model: Contact,
            query, page, limit
        });
    }
    async getGroupChatListWithPagination(payloads) {
        const { query, page, limit } = payloads;

        return await this.getPaginatedResults({
            model: GroupChat,
            query, page, limit
        });
    }
    async getContactById(payloads) {
        return Contact.findById(payloads.id);
    }
    async getGroupChatById(payloads) {
        return GroupChat.findById(payloads.id);
    }
    async updateGroupChat(payloads) {
        const {
            id, currentUser, ...updateData
        } = payloads;

        const groupChat = GroupChat.findByIdAndUpdate(id, updateData);

        sendNewMessageInfoToSocketGateway({
            roomId: MESSAGE_CHANNEL.EVENTS.UPDATE_GROUP_CHAT_INFO,
            message: groupChat
        });
        return groupChat;
    }
    async changeGroupChatOwner(payloads) {
        const {
            id, currentUser, newOwnerId
        } = payloads;

        if (currentUser.userId == newOwnerId) {
            throw new BadRequestException('Same owner');
        }
        let groupChat = await GroupChat.findById(id);

        if (!groupChat) {
            throw new TargetNotExistException('Group chat not exist');
        }
        if (groupChat.ownerId != currentUser.userId && currentUser.role == ROLES.USER) {
            throw new IncorrectPermission();
        }
        groupChat.ownerId = newOwnerId;
        groupChat = await groupChat.save();
        sendNewMessageInfoToSocketGateway({
            roomId: MESSAGE_CHANNEL.EVENTS.UPDATE_GROUP_CHAT_INFO,
            message: groupChat
        });
    }
    async removeUserFromGroupChat(payloads) {
        const {
            id, currentUser, targetUserId
        } = payloads;
        const { role, userId } = currentUser;
        let groupChat = await GroupChat.findById(id);

        if (!groupChat) {
            throw new BadRequestException('Group chat not exist');
        }
        if (role == ROLES.USER && !groupChat.ownerId.equals(userId)) {
            throw new IncorrectPermission();
        }
        const targetUserIndex = groupChat.participants.findIndex(x => x.userId.equals(targetUserId))
        if (targetUserIndex < 0) {
            throw new BadRequestException('The user target not exist in this group chat');
        }
        groupChat.participants.splice(targetUserIndex, 1);
        groupChat =  await groupChat.save();
        sendNewMessageInfoToSocketGateway({
            roomId: MESSAGE_CHANNEL.EVENTS.UPDATE_GROUP_CHAT_INFO,
            message: groupChat
        });

        return groupChat;
    }
}

module.exports = new MessageService();