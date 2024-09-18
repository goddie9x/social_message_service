const messageController = require('../controllers/messageController');

const messageRouteMapping = (router) => {
    router.post('/inbox', messageController.createNewMessageInbox);
    router.post('/group', messageController.createNewMessageInGroupChat);
    router.delete('/:id', messageController.deleteMessage);
    router.post('/:id/hide', messageController.hideMessage);
    router.get('/contacts', messageController.getContactListWithPagination);
    router.get('/contacts/messages', messageController.getMessagesInContact);
    router.get('/contacts/:id', messageController.getContactById);
    router.get('/group-chats', messageController.getGroupChatListWithPagination);
    router.get('/group-chats/:id', messageController.getGroupChatById);
    router.get('/group-chats/messages', messageController.getMessagesInGroupChat);
    router.put('/group-chats/:id', messageController.updateGroupChat);
    router.put('/group-chats/:id/owner', messageController.changeGroupChatOwner);
    router.put('/group-chats/:id/remove-user', messageController.removeUserFromGroupChat);
}

module.exports = messageRouteMapping;