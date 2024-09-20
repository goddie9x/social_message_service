const messageController = require('../controllers/messageController');
const { Router } = require('express');

const messageRouteMapping = (router) => {
    router.post('/inbox', messageController.createNewMessageInbox);
    router.delete('/', messageController.deleteMultipleMessage);
    router.post('/hide', messageController.hideMessage);
    const messageRouter = Router();

    messageRouter.get('/', messageController.getContactListWithPagination);
    messageRouter.get('/messages', messageController.getMessagesInContact);
    messageRouter.get('/:id', messageController.getContactById);
    messageRouter.delete('/:id', messageController.deleteContact);
    router.use('/contacts', messageRouter);
}

module.exports = messageRouteMapping;