const proxy = require('../Processor/sendmessage_1');
const async = require('async');
const Queue = require('bull');
let httpUrl = require('url');
let axios = require('axios');
let http = require('http');
let https = require('https');
let mysql = require('../database/db');
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const Redis = require('ioredis');
const queuename = require('../constant').queuename13;
const redisHost = require('../constant').redisHost;
const redisPort = require('../constant').redisPort;
const TPS = require('../constant').TPS;
const { errorLogger, infoLogger } = require('../applogger');

const createRedisConnection = () => {
    // Create a Redis connection
    const redisConnection = new Redis({
        host: redisHost,
        port: redisPort,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
    });

    redisConnection.on('connect', () => {
        console.log('redis is connected');
        setInterval(() => {
            redisConnection.ping(function (err, result) {
                console.log(result + ' at ' + new Date());
            });
        }, 10000);
    });

    // Handle Redis connection errors
    redisConnection.on('error', (error) => {
        console.error('Redis Connection Error:', error);

        // Retry the connection after a delay (e.g., 5 seconds)
        setTimeout(() => {
            console.log('Retrying Redis connection...');
            createRedisConnection(); // Recursively retry the connection
        }, 5000); // 5 seconds delay, you can adjust this value
    });


    return redisConnection;
};

const redisConnection = createRedisConnection();

// const threadsqueue = new Queue(queuename, {
//     createClient: () => redisConnection,
// });

const redis = {
    redis: {
        host: redisHost,
        port: redisPort
    }
};

const threadsqueue = new Queue(queuename, redis);

threadsqueue.process(TPS, async (job, done) => {

    console.log('Running task in Processor');
    proxy.sendmessage(job, done);
});

threadsqueue
    .on('error', function (error) {
    })
    .on('waiting', function (jobId) {
        console.log('Queue in Waiting');
    })
    .on('active', function (jobId, error) {
        console.log('Queue in Active');

    })
    .on('stalled', function (jobId) {
        console.log('Queue in Stalled');

    })
    .on('progress', function (job, progress) {
        console.log('Queue in Progress');
    })
    .on('completed', async function (job, result) {
        console.log('Queue in completed');

        // await job.remove();

        await threadsqueue.clean('completed').then(() => console.log('Completed Jobs from Thread payload has been removed...'));
    })
    .on('failed', async function (job, err) {
        console.log('Queue in Failed job id : ' + JSON.stringify(job.id) + ', with Error : ' + err);


        let objMsg = job.data.objMsg;
        let waMessageId = null;
        let fbtrace_id = null;
        let status = null;
        let errormessage = null;
        let errorCode = null;
        let errorDesc = null;
        let direction = 1;
        let wabaCountryCode = null;
        let wabaCountryCodeNumeric = null;
        let notificationRate = null;
        let feedbackRate = null;
        let responseRate = null;
        let submissiontype = "NOTIFICATION";
        let id = null;


        let RetryCount = job.attemptsMade;
        console.log({ RetryCount });

        let tempJob = job;
        errormessage = err.response != undefined ? err.response.data.error.message : job.failedReason;
        fbtrace_id = err.response != undefined ? err.response.data.error.fbtrace_id : null;
        errorCode = err.response != undefined ? err.response.data.error.code : null;
        console.log({ errormessage });
        console.log({ fbtrace_id });
        console.log({ errorCode });
        let previousJob = job.opts.previousJobId;
        console.log({ previousJob });

        const Joboptions = {
            attempts: 5,
            delay: 900000,
            jobId: tempJob.data.mid.id,
            previousJobId: job.id
        };

        console.log('I am here after joboptions');

        if (previousJob != undefined && RetryCount == 5) {

            query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount,retrydt)" +
                " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,NOW())";
            let retrysentmaster = await mysql.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errormessage, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, job.data.bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, 5]);
            console.log('RETRYSENTMASTER ====================>' + JSON.stringify(retrysentmaster), JSON.stringify(job.id));
            errorLogger.info('RETRYSENTMASTER =====================>' + JSON.stringify(retrysentmaster));

            await job.remove();

            let tempPreviousJob = await threadsqueue.getJob(job.opts.previousJobId);
            await tempPreviousJob?.remove();
        }
        else {
            await threadsqueue.add(tempJob.data, Joboptions).then(async (newlyaddedjob) => {
                console.log('Added to Queue job id : ' + JSON.stringify(newlyaddedjob.id));
            });
        }

        await threadsqueue.clean(86400 * 1000, 'failed').then(() => console.log('Failed Jobs older then 24 hours from Thread payload has been removed...'));
    })
    .on('paused', function () {
        console.log('Queue in paused');

    })
    .on('resumed', function (job) {
        console.log('Queue in Resumed');

    })
    .on('cleaned', function (jobs, type) {
        console.log('Queue in Cleaned');

    })
    .on('drained', async function () {
        console.log('Queue in drained');

    })
    .on('removed', async function (job) {
        console.log('Queue is removed ======================' + JSON.stringify(job.id));
    });

console.log('THREADS PROCESSOR');
