require('dotenv').config();

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const socketBuilder = require('./sockets/socket');
const getAuthAndPutCurrentUserAuthToBody = require('./utils/middlewares/getAuthAndPutCurrentUserAuthToBody');
const messageService = require('./services/messageService');
const router = require('./routes');

const PORT = process.env.PORT||3003;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

socketBuilder(io);
messageService.setSocket(io);
app.use(getAuthAndPutCurrentUserAuthToBody);
app.use(process.env.APP_PATH,router);

httpServer.listen(PORT);