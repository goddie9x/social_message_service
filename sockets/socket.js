const authSocketMiddleware = require('../utils/middlewares/authSocketMiddleware');
const { NEW_MESSAGE } = require('../constants/message');

const socketBuilder = (io) => {
    io.use(authSocketMiddleware);
    io.on('connection', socket => {
        socket.join(NEW_MESSAGE(socket.currentUser.userId));
    });
};

module.exports = socketBuilder;