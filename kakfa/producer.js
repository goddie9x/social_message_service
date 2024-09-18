const { sendNewMessageToSocketGateway } = require('../utils/kafka/producer');
const { MESSAGE_CHANNEL } = require('../utils/constants/socketChannel');

const sendNewMessageInfoToSocketGateway = ({message,roomId})=>{
    sendNewMessageToSocketGateway({
        namespace: MESSAGE_CHANNEL.NAMESPACE,
        message,
        roomId,
        event: MESSAGE_CHANNEL.EVENTS.NEW_MESSAGE
    });
};

module.exports = {
    sendNewMessageInfoToSocketGateway
}