let mysql = require('../database/db');
let payloads = require('../Queue/payloads');
const queuename = require('../constant').queuename1;
const adding_TPS = require('../constant').adding_TPS;
const { errorLogger, infoLogger } = require('../applogger');

console.log({ queuename });

let getmsgid = (r) => {

    let temp = [];
    for (let i = 0; i < r.length; i++) {
        temp.push(r[i].id);
        if (i == r.length - 1) {
            return temp;
        }
    }
};

module.exports.processCampaign = async (campaignid, contactno, index, TIME_VAL, msgcount) => {
    try {
        console.log({ index });
        let query = null;

        console.log("I am in Thread.js before if");

        if (index == 0) {
            index = 1;
            console.log('THREAD STARTED FOR CAMPAIGNID : ' + campaignid);

            let differenceTPS = adding_TPS * parseInt(TIME_VAL);

            console.log('differenceTPS ====================>' + JSON.stringify(differenceTPS));

            query = "SELECT a.*, b.placeholder_template_type, b.button_option, b.button_option_string, b.body_message, b.category, b.head_mediatype FROM" +
                " ezb_message_request_master AS a, ezb_wa_templates AS b" +
                " WHERE a.templateid = b.tempid" +
                " AND a.issentpicked = ?" +
                " AND a.campaignid = ?" +
                " LIMIT ?";
            let requestResult = await mysql.query(query, [0, campaignid, parseInt(differenceTPS)]);
            if (requestResult[0].length != 0) {
                
                let msgIds = await getmsgid(requestResult[0]);
                console.log(msgIds);

                query = "UPDATE ezb_message_request_master SET issentpicked = ? WHERE id IN(?)";
                let updateissentpicked = await mysql.query(query, [1, msgIds]);
                console.log('updateissentpicked ==========>' + JSON.stringify(updateissentpicked));

                let msgpayloads = await payloads.createpayload(requestResult[0], adding_TPS, contactno, msgcount);
                console.log('MESSAGEPAYLOADS_2 ==========>' + JSON.stringify(msgpayloads));
                // errorLogger.info('MESSAGEPAYLOADS_2 ==========>' + JSON.stringify(msgpayloads));

                // let query_1 = "DELETE FROM ezb_message_request_master where id IN (?)";
                // console.log('query_1 ==========>' + query_1);
                // let deleteid = await mysql.query(query_1, [msgpayloads]);
                // console.log('deleteid ==========>' + JSON.stringify(deleteid));

                query_1 = null;
                deleteid = null;
                msgpayloads = null;
                msgIds = null;
                index = 0;

            } else {
                console.log('No Message Records');
                index = 0;
            }
            requestResult = null;
            differenceTPS = null;
        }

        console.log('Index outside =====>' + index);
        query = null;
    } catch (error) {
        index = 0;
        console.log(error);
        console.log('ERROR:' + error);
    }
};