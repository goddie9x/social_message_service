const messageService = require('../services/messageService');
const BasicController = require('../utils/controllers/basicController');
const bindMethodsWithThisContext = require('../utils/class/bindMethodsWithThisContext');

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
            const response = await messageService.createNewMessageInGroupChat(req.body);
            return res.status(201).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }

    async deleteMessage(req, res) {
        try {
            const response = await messageService.deleteMessage(req.body);
            return res.status(204).json(response);
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
            const response = await messageService.getContactListWithPagination(req.query);
            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }

    async getGroupChatListWithPagination(req, res) {
        try {
            const response = await messageService.getGroupChatListWithPagination(req.query);
            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }

    async getContactById(req, res) {
        try {
            const response = await messageService.getContactById(req.params);
            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }

    async getGroupChatById(req, res) {
        try {
            const response = await messageService.getGroupChatById(req.params);
            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }

    async updateGroupChat(req, res) {
        try {
            const response = await messageService.updateGroupChat(req.body);
            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }

    async changeGroupChatOwner(req, res) {
        try {
            const response = await messageService.changeGroupChatOwner(req.body);
            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }

    async removeUserFromGroupChat(req, res) {
        try {
            const response = await messageService.removeUserFromGroupChat(req.body);
            return res.status(200).json(response);
        } catch (error) {
            this.handleResponseError(res, error);
        }
    }
}

module.exports = new MessageController();
