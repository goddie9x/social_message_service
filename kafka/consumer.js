const { activeMultipleServiceConsumer, createTopicIfNotExists } = require('@godsocial/utils/kafka/consumer');
const { KAFKA_TOPICS } = require('@godsocial/utils/constants/kafka');
const messageService = require('../services/messageService');
const groupChatService = require('../services/groupChatService');

const activeMessageServiceConsumer = async () => {
    await createTopicIfNotExists([{ topic: KAFKA_TOPICS.MESSAGE_TOPIC.REQUEST }]);
    activeMultipleServiceConsumer({
        serviceInstances: [messageService, groupChatService],
        topic: KAFKA_TOPICS.MESSAGE_TOPIC.REQUEST,
    });
}

module.exports = activeMessageServiceConsumer;
