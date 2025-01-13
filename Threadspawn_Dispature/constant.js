const redisHost = '10.139.245.109';
const redisPort = 6379;
const queuename1 = 'QUEUE-1';
const queuename2 = 'QUEUE-2';
const queuename3 = 'QUEUE-3';
const queuename4 = 'QUEUE-4';
const queuename5 = 'QUEUE-5';
const queuename6 = 'QUEUE-6';
const TPS = 100;
const GENERAL_TPS = 80;
const adding_TPS = 600;
const FAILED_QUEUE_PERIOD = 10000;
const RETRYCOUNT = 10;
const RETRYDURATION = 900000;

module.exports = {
    redisHost,
    redisPort,
    queuename1,
    queuename2,
    queuename3,
    queuename4,
    queuename5,
    queuename6,
    TPS,
    GENERAL_TPS,
    adding_TPS,
    FAILED_QUEUE_PERIOD,
    RETRYCOUNT,
    RETRYDURATION
};