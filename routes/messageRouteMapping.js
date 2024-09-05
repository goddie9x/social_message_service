const messageController = require('../controllers/messageController');

const messageRouteMapping = (router) => {
    router.post('/messages/inbox', messageController.createNewMessageInbox);
    router.post('/messages/group', messageController.createNewMessageInGroupChat);
    router.delete('/messages/:id', messageController.deleteMessage);
    router.post('/messages/:id/hide', messageController.hideMessage);
    router.get('/contacts', messageController.getContactListWithPagination);
    router.get('/group-chats', messageController.getGroupChatListWithPagination);
    router.get('/contacts/:id', messageController.getContactById);
    router.get('/group-chats/:id', messageController.getGroupChatById);
    router.put('/group-chats/:id', messageController.updateGroupChat);
    router.put('/group-chats/:id/owner', messageController.changeGroupChatOwner);
    router.put('/group-chats/:id/remove-user', messageController.removeUserFromGroupChat);
}

module.exports = messageRouteMapping;