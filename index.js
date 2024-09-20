require('dotenv').config();

const express = require('express');
const { createServer } = require('http');
const getAuthAndPutCurrentUserAuthToBody = require('./utils/middlewares/getAuthAndPutCurrentUserAuthToBody');
const router = require('./routes');
const connectToDiscoveryServer = require('./utils/configs/discovery');
const mapHealthStatusRoute = require('./utils/eureka/healthStatusRoute');
const activeMessageServiceConsumer = require('./kafka/consumer');

const PORT = process.env.PORT||3003;
const app = express();
const httpServer = createServer(app);

activeMessageServiceConsumer();
app.use(express.json());
app.use(getAuthAndPutCurrentUserAuthToBody);
mapHealthStatusRoute(router);
app.use(process.env.APP_PATH,router);
connectToDiscoveryServer();

httpServer.listen(PORT);