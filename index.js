require('dotenv').config();

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const socketBuilder = require('./sockets/socket');
const getAuthAndPutCurrentUserAuthToBody = require('./utils/middlewares/getAuthAndPutCurrentUserAuthToBody');
const messageService = require('./services/messageService');
const router = require('./routes');
const connectToDiscoveryServer = require('./utils/configs/discovery');
const mapHealthStatusRoute = require('./utils/eureka/healthStatusRoute');

const PORT = process.env.PORT||3003;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

socketBuilder(io);
app.use(express.json());
app.use(getAuthAndPutCurrentUserAuthToBody);
messageService.setSocket(io);
mapHealthStatusRoute(router);
app.use(process.env.APP_PATH,router);
connectToDiscoveryServer();

httpServer.listen(PORT);