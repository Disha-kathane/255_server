let httpUrl = require('url');
let axios = require('axios');
let http = require('http');
let https = require('https');
let async = require('async');
let mysql = require('../database/db');
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const { errorLogger, infoLogger } = require('../applogger');

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

module.exports.sendmessage = async (job, done) => {


    console.log('I am In Processor');

    job.data.mid.mobileno = job.data.mid.mobileno.replace(/\+/g, '');
    job.data.mid.mobileno = job.data.mid.mobileno.replace(/\'/g, '');
    job.data.mid.mobileno = job.data.mid.mobileno.replace(/\ /g, '');
    job.data.mid.mobileno = job.data.mid.mobileno.replace(/\-/g, '');
    job.data.mid.mobileno = job.data.mid.mobileno.replace(/\//g, '');


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
    let subflagparameter = job.data.subflagparameter;
    let bodyContent = job.data.mid.bodyContent;


    let messageurl = job.data.mid.wabaurl;

    var config = {
        method: 'post',
        url: messageurl,
        timeout: 1000 * 3,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + job.data.mid.accesstoken,
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

    wabaCountryCodeNumeric = await getCountryCodeNumeric(job.data.mid.mobileno);

    errorLogger.info('OBJMESSAGE_2 =====================>' + JSON.stringify(objMsg));
    let startTime = new Date().getMilliseconds();
    // console.log({config});
    await axios(config)
        .then(async function (response) {
            let endTime = new Date().getMilliseconds();
            let diffTime = Math.abs(endTime - startTime);
            response = response.data;
            console.log('Send Response Success Time responseTime: ' + diffTime + ' ms');
            console.log("Send Response: " + JSON.stringify(response));
            // console.log(response);
            if (typeof response.messages != undefined) {
                status = 1;
                waMessageId = (typeof response.messages[0].id != undefined) ? response.messages[0].id : '';
                // let bodyContent = job.data.bodyContent;
                wabaCountryCodeNumeric = getCountryCodeNumeric(job.data.mid.mobileno);

                query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount)" +
                    " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?)";
                let updatesentmater_2 = await mysql.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errorDesc, job.data.mid.appid, 0, 0, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, job.data.mid.retrycount]);
                console.log('updatesentmater_2 ====================>' + JSON.stringify(updatesentmater_2));
                errorLogger.info('UPDATESENTMASTER_2 =====================>' + JSON.stringify(updatesentmater_2));
                done();
            }
            else {
                status = 0;
                fbtrace_id = (typeof response.error[0].fbtrace_id != undefined) ? response.error[0].fbtrace_id : '';
                done('Error 1');
            }
        })
        .catch(async function (error) {
            let endTime = new Date().getMilliseconds();
            let diffTime = Math.abs(endTime - startTime);
            console.log('Send Response Error Time responseTime: ' + diffTime + ' ms');
            console.log('Send Failed : ' + error);
            console.log({ error });
            let tempErrorCode = error.code != undefined ? error.code : null;
            console.log({ tempErrorCode });
            let Retrycount = 0;
            // let errobj = error.response.data.error;
            if (error.response != undefined) {
                errormessage = error.response.data.error.message;
                fbtrace_id = error.response.data.error.fbtrace_id;
                errorcode = error.response.data.error.code;
                console.log({ errormessage, fbtrace_id, errorcode });
            } else {
                errormessage = error;
                fbtrace_id = null;
                errorcode = null;
            }

            if (errorcode == 100) {

                query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount)" +
                    " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?)";
                try {
                    let updatesentmater_3 = await mysql.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorcode, errormessage, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, Retrycount]);
                    console.log('updatesentmater_3 ====================>' + JSON.stringify(updatesentmater_3));
                    errorLogger.info('UPDATESENTMASTER_3 =====================>' + JSON.stringify(updatesentmater_3));
                    done();
                } catch (sqlError) {
                    done(sqlError);
                }
            } else if (errorcode == 131009) {

                query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount)" +
                    " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?)";
                try {
                    let updatesentmater_4 = await mysql.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorcode, errormessage, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, Retrycount]);
                    console.log('updatesentmater_4 ====================>' + JSON.stringify(updatesentmater_4));
                    errorLogger.info('UPDATESENTMASTER_4 =====================>' + JSON.stringify(updatesentmater_4));
                    done();
                } catch (sqlError) {
                    done(sqlError);
                }
            }
            // else if (errorcode == 130429) {

            //     query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount)" +
            //         " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?)";
            //     try {
            //         let updatesentmater_5 = await mysql.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorcode, errormessage, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, Retrycount]);
            //         console.log('updatesentmater_5 ====================>' + JSON.stringify(updatesentmater_5));
            //         errorLogger.info('updatesentmater_5 =====================>' + JSON.stringify(updatesentmater_5));
            //         done();
            //     } catch (sqlError) {
            //         done(sqlError);
            //     }
            // }
            else if (errorcode == 132001) {

                query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount)" +
                    " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?)";
                try {
                    let updatesentmater_6 = await mysql.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorcode, errormessage, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, Retrycount]);
                    console.log('updatesentmater_6 ====================>' + JSON.stringify(updatesentmater_6));
                    errorLogger.info('UPDATESENTMASTER_6 =====================>' + JSON.stringify(updatesentmater_6));
                    done();
                }
                catch (sqlError) {
                    done(sqlError);
                }
            }
            else {
                done(error);
            }
        });


};