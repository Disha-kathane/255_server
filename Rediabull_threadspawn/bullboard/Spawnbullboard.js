const Queue = require('bull');
const Redis = require('ioredis');
const queuename1 = require('../constant').queuename1;
const queuename2 = require('../constant').queuename2;
const queuename3 = require('../constant').queuename3;
const queuename4 = require('../constant').queuename4;
const queuename5 = require('../constant').queuename5;
const queuename6 = require('../constant').queuename6;
const statusqueuename1 = require('../constant').statusqueuename1;
const statusqueuename2 = require('../constant').statusqueuename2;
const statusqueuename3 = require('../constant').statusqueuename3;
const statusqueuename4 = require('../constant').statusqueuename4;
const statusqueuename5 = require('../constant').statusqueuename5;
const oldCallbackqueue1 = require('../constant').oldCallbackqueue1;
const redisHost = require('../constant').redisHost;
const redisPort = require('../constant').redisPort;

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
const threadsqueue6 = new Queue(queuename6, redis);

const statusthreadsqueue1 = new Queue(statusqueuename1, redis);
const statusthreadsqueue2 = new Queue(statusqueuename2, redis);
const statusthreadsqueue3 = new Queue(statusqueuename3, redis);
const statusthreadsqueue4 = new Queue(statusqueuename4, redis);
const statusthreadsqueue5 = new Queue(statusqueuename5, redis);
const oldcallbackthreadsqueue1 = new Queue(oldCallbackqueue1, redis);

const express = require('express');

const { createBullBoard } = require('bull-board');
const { BullAdapter } = require('bull-board/bullAdapter');


const { router, setQueues, replaceQueues, addQueue, removeQueue } = createBullBoard([
  new BullAdapter(threadsqueue1, { readOnlyMode: true }),
  new BullAdapter(threadsqueue2, { readOnlyMode: true }),
  new BullAdapter(threadsqueue3, { readOnlyMode: true }),
  new BullAdapter(threadsqueue4, { readOnlyMode: true }),
  new BullAdapter(threadsqueue5, { readOnlyMode: true }),
  new BullAdapter(threadsqueue6, { readOnlyMode: true }),
  new BullAdapter(statusthreadsqueue1, { readOnlyMode: true }),
  new BullAdapter(statusthreadsqueue2, { readOnlyMode: true }),
  new BullAdapter(statusthreadsqueue3, { readOnlyMode: true }),
  new BullAdapter(statusthreadsqueue4, { readOnlyMode: true }),
  new BullAdapter(statusthreadsqueue5, { readOnlyMode: true }),
  new BullAdapter(oldcallbackthreadsqueue1, { readOnlyMode: false })
]);

const app = express();

app.use('/queues/', router);

const PORT = 5122;


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Running on http://139.59.92.2:${PORT}/queues/`);
});
