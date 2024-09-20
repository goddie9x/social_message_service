const router = new require('express').Router();
const messageRouteMapping = require('./messageRouteMapping');
const groupChatRouteMapping = require('./groupChatRouteMapping');

messageRouteMapping(router);
groupChatRouteMapping(router);

module.exports = router;