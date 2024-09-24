const messageService = require('../services/messageService');
const groupChatService = require(('../services/groupChatService'));
const BasicController = require('../utils/controllers/basicController');
const bindMethodsWithThisContext = require('../utils/classes/bindMethodsWithThisContext');

class MessageController extends BasicController {
    constructor() {
        super();
        bindMethodsWithThisContext(this);
    }
    async createNewMessageInbox(req, res) {
        try {
            const response = await messageService.createNewMessageInbox(req.body);
            return res.status(201).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
    async createNewMessageInGroupChat(req, res) {
        try {
            const response = await groupChatService.createNewMessageInGroupChat(req.body);
            return res.status(201).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
    async deleteMultipleMessage(req, res) {
        try {
            const payloads = { currentUser: req.body.currentUser, ids: req.body.ids };
            const result = await messageService.deleteMultipleMessage(payloads);

            return res.status(200).json(result);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
    async hideMessage(req, res) {
        try {
            const response = await messageService.hideMessage(req.body);
            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
    async getContactListWithPagination(req, res) {
        try {
            const { currentUser } = req.body;
            const query = {
                ...req.query, $or: [
                    { 'user1.userId': currentUser.userId },
                    { 'user2.userId': currentUser.userId }
                ]
            };
            const response = await messageService.getContactListWithPagination(query);
            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
    async getContactById(req, res) {
        try {
            const payloads = { id: req.params.id, currentUser: req.body.currentUser };
            const response = await messageService.getContactById(payloads);

            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
    async getMessagesInContact(req, res) {
        try {
            const { page, limit, targetId, ...query } = req.query;
            const payloads = {
                currentUser: req.body.currentUser,
                page, limit, targetId,
                query
            }
            const response = await messageService.getListMessageFromContact(payloads);
            return res.status(200).json(response);
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async deleteContact(req, res) {
        try {
            const payloads = { id: req.params.id, currentUser: req.body.currentUser };
            await messageService.deleteContact(payloads);
            res.status(204).json('Delete contact successful');
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
    async deleteGroupChat(req, res) {
        try {
            const payloads = { id: req.params.id, currentUser: req.body.currentUser };
            await groupChatService.deleteGroupChat(payloads);

            res.status(204).json('Delete group chat successful');
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
    async createGroupChat(req, res) {
        try {
            const groupChat = await groupChatService.createGroupChat(req.body);

            return groupChat;
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async getGroupChatListWithPagination(req, res) {
        try {
            const response = await groupChatService.getGroupChatListWithPagination(req.query);
            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }

    async createGroupChat(req, res) {
        try {
            const response = await groupChatService.createGroupChat(req.body);
            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
    async getGroupChatById(req, res) {
        try {
            const payloads = { id: req.params.id, currentUser: req.body.currentUser };
            const response = await groupChatService.getGroupChatById(payloads);

            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
    async getMessagesInGroupChat(req, res) {
        try {
            const { page, limit, targetId, ...query } = req.query;
            const payloads = {
                currentUser: req.body.currentUser,
                page, limit, targetId,
                query
            }
            const response = await groupChatService.getListMessageFromGroupChat(payloads);

            return res.status(200).json(response);
        } catch (error) {
            return this.handleResponseError(res, error);
        }
    }
    async updateGroupChat(req, res) {
        try {
            const payloads = {
                id: req.params.id,
                ...req.body
            };
            
            const response = await groupChatService.updateGroupChat(payloads);

            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
    async changeGroupChatOwner(req, res) {
        try {
            const response = await groupChatService.changeGroupChatOwner(req.body);
            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
    async removeUserFromGroupChat(req, res) {
        try {
            const response = await groupChatService.removeUserFromGroupChat(req.body);
            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
    async addMultipleUserToGroupChat(req, res) {
        try {
            const response = await groupChatService.addMultipleUserToGroupChat(req.body);
            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
}

module.exports = new MessageController();
