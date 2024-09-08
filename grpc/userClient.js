const grpc = require('@grpc/grpc-js');

const userProto = require('../generated/user_grpc_pb');
const userMessages = require('../generated/user_pb');
const { getListUserByIdsGRPCGenerate } = require('../utils/grpc/user');

const userServiceClient = new userProto.UserServiceClient(process.env.USER_SERVICE_GRPC_ADDRESS || 'localhost:50051',
    grpc.credentials.createInsecure());

const getListUserByIds = getListUserByIdsGRPCGenerate({ userServiceClient, userMessages });

module.exports = {
    userServiceClient,
    userMessages,
    getListUserByIds
};