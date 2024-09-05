const mongoose = require('../configs/database');
const { getListUserByIds } = require('../grpc/userClient');

const Schema = mongoose.Schema;

const GroupChatSchema = new Schema({
    name: {
        type: String
    },
    ownerId: { type: Schema.Types.ObjectId, required: true },
    avatarUrl: {
        type: String
    },
    participants: [{
        userId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        nickname: {
            type: String,
            trim: true
        },
        avatarUrl: {
            type: String,
            trim: true
        }
    }],
    defaultEmotion: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

GroupChatSchema.index({ 'participants.userId': 1 });

GroupChatSchema.pre('save', async function (next) {
    try {
        if (new Set(this.participants).size !== this.participants.length) {
            throw new BadRequestException('Both user are the same');
        }
        const participantUserIds = this.participants.map(user => user.userId);
        const response = await getListUserByIds(participantUserIds);
        const users = response?.users;

        if (!response || !users || users.length != participantUserIds.length) {
            throw new TargetNotExistException('Some participants not exist');
        }
        users.forEach(user=>{
            const participantIndex = this.participants.findIndex(x=>x.userId == user.id);
            this.participants[participantIndex].avatarUrl = user.avatarUrl;
        });
        next();
    }
    catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('GroupChat', GroupChatSchema);
