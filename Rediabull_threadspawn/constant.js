const redisHost = '10.139.245.109';
const redisPort = 6379;
const queuename1 = 'QUEUE-1';
const queuename2 = 'QUEUE-2';
const queuename3 = 'QUEUE-3';
const queuename4 = 'QUEUE-4';
const queuename5 = 'QUEUE-5';
const queuename6 = 'QUEUE-6'; 
const statusqueuename1 = 'statuses-payload-1'; 
const statusqueuename2 = 'statuses-payload-2'; 
const statusqueuename3 = 'statuses-payload-3'; 
const statusqueuename4 = 'statuses-payload-4'; 
const statusqueuename5 = 'statuses-payload-5'; 
const oldCallbackqueue1 = 'old-callback-payload';
const QUEUE_SIZE = 5;
const SMALL_CAMPAIGN_THRESHOLD = 1000;
const TPS = 400;
const adding_TPS = 600;
const TIME_VAL = 8;

module.exports = {
    redisHost,
    redisPort,
    queuename1,
    queuename2,
    queuename3,
    queuename4,
    queuename5,
    queuename6,
    statusqueuename1,
    statusqueuename2,
    statusqueuename3,
    statusqueuename4,
    statusqueuename5,
    oldCallbackqueue1,
    QUEUE_SIZE,
    SMALL_CAMPAIGN_THRESHOLD,
    TPS,
    adding_TPS,
    TIME_VAL
};