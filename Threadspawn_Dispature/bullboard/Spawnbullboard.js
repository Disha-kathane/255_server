const Queue = require('bull');
const Redis = require('ioredis');
const queuename1 = require('../constant').queuename1;
const queuename2 = require('../constant').queuename2;
const queuename3 = require('../constant').queuename3;
const queuename4 = require('../constant').queuename4;
const queuename5 = require('../constant').queuename5;
const redisHost = require('../constant').redisHost;
const redisPort = require('../constant').redisPort;

// const redis = new Redis({
//   redis: {
//     host: '10.139.244.222',
//     port: 6379
//   }
// });

const redis = {
  redis: {
    host: redisHost,
    port: redisPort
  }
};

const threadsqueue1 = new Queue(queuename1, redis);
const threadsqueue2 = new Queue(queuename2, redis);
const threadsqueue3 = new Queue(queuename3, redis);
const threadsqueue4 = new Queue(queuename4, redis);
const threadsqueue5 = new Queue(queuename5, redis);
const businessQueue = new Queue('businesses-payload', redis);
const contactsQueue = new Queue('contacts-payload', redis);
const statusQueue = new Queue('statuses-payload', redis);
const customCallbackQueue = new Queue('custom-callback-payload', redis);

const express = require('express');

const { createBullBoard } = require('bull-board');
const { BullAdapter } = require('bull-board/bullAdapter');


const { router, setQueues, replaceQueues, addQueue, removeQueue } = createBullBoard([
  new BullAdapter(threadsqueue1, { readOnlyMode: true }),
  new BullAdapter(threadsqueue2, { readOnlyMode: true }),
  new BullAdapter(threadsqueue3, { readOnlyMode: true }),
  new BullAdapter(threadsqueue4, { readOnlyMode: true }),
  new BullAdapter(threadsqueue5, { readOnlyMode: true }),
  new BullAdapter(businessQueue, { readOnlyMode: true }),
  new BullAdapter(contactsQueue, { readOnlyMode: true }),
  new BullAdapter(statusQueue, { readOnlyMode: true }),
  new BullAdapter(customCallbackQueue, { readOnlyMode: true })
]);

const app = express();

app.use('/queues/', router);

const PORT = 5122;


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Running on http://143.110.190.3:${PORT}/queues/`);
});