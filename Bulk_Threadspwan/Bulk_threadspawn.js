const schedule = require('node-schedule');
const async = require('async');
const mysql = require('./database/db');
let threads = require('./Threads');
const { exec } = require('child_process');
const semaphore = require('semaphore');
const sem = semaphore(1);

let index = 0;

schedule.scheduleJob('m-job', '* * * * * *', async () => {

  await sem.take(async () => {
    if (index == 0) {
      index = 1;
      let query = "Select userid, templateid, contactno from ezb_message_request_master where campaignid = ? AND issentpicked != ? and uuid is not null group by userid,contactno";
      let userResult = await mysql.query(query, [0, 2]);

      // console.log('userResult:' + JSON.stringify(userResult));
      if (userResult[0].length === 0) {
        console.log('NO RECORDS AS OF NOW');
        index = 0;
      } else {
        for (let i = 0; i < userResult[0].length; i++) {
          let userid = userResult[0][i].userid;
          let template_id = userResult[0][i].templateid;
          let contactno = userResult[0][i].contactno;

          // console.log({ userid }, { template_id }, { contactno });
          await threads.processCampaign(userid, template_id, contactno, 0);
        }
        index = 0;
      }
      await sem.leave();
    }
  });
});