const schedule = require('node-schedule');
const async = require('async');
const mysql = require('../database/db');
let threads = require('../Queue/Threads');
const { exec } = require('child_process');
const semaphore = require('semaphore');
const queuename = require('../constant').queuename13;
const sem = semaphore(1);
let index = 0;
let TIME_VAL = 10;

schedule.scheduleJob('m-job', '*/' + TIME_VAL + ' * * * * *', async () => {

    await sem.take(async () => {
        if (index == 0) {
            index = 1;
            // let query = 'SELECT distinct(campaignid),contactno FROM ezb_wa_campaign_master WHERE campaign_status = ? AND  phone_number_id != ? GROUP BY contactno';
            // let query = "Select distinct(campaignid),contactno from ezb_wa_campaign_master where phone_numberid != ? and campaign_status = ? and  contactno != '+917066000692' GROUP BY contactno";
            let query = "Select distinct(campaignid),contactno from ezb_wa_campaign_master where phone_numberid != ? and campaign_status = ? and contactno = '"+queuename+"' GROUP BY contactno";

            let campaignResult = await mysql.query(query, [0, 1]);
            console.log('campaignResult ==========>' + JSON.stringify(campaignResult));

            if (campaignResult[0].length === 0) {
                console.log('NO RUNNING CAMPAIGN AS OF NOW');
                index = 0;
            } else {
                for (let i = 0; i < campaignResult[0].length; i++) {
                    let campaignid = campaignResult[0][i].campaignid;
                    let contactno = campaignResult[0][i].contactno;
                    console.log('campaignid' + campaignid);

                    // const tempQueue = await parallelQueue.getInstance(contactno, campaignid)
                    // await threads.processCampaign(campaignid, contactno, 0, tempQueue);
                    let threadfunction = await threads.processCampaign(campaignid, contactno, 0, TIME_VAL);
                    console.log('threadfunction ==========>' + JSON.stringify(threadfunction));

                }
                index = 0;
            }
            await sem.leave();
        }
    });
});