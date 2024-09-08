const authSocketMiddleware = require('../utils/middlewares/authSocketMiddleware');
const { SOCKET_CHANNEL } = require('../constants/message');

const socketBuilder = (io) => {
    io.use(authSocketMiddleware);
    io.on('connection', socket => {
        socket.join(SOCKET_CHANNEL.NEW_MESSAGE(socket.currentUser.userId));
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};

module.exports = socketBuilder;