let async = require('async');
let mysql = require('../database/db');
let axios = require('axios');
let http = require('http');
let https = require('https');
let httpUrl = require('url');
let payloads = require('../Queue/payloads');
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const Queue = require('bull');
const Redis = require('ioredis');
const queuename = require('../constant').queuename13;
const redisHost = require('../constant').redisHost;
const redisPort = require('../constant').redisPort;
const TPS = require('../constant').TPS;
const adding_TPS = require('../constant').adding_TPS;
console.log({ queuename });
// const redis = new Redis({
//     redis: {
//         host: '10.139.244.222',
//         port: 6379
//     }
// });

const redis = {
    redis: {
        host: redisHost,
        port: redisPort
    }
};

const { errorLogger, infoLogger } = require('../applogger');
const threadsqueue = new Queue(queuename, redis);
function fetchPlaceholders(placeholders) {
    var placeholderArr = JSON.parse(placeholders);
    var tempArr = [];
    for (var i = 0; i < placeholderArr.length; i++) {
        tempArr.push({
            "type": "text",
            "text": placeholderArr[i] != null ? placeholderArr[i].toString() : ''
        });
    }

    return tempArr;
}

function isMobileInternational(number) {
    if (typeof number == 'undefined' || number.length == 0) {
        return false;
    }

    if (/^\+/.test(number) == false) {
        number = '+' + number;
    }

    var isValid = false;
    try {
        var mobileNumber = phoneUtil.parse(number, '');
        if (phoneUtil.isValidNumber(mobileNumber) && (phoneUtil.getNumberType(mobileNumber) == 1 || phoneUtil.getNumberType(mobileNumber) == 2)) {
            isValid = true;
        }
    } catch (e) {
        errorLogger.error('Invalid Number ' + number);
        errorLogger.error(e);
    }
    return isValid;
}

function getCountryCodeNumeric(number) {
    if (/^\+/.test(number) == false) {
        number = '+' + number;
    }
    var countryCode = '';
    try {
        var mobileNumber = phoneUtil.parse(number, '');
        countryCode = mobileNumber.getCountryCode();
    } catch (e) {
        errorLogger.error('Invalid Number ' + number);
        errorLogger.error(e);
    }
    return countryCode;
}

let getmsgid = (r) => {

    let temp = [];
    for (let i = 0; i < r.length; i++) {
        temp.push(r[i].id);
        if (i == r.length - 1) {
            return temp;
        }
    }
};

module.exports.processCampaign = async (campaignid, contactno, index, TIME_VAL) => {
    try {
        console.log({ index });
        let direction = 1;
        let wabaCountryCode = null;
        let wabaCountryCodeNumeric = null;
        let notificationRate = null;
        let feedbackRate = null;
        let responseRate = null;
        let errormessage = null;
        let errorCode = null;
        let errorDesc = null;
        let template_type = 4;
        let status = 0;
        let submissiontype = "NOTIFICATION";
        let query = null;
        let bodyContent = null;
        let objMsg = null;
        let waMessageId = null;
        let fbtrace_id = null;

        console.log("I am in Thread.js before if");

        if (index == 0) {
            index = 1;
            console.log('THREAD STARTED FOR CAMPAIGNID : ' + campaignid);

            query = "SELECT value AS retry_count FROM ezb_system_config WHERE paramname = 'RETRY_COUNT'";
            let config_result = await mysql.query(query, [1]);

            query = "SELECT CASE WHEN a.template_type = ? THEN b.text_tps ELSE b.media_tps END AS msg_limit, a.contactno" +
                " FROM ezb_wa_campaign_master AS a,ezb_wa_msg_settings AS b" +
                " WHERE a.userid = b.userid AND a.contactno = b.wanumber AND a.campaignid = ?";
            let tps = await mysql.query(query, [template_type, campaignid]);
            config_result[0][0].msg_limit = tps[0][0].msg_limit;
            let tmpContactNo = tps[0][0].contactno;
            let TPS_Payload = (Math.abs(config_result[0][0].msg_limit));
            console.log('TPS ====================>' + JSON.stringify(TPS_Payload));

            // let differenceTPS = parseInt(config_result[0][0].msg_limit) * parseInt(TIME_VAL);
            // let differenceTPS = TPS * parseInt(TIME_VAL);
            let differenceTPS = adding_TPS * parseInt(TIME_VAL);

            // let differenceTPS = 100 * parseInt(TIME_VAL);

            console.log('differenceTPS ====================>' + JSON.stringify(differenceTPS));

            let JobWait = await threadsqueue.getWaiting();
            let getWaitingLength = JobWait.length;
            let campaignIndex = 0;
            console.log({ getWaitingLength });

            query = "SELECT a.*, b.placeholder_template_type, b.button_option, b.button_option_string, b.body_message, b.category, b.head_mediatype FROM" +
                " ezb_message_request_master AS a, ezb_wa_templates AS b" +
                " WHERE a.templateid = b.tempid" +
                " AND a.retrycount < ?" +
                " AND a.issentpicked = ?" +
                " AND (a.retrydt <=NOW() OR a.retrydt IS NULL)" +
                " AND a.campaignid = ?" +
                " LIMIT ?";
            let requestResult = await mysql.query(query, [parseInt(config_result[0][0].retry_count), 0, campaignid, parseInt(differenceTPS)]);
            // console.log(requestResult[0]);
            // console.log('REQUESTRESULT =====================>' + JSON.stringify(requestResult));

            // errorLogger.info('REQUESTRESULT =====================>' + JSON.stringify(requestResult));


            if (requestResult[0].length != 0) {

                let msgIds = await getmsgid(requestResult[0]);
                console.log(msgIds);
                query = "UPDATE ezb_message_request_master SET issentpicked = ? WHERE id IN(?)";
                let updateissentpicked = await mysql.query(query, [1, msgIds]);

                let msgpayloads = await payloads.createpayload(requestResult[0], adding_TPS, contactno);
                // console.log('MESSAGEPAYLOADS ==========>' + JSON.stringify(msgpayloads[0]));
                console.log('MESSAGEPAYLOADS_2 ==========>' + JSON.stringify(msgpayloads));

                // errorLogger.info('MESSAGEPAYLOADS =====================>' + JSON.stringify(msgpayloads));

                let query_1 = "DELETE FROM ezb_message_request_master where id IN (?)";
                console.log('query_1 ==========>' + query_1);
                let deleteid = await mysql.query(query_1, [msgpayloads]);
                console.log('deleteid ==========>' + JSON.stringify(deleteid));

                index = 0;

            } else {
                console.log('No Message Records');
                index = 0;
            }
        }

        console.log('Index outside =====>' + index);
    } catch (error) {
        index = 0;
        console.log('ERROR:' + error);
    }
    // return TPS_Payload;
};