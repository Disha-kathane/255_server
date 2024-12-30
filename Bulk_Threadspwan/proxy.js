let httpUrl = require('url');
let axios = require('axios');
let http = require('http');
let https = require('https');
let async = require('async');
let mysql = require('./database/db');
let mysql1 = require('./database/db1');
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const { errorLogger, infoLogger } = require('./applogger');

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

module.exports.sendmessage = async (mid) => {

    for (let m = 0; m < mid.length; m++) {
        console.log('mid[m] =========================>' + JSON.stringify(mid[m]));

        // console.log("mid[m].mid.id(outside catch)===============>", mid[m].mid.id)

        let query = null;
        let values = null;

        mid[m].mid.mobileno = mid[m].mid.mobileno.replace(/\+/g, '');
        mid[m].mid.mobileno = mid[m].mid.mobileno.replace(/\'/g, '');
        mid[m].mid.mobileno = mid[m].mid.mobileno.replace(/\ /g, '');
        mid[m].mid.mobileno = mid[m].mid.mobileno.replace(/\-/g, '');
        mid[m].mid.mobileno = mid[m].mid.mobileno.replace(/\//g, '');

        console.log("mid[m] ygfufvgu is the adding biz_opaque_callback_data --------------------------------------->", mid[m].biz_opaque_callback_data)
        let objMsg = mid[m].objMsg;
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

        if (mid[m].biz_opaque_callback_data !== null) {
            objMsg.biz_opaque_callback_data = mid[m].biz_opaque_callback_data
            objMsg.sent_master_uuid = mid[m].mid.uuid
        } else {
            objMsg.biz_opaque_callback_data = {
                userid: mid[m].mid.userid,
                campaignid: 0,
                source: "api/bulk_send",
                mobileno: objMsg.to,
                templateid: mid[m].mid.templateid !== undefined && mid[m].mid.templateid !== null ? mid[m].mid.templateid : 0,
                direction: 1,
                template_category: mid[m].mid.category !== undefined && mid[m].mid.category !== null ? mid[m].mid.category.toLowerCase() : null,
                sent_master_uuid: mid[m].mid.uuid,
                // biz_opaque_callback_data: mid[m].biz_opaque_callback_data
            };
        }
        // if (objMsg != null) {


        //     console.log("mid[m].mid.templateId ", mid[m].mid.templateid, "mid[m].mid.category-------------->", mid[m].mid.category)

        //     if (!objMsg.biz_opaque_callback_data) {


        //         objMsg.biz_opaque_callback_data = {
        //             userid: mid[m].mid.userid,
        //             campaignid: 0,
        //             source: "api/bulk_send",
        //             mobileno: objMsg.to,
        //             templateid: mid[m].mid.templateid !== undefined && mid[m].mid.templateid !== null ? mid[m].mid.templateid : 0,
        //             direction: 1,
        //             template_category: mid[m].mid.category !== undefined && mid[m].mid.category !== null ? mid[m].mid.category.toLowerCase() : null,
        //             sent_master_uuid: mid[m].mid.uuid,
        //             // biz_opaque_callback_data: mid[m].biz_opaque_callback_data
        //         };
        //     }
        //     // objMsg.biz_opaque_callback_data = mid[m].mid.uuid;
        // }
        console.log("objMsg.biz_opaque_callback_data------------------------------->", objMsg)

        let messageurl = mid[m].mid.wabaurl;

        var config = {
            method: 'post',
            url: messageurl,
            timeout: 1000 * 3,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + mid[m].mid.accesstoken,
            },
            data: objMsg
        };

        var protocol = httpUrl.parse(messageurl).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        console.log('OBJ MESSAGE =========================>' + JSON.stringify(objMsg));

        query = "SELECT subflag FROM ezb_subscription_master WHERE wanumber = ? AND wabanumber = ?";
        let subflagparameter = await mysql.query(query, [mid[m].mid.mobileno, mid[m].mid.contactno]);
        // console.log('subflagparameter ====================>' + JSON.stringify(subflagparameter));
        // errorLogger.info('SUBFLAGPARAMETER =====================>' + JSON.stringify(subflagparameter));

        // if (isMobileInternational(mid[m].mid.mobileno)) {
        wabaCountryCodeNumeric = getCountryCodeNumeric(mid[m].mid.mobileno);
        // }

        if (subflagparameter != undefined && subflagparameter.length > 0 && subflagparameter[0][0] != undefined && subflagparameter[0][0].subflag == 0) {

            let bodyContent = mid[m].bodyContent;
            errorCode = 120100;
            errorDesc = 'No subscription found for the mobile number ' + mid[m].mid.mobileno;

            query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount,uuid)" +
                " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?)";
            let insertsentmaster_1 = await mysql1.query(query, [mid[m].mid.id, mid[m].mid.botid, mid[m].mid.userid, mid[m].mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errorDesc, mid[m].mid.appid, 0, 0, mid[m].mid.messagetype, mid[m].mid.campaignid, mid[m].mid.contactno, mid[m].mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, mid[m].mid.subscriberid, mid[m].mid.retrycount, mid[m].mid.uuid]);
            // console.log('insertsentmaster_1 ====================>' + insertsentmaster_1);
            // errorLogger.info('INSERTSENTMASTER_1 =====================>' + JSON.stringify(insertsentmaster_1));

            query = "UPDATE ezb_message_request_master SET ismsgsent = ?, error = ? WHERE id = ?";
            let updaterequestmaster_1 = await mysql.query(query, [1, errorDesc, mid[m].mid.id]);
            // console.log('updaterequestmaster_1 ====================>' + updaterequestmaster_1);
            // errorLogger.info('UPDATEREQUESTMASTER_1 =====================>' + JSON.stringify(updaterequestmaster_1));

            query = "UPDATE ezb_message_sent_master SET readstatus = ?, faileddt = NOW() WHERE requestid = ?";
            let updatesentmater_1 = await mysql1.query(query, [3, mid[m].mid.id]);
            // console.log('updatesentmater_1 ====================>' + updatesentmater_1);
            // errorLogger.info('UPDATESENTMASTER_1 =====================>' + JSON.stringify(updatesentmater_1));

            query = "DELETE FROM ezb_message_request_master WHERE id = ?";
            let deleterequestmaster_1 = await mysql.query(query, [mid[m].mid.id]);
            // console.log('deleterequestmaster_1 ====================>' + deleterequestmaster_1);
            // errorLogger.info('DELETEREQUESTMASTER_1 =====================>' + JSON.stringify(deleterequestmaster_1));

        } else {
            // console.log('objMsg==============================>' + JSON.stringify(objMsg));
            errorLogger.info('OBJMESSAGE =====================>' + JSON.stringify(objMsg));
            let startTime = new Date().getMilliseconds();
            axios(config)
                .then(async function (response) {
                    let endTime = new Date().getMilliseconds();
                    let diffTime = Math.abs(endTime - startTime);
                    response = response.data;
                    console.log('Send Response Success Time responseTime: ' + diffTime + ' ms');
                    console.log("Send Response: " + JSON.stringify(response));
                    console.log(response);
                    if (typeof response.messages != undefined) {
                        status = 1;
                        waMessageId = (typeof response.messages[0].id != undefined) ? response.messages[0].id : '';
                        let bodyContent = mid[m].bodyContent;

                        // if (isMobileInternational(mid[m].mid.mobileno)) {
                        wabaCountryCodeNumeric = getCountryCodeNumeric(mid[m].mid.mobileno);
                        // }

                        query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount,uuid, category, sessid, category_id)" +
                            " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?, LOWER(?),MD5(?),?)";
                        let updatesentmater_2 = await mysql1.query(query, [mid[m].mid.id, mid[m].mid.botid, mid[m].mid.userid, mid[m].mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errorDesc, mid[m].mid.appid, 0, 0, mid[m].mid.messagetype, mid[m].mid.campaignid, mid[m].mid.contactno, mid[m].mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, mid[m].mid.subscriberid, mid[m].mid.retrycount, mid[m].mid.uuid, mid[m].mid.category, waMessageId, 1]);
                        // console.log('updatesentmater_2 ====================>' + updatesentmater_2);
                        // errorLogger.info('UPDATESENTMASTER_2 =====================>' + JSON.stringify(updatesentmater_2));


                        query = "DELETE FROM ezb_message_request_master WHERE id = ?";
                        let deleterequestmaster_2 = await mysql.query(query, [mid[m].mid.id]);
                        // console.log('deleterequestmaster_2 ====================>' + deleterequestmaster_2);
                        // errorLogger.info('DELETEREQUESTMASTER_2 =====================>' + JSON.stringify(deleterequestmaster_2));
                    }
                    else {
                        status = 0;
                        fbtrace_id = (typeof response.error[0].fbtrace_id != undefined) ? response.error[0].fbtrace_id : '';
                        console.log(fbtrace_id);
                        query = "UPDATE ezb_message_request_master SET ismsgsent = ?, error = ?, retrycount = retrycount + 1, retrydt = DATE_ADD(NOW(), INTERVAL 30 MINUTE), issentpicked = ? WHERE id = ?";
                        let updaterequestmaster_2 = await mysql.query(query, [0, 'Sending Error : ' + JSON.stringify(response), 0, mid[m].mid.id]);
                        // console.log('updaterequestmaster_2 ====================>' + updaterequestmaster_2);
                        // errorLogger.info('UPDATEREQUESTMASTER_2 =====================>' + JSON.stringify(updaterequestmaster_2));
                    }
                })
                .catch(async function (error) {
                    let endTime = new Date().getMilliseconds();
                    let diffTime = Math.abs(endTime - startTime);
                    console.log('Send Response Error Time responseTime: ' + diffTime + ' ms');
                    console.log('Send Failed : ' + error);
                    console.log(error.message);
                    let tempErrorCode = error.code != undefined ? error.code : null;
                    console.log({ tempErrorCode });
                    let retrycount = 5;
                    let errorcode = 0;

                    status = 0;
                    if (error != undefined && error.response != undefined && error.response.data != undefined && error.response.data.error != undefined) {
                        console.log('ERROR_LOG : ' + mid[m].mid.mobileno + ' : ' + JSON.stringify(error.response.data));
                        errormessage = error.response.data.error.message;
                        fbtrace_id = error.response.data.error.fbtrace_id;
                        errorcode = error.response.data.error.code;
                        // if(errorcode == 130249){
                        //     retrycount = 0;
                        // }

                        if (errorcode == 130429) {
                            retrycount = 0;

                        }
                        console.log(error);
                        console.log("mid[m].mid.id== inside catch================", mid[m].mid.id);
                        query = "UPDATE ezb_message_request_master SET ismsgsent = ?, error = ?, retrycount = ?, senderrorcode = ?, issentpicked = ?, fbtrace_id = ?  WHERE id = ?";
                        let updaterequestmaster_4 = await mysql.query(query, [0, errormessage, retrycount, errorcode, 0, fbtrace_id, mid[m].mid.id]);
                        console.log('updaterequestmaster_4 ====================>' + JSON.stringify(updaterequestmaster_4));
                        errorLogger.info('UPDATEREQUESTMASTER_4 =====================>' + JSON.stringify(updaterequestmaster_4));
                    } else {
                        errormessage = 'Send Failed : ' + error;
                        query = "UPDATE ezb_message_request_master SET ismsgsent = ?, error = ?, retrycount =  retrycount + 1, retrydt = DATE_ADD(NOW(), INTERVAL 15 MINUTE), senderrorcode = ?, issentpicked = ?, fbtrace_id = ?  WHERE id = ?";
                        let updaterequestmaster_5 = await mysql.query(query, [0, errormessage, errorcode, 0, fbtrace_id, mid[m].mid.id]);
                        // console.log('updaterequestmaster_5 ====================>' + JSON.stringify(updaterequestmaster_5));
                        // errorLogger.info('UPDATEREQUESTMASTER_5 =====================>' + JSON.stringify(updaterequestmaster_5));
                    }
                });
        }
    }
};