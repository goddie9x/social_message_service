const router = new require('express').Router();
const messageRouteMapping = require('./messageRouteMapping');

messageRouteMapping(router);

module.exports = router;