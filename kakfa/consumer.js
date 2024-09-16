const { activeServiceConsumer, createTopicIfNotExists } = require('../utils/kafka/consumer');
const { KAFKA_TOPICS } = require('../utils/constants/kafka');
const messageService = require('../services/messageService');

const activeMessageServiceConsumer = async () => {
    await createTopicIfNotExists([{ topic: KAFKA_TOPICS.MESSAGE_TOPIC.REQUEST }]);
    activeServiceConsumer({
        serviceInstance: messageService,
        topic: KAFKA_TOPICS.MESSAGE_TOPIC.REQUEST,
    });
}

module.exports = activeMessageServiceConsumer;
