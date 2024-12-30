let async = require('async');
let mysql = require('./database/db');
let axios = require('axios');
let http = require('http');
let https = require('https');
let httpUrl = require('url');
let payloads = require('./payloads');
let proxy = require('./proxy');
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const { errorLogger, infoLogger } = require('./applogger');
let qs = require('qs');


// let index = 0;
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


const getTPSData = async (contactno) => {
    let wanumber = contactno.replace(/\+/g, '');
    let msgDetailsUrl = 'https://partners.pinbot.ai/v1/msgsettingdetails';
    var data = qs.stringify("");
    var config = {
        method: 'post',
        url: msgDetailsUrl,
        headers: {
            'wanumber': wanumber,
            'Content-Type': 'application/json'
        },
        data: data
    };

    var protocol = httpUrl.parse(msgDetailsUrl).protocol;
    if (protocol != null && protocol == "https:") {
        config.httpsAgent = new https.Agent({
            keepAlive: false,
            rejectUnauthorized: false,
            secureProtocol: 'TLSv1_2_method'
        }); //secureProtocol: 'TLSv1_method'
    } else {
        config.httpAgent = new http.Agent({
            keepAlive: false,
            rejectUnauthorized: false,
            // secureProtocol: 'TLSv1_2_server_method'
        }); //secureProtocol: 'TLSv1_method'
    }

    try {
        let tpsResult = await axios(config);
        // console.log('tpsResult.data================' + JSON.stringify(tpsResult.data));
        return tpsResult.data;
    } catch (err) {
        console.log('getTPSData error : ' + err);
        // console.log(err);
        return err;
    }
};


module.exports.processCampaign = async (userid, template_id, contactno, index) => {
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
    let tps = null;

    if (index == 0) {
        index = 1;
        console.log('THREAD STARTED FOR USERID : ' + userid);



        query = "SELECT value AS retry_count FROM ezb_system_config WHERE paramname = 'RETRY_COUNT'";
        let config_result = await mysql.query(query, [1]);

        query = "select head_temptype from ezb_wa_templates where tempid = ?";
        let temptype = await mysql.query(query, [template_id]);
        // console.log('TEMPLATETYPE :' + JSON.stringify(temptype));


        getTps = await getTPSData(contactno);
        // console.log("getTps===>", getTps);

        var MSG_LIMIT = null;


        // if (temptype[0][0].head_temptype == 1) {
        //     MSG_LIMIT = getTps.media_tps;
        // }
        // else {
        //     MSG_LIMIT = getTps.text_tps;
        // }


        if (!temptype || !temptype[0] || !temptype[0][0]) {
            MSG_LIMIT = getTps.text_tps;
            // console.log('in this if')
        } else if (temptype[0][0].head_temptype == 1) {
            MSG_LIMIT = getTps.media_tps;
        } else {
            MSG_LIMIT = getTps.text_tps;
        }

        // console.log('TPS :' + JSON.stringify(MSG_LIMIT));

        if (MSG_LIMIT === undefined) {

            query = "Update ezb_message_request_master SET retrycount = ?,issentpicked = ? where contactno = ?";
            let updateretrycount = await mysql.query(query, [5, 2, contactno]);
            // console.log('updateretrycount ==========>' + JSON.stringify(updateretrycount));

        } else {

            query = "SELECT a.*, b.placeholder_template_type, b.button_option, b.button_option_string, b.body_message, b.category FROM" +
                " ezb_message_request_master AS a, ezb_wa_templates AS b" +
                " WHERE a.templateid = b.tempid" +
                " AND a.retrycount < ?" +
                " AND a.issentpicked = ?" +
                " AND a.userid = ?" +
                " AND (a.retrydt <=NOW() OR a.retrydt IS NULL)" +
                " LIMIT ?";
            let requestResult = await mysql.query(query, [parseInt(config_result[0][0].retry_count), 0, userid, parseInt(MSG_LIMIT)]);
            console.log('REQUESTRESULT =====================>' + JSON.stringify(requestResult[0]));
            // errorLogger.info('REQUESTRESULT =====================>' + JSON.stringify(requestResult));


            if (requestResult[0].length != 0) {

                let msgIds = await getmsgid(requestResult[0]);
                console.log({ msgIds });
                query = "UPDATE ezb_message_request_master SET issentpicked = ? WHERE id IN(?)";
                let updateissentpicked = await mysql.query(query, [1, msgIds]);

                let msgpayloads = await payloads.createpayload(requestResult[0]);
                console.log('msgpayloads ==========>' + JSON.stringify(msgpayloads));
                // errorLogger.info('MESSAGEPAYLOADS =====================>' + JSON.stringify(msgpayloads));

                let sendpayloads = await proxy.sendmessage(msgpayloads);
                // errorLogger.info('SENDPAYLOADS =====================>' + JSON.stringify(sendpayloads));
                console.log('sendpayloads ==========>' + JSON.stringify(sendpayloads));
                index = 0;

            } else {
                console.log('No Message Records');
                index = 0;
            }
        }
    }
};
