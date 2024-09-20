const { sendNewMessageToSocketGateway } = require('../utils/kafka/producer');
const { MESSAGE_CHANNEL } = require('../utils/constants/socketChannel');

const sendNewMessageInfoToSocketGateway = ({ message, roomId }) => {
    sendNewMessageToSocketGateway({
        namespace: MESSAGE_CHANNEL.NAMESPACE,
        message,
        roomId,
        event: MESSAGE_CHANNEL.EVENTS.NEW_MESSAGE
    });
};

const sendHideMessageToSocketGateway = ({ message, roomId }) => {
    sendNewMessageToSocketGateway({
        namespace: MESSAGE_CHANNEL.NAMESPACE,
        message,
        roomId,
        event: MESSAGE_CHANNEL.EVENTS.HIDE_MESSAGE
    });
};
const sendCreatedContactToSocketGateway = ({ message, roomId }) => {
    sendNewMessageToSocketGateway({
        namespace: MESSAGE_CHANNEL.NAMESPACE,
        message,
        roomId,
        event: MESSAGE_CHANNEL.EVENTS.CONTACT_CREATED
    });
};
const sendCreatedGroupChatToSocketGateway = ({ message, roomId }) => {
    sendNewMessageToSocketGateway({
        namespace: MESSAGE_CHANNEL.NAMESPACE,
        message,
        roomId,
        event: MESSAGE_CHANNEL.EVENTS.GROUP_CHAT_CREATED
    });
};
const sendUpdateContactToSocketGateway = ({ message, roomId }) => {
    sendNewMessageToSocketGateway({
        namespace: MESSAGE_CHANNEL.NAMESPACE,
        message,
        roomId,
        event: MESSAGE_CHANNEL.EVENTS.UPDATE_CONTACT_INFO
    });
}

const sendUpdateGroupChatToSocketGateway = ({ message, roomId }) => {
    sendNewMessageToSocketGateway({
        namespace: MESSAGE_CHANNEL.NAMESPACE,
        message,
        roomId,
        event: MESSAGE_CHANNEL.EVENTS.UPDATE_GROUP_CHAT_INFO
    });
};

module.exports = {
    sendNewMessageInfoToSocketGateway,
    sendHideMessageToSocketGateway,
    sendCreatedContactToSocketGateway,
    sendCreatedGroupChatToSocketGateway,
    sendUpdateGroupChatToSocketGateway,
    sendUpdateContactToSocketGateway,
};