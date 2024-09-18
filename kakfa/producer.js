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
    sendUpdateGroupChatToSocketGateway,
};