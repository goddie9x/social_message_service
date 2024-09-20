const { Router } = require('express');
const messageController = require('../controllers/messageController');

const groupChatRouteMapping = (router) => {
    const groupChatRouter = Router();

    groupChatRouter.post('/inbox', messageController.createNewMessageInGroupChat);
    groupChatRouter.post('/create', messageController.createGroupChat);
    groupChatRouter.get('/messages', messageController.getMessagesInGroupChat);
    groupChatRouter.get('/', messageController.getGroupChatListWithPagination);
    groupChatRouter.get('/:id', messageController.getGroupChatById);
    groupChatRouter.put('/change-owner', messageController.changeGroupChatOwner);
    groupChatRouter.put('/remove-user', messageController.removeUserFromGroupChat);
    groupChatRouter.put('/add', messageController.addMultipleUserToGroupChat);
    groupChatRouter.put('/:id', messageController.updateGroupChat);
    groupChatRouter.delete('/:id', messageController.deleteGroupChat);
    router.use('/group-chats', groupChatRouter);
}

module.exports = groupChatRouteMapping;