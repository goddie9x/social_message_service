const mongoose = require('../configs/database');
const { getListUserByIds } = require('../grpc/userClient');
const { BadRequestException, TargetNotExistException } = require('../utils/exceptions/commonExceptions');

const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    user1: {
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
    },
    user2: {
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
    },
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
    },
    backgroundUrl: {
        type: String
    }
});

ContactSchema.index(
    {
        'user1.userId': 1,
        'user2.userId': 1
    },
    {
        unique: true
    }
);

ContactSchema.pre('save', async function (next) {
    try {
        if (this.user1.userId == this.user2.userId) {
            throw new BadRequestException('Both user are the same');
        }
        const response = await getListUserByIds([this.user1.userId,this.user2.userId]);

        users = response?.users;
        if (!response||!users||users?.length<2) {
            throw new TargetNotExistException('User not exist');
        }
        this.user1.avatarUrl = users.find(x=>x.id==this.user1.userId).avatarUrl;
        this.user2.avatarUrl = users.find(x=>x.id==this.user2.userId).avatarUrl;
        next();
    }
    catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Contact', ContactSchema);