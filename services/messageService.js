const BasicService = require('../utils/services/basicService');
const Contact = require('../models/contact');
const Message = require('../models/message');
const { IncorrectPermission, BadRequestException } = require('../utils/exceptions/commonExceptions');
const { ROLES } = require('../utils/constants/users');
const bindMethodsWithThisContext = require('../utils/classes/bindMethodsWithThisContext');
const { sendNewMessageInfoToSocketGateway, sendCreatedContactToSocketGateway, sendHideMessageToSocketGateway, sendUpdateContactToSocketGateway } = require('../kafka/producer');
const { TARGET_TYPE } = require('../utils/constants/communication');
const GroupChat = require('../models/groupChat');
const { validateTargetNotExistThrowException } = require('../utils/validate');

class MessageService extends BasicService {
    constructor() {
        super();
        bindMethodsWithThisContext(this);
    }
    async createNewMessageInbox(payloads) {
        const { targetId, receiverId, currentUser, ...data } = payloads;
        let contact = await Contact.findById(targetId);

        if (!contact && !receiverId) {
            throw new BadRequestException();
        }
        if (!contact) {
            try {
                contact = new Contact({
                    user1: { userId: currentUser.userId },
                    user2: { userId: receiverId },
                });
                contact = await contact.save();
                sendCreatedContactToSocketGateway({
                    roomId: currentUser.userId,
                    message: contact
                });
                sendCreatedContactToSocketGateway({
                    roomId: receiverId,
                    message: contact
                });
            }
            catch (error) {
                throw new BadRequestException('Cannot create contact, please check if the user exist or contact exist between the two user?');
            }
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
            roomId: contact._id.toString(),
            message: newMessage,
        });
        return response;
    }
    async deleteMultipleMessage(payloads) {
        const { ids, currentUser } = payloads;
        const messages = await Message.find({
            sender: currentUser.userId,
            _id: {
                $in: ids
            }
        });
        const listIdDeleted = messages.map(x=>x._id);

        await Message.deleteMany({
            sender: currentUser.userId,
            _id: {
                $in: listIdDeleted
            }
        });
        return listIdDeleted;
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
    async hideMessage(payloads) {
        const { id, currentUser } = payloads;
        const { userId, role } = currentUser;
        const message = await Message.findById(id);

        validateTargetNotExistThrowException(message, 'Message');
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

            sendHideMessageToSocketGateway({
                roomId: messageUpdated._id.toString(),
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
    validateUserCanModifyContact(contact, currentUser) {
        const currentUserId = currentUser.userId;
        if (currentUser.role == ROLES.USER && contact.user1.userId != currentUserId && contact.user2.userId != currentUserId) {
            throw new IncorrectPermission();
        }
    }
    async getContactById(payloads) {
        const { id, currentUser } = payloads;
        const contact = await Contact.findById(id);
        validateTargetNotExistThrowException(contact, 'Contact');
        this.validateUserCanModifyContact(contact, currentUser);
        return contact;
    }
    async deleteContact(payloads) {
        const { currentUser, id } = payloads;
        const contact = await Contact.findById(id);

        validateTargetNotExistThrowException(contact, 'Contact');
        this.validateUserCanModifyContact(contact, currentUser);
        await Message.deleteMany({
            target: {
                targetId: contact._id,
                targetType: TARGET_TYPE.CHAT
            }
        });
        return await contact.deleteOne();
    }
    async getListMessageFromContact(payloads) {
        const { currentUser, targetId } = payloads;
        const contact = await Contact.findById(targetId);

        validateTargetNotExistThrowException(contact, 'Contact');
        this.validateUserCanModifyContact(contact, currentUser);

        return await this.getListMessageInContactByQuery({ ...payloads, targetType: TARGET_TYPE.CHAT });
    }
    validateUserCanGetMessagesInContact(targetId, currentUser) {
        const contact = Contact.findById(targetId);
        console.log('151');
        validateTargetNotExistThrowException(contact, 'Contact');
        console.log('153');
        this.validateUserCanModifyContact(contact, currentUser);
    }
    async getListMessageInContactByQuery(payloads) {
        const { page, limit, targetId, targetType, query = {} } = payloads;

        const queryObject = {
            ...query,
            'target.targetId': targetId,
            'target.targetType': targetType
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
}

module.exports = new MessageService();