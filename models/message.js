const mongoose = require('../configs/database');
const CommunicationSchema = require('../utils/models/communication');

const Schema = mongoose.Schema;

const MessageSchema = new Schema();

MessageSchema.add(CommunicationSchema);

MessageSchema.index({ 'target.targetId': 1, 'target.targetType': 1, sender: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, 'target.targetId': 1, 'target.targetType': 1, createdAt: -1 });

module.exports = mongoose.model('Messages', MessageSchema);