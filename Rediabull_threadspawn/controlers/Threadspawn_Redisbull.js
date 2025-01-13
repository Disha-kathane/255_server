const schedule = require('node-schedule');
const mysql = require('../database/db');
let threads = require('../Queue/Threads');
const semaphore = require('semaphore');
const sem = semaphore(1);
let index = 0;
let TIME_VAL = require('../constant').TIME_VAL;

schedule.scheduleJob('m-job', '*/' + TIME_VAL + ' * * * * *', async () => {

    await sem.take(async () => {
        if (index == 0) {
            index = 1;

            let query = "Select distinct(campaignid),msgcount from ezb_wa_campaign_master where phone_numberid != ? and campaign_status = ? and userid NOT IN(1344,1257,1349) GROUP BY contactno";
            let campaignResult = await mysql.query(query, [0, 1]);
            console.log('campaignResult ==========>' + JSON.stringify(campaignResult));

            if (campaignResult[0].length === 0) {
                console.log('NO RUNNING CAMPAIGN AS OF NOW');
                index = 0;
            } else {
                for (let i = 0; i < campaignResult[0].length; i++) {
                    let campaignid = campaignResult[0][i].campaignid;
                    let contactno = campaignResult[0][i].contactno;
                    let msgcount = campaignResult[0][i].msgcount;
                    console.log('campaignid' + campaignid);

                    let threadfunction = await threads.processCampaign(campaignid, contactno, 0, TIME_VAL, msgcount);
                    console.log('threadfunction ==========>' + JSON.stringify(threadfunction));
                    campaignid = null;
                    contactno = null;
                    msgcount = null;
                }
                index = 0;
            }
            query = null;
            campaignResult = null;
            await sem.leave();
        }
    });
});