const { activeServiceConsumer, createTopicIfNotExists } = require('../utils/kafka/consumer');
const { kafkaClient } = require('../utils/kafka/producer');
const { KAFKA_TOPICS } = require('../utils/constants/kafka');
const messageService = require('../services/messageService');

const activeMessageServiceConsumer = async ()=>{
    await createTopicIfNotExists({
        topic: KAFKA_TOPICS.MESSAGE_TOPIC.REQUEST,
        client: kafkaClient,
    });
    activeServiceConsumer({
        serviceInstance: messageService,
        topic: KAFKA_TOPICS.MESSAGE_TOPIC.REQUEST,
    });
}

module.exports = activeMessageServiceConsumer;
