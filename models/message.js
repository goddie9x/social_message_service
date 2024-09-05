const mongoose = require('../configs/database');
const CommunicationSchema = require('../utils/models/communication');

const Schema = mongoose.Schema;

const MessageSchema = new Schema();

MessageSchema.add(CommunicationSchema);

MessageSchema.index({ sender: 1, target: 1, createdAt: -1, isGroup: 1 });

MessageSchema.index({ target: 1, sender: 1, createdAt: -1, isGroup: 1  });

module.exports = mongoose.model('Messages', MessageSchema);