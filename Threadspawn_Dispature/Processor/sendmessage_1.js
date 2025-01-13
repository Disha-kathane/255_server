let httpUrl = require('url');
let axios = require('axios');
let http = require('http');
let https = require('https');
let async = require('async');
let mysql = require('../database/db');
let mysql1 = require('../database/db1');
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const { errorLogger, infoLogger } = require('../applogger');
const { RETRYCOUNT } = require('../constant');
const queuename = require('../constant').queuename13;
const redisHost = require('../constant').redisHost;
const redisPort = require('../constant').redisPort;

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
    // console.log("job -------------->  ", job.data.mid)

    if (job.data.mid?.mobileno) {

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
        // let bodyContent = job.data.mid.bodyContent;
        let bodyContent = JSON.stringify({
            body:job.data.bodyContent
        });
        let msgtype = job.data.mid.head_mediatype;

        // console.log("job.data.mid.  ------------------------------------------>", job.data.mid)

        console.log({ bodyContent });

        let currentdate = new Date();

        objMsg.biz_opaque_callback_data = {
            userid: job.data.mid.userid,
            campaignid: job.data.mid.campaignid,
            source: 'campaign',
            date: currentdate.toISOString().split('T')[0],
            mobileno: job.data.mid.mobileno,
            wabanumber: job.data.mid.contactno,
            templateid: job.data.mid.templateid,
            direction: direction,
            category: job.data.mid.category,
            campaign_title: job.data.mid.campaign_title
        };

        let messageurl = job.data.mid.wabaurl;
        let config = {};
        console.log("check msgtype " + msgtype == 6, msgtype);
        if (msgtype == 6) {
            console.log("inside the messagetype 6")
            config = {
                method: 'post',
                url: messageurl,
                // timeout: 1000 * 3,  //this timeout commented on 21 feb for video carousel template
                timeout: 1000 * 15,

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + job.data.mid.accesstoken,
                },
                data: objMsg
            };
        } else {
            console.log("inside else part of the messagetype 6")
            config = {
                method: 'post',
                url: messageurl,
                timeout: 1000 * 4,  //this timeout commented on 21 feb for video carousel template
                // timeout: 1000 * 15,

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + job.data.mid.accesstoken,
                },
                data: objMsg
            };
        }
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

        // errorLogger.info('OBJMESSAGE_2 =====================>' + JSON.stringify(objMsg));
        let startTime = new Date().getMilliseconds();
        // console.log({config});

        let userid = job.data.mid.userid;
        // console.log({ userid })
        query = "select  balance_amt from ezb_users where userid = ? AND account_type = ?";
        let balAmt = await mysql.query(query, [userid, 1]);
        let accounttype = balAmt[0].length;  // length 1 == prepaid and length 0 == postpaid
        // console.log("balAmt===================> ", accounttype);

        query = "SELECT subflag FROM ezb_subscription_master WHERE wanumber = ? AND wabanumber = ? AND subflag = 0";
        subflagparameter = await mysql.query(query, [job.data.mid.mobileno, job.data.mid.contactno]);
        // console.log('subflagparameter====================>' + JSON.stringify(subflagparameter));
        // errorLogger.info('SUBFLAGPARAMETER =====================>' + JSON.stringify(subflagparameter));

        if (subflagparameter != undefined && subflagparameter.length > 0 && subflagparameter[0][0] != undefined && subflagparameter[0][0].subflag == 0) {
            // errorLogger.info('OBJMESSAGE_1 =====================>' + JSON.stringify(objMsg));
            errorCode = 120100;
            errorDesc = 'No subscription found for the mobile number ' + job.data.mid.mobileno;

            query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount,templateid)" +
                " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?)";
            let insertsentmaster_1 = await mysql1.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errorDesc, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, job.data.mid.retrycount, job.data.mid.templateid]);
            // console.log('insertsentmaster_1 ====================>' + insertsentmaster_1);
            // errorLogger.info('INSERTSENTMASTER_1 =====================>' + JSON.stringify(insertsentmaster_1));
            done();

        } else {
            console.log("inside of else part of subscription block")
            if (accounttype == 1) {
                console.log("Prepaid Account");
                let balAval = balAmt[0][0].balance_amt;
                // console.log({ balAval });
                console.log('parseInt(balAval) > 0 : ' + parseInt(balAval) > 0);
                if (parseInt(balAval) > 0) {
                    // console.log('objMsg==============================>' + JSON.stringify(objMsg));
                    // errorLogger.info('OBJMESSAGE =====================>' + JSON.stringify(objMsg));
                    let startTime = new Date().getMilliseconds();
                    axios(config)
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

                                wabaCountryCodeNumeric = getCountryCodeNumeric(job.data.mid.mobileno);

                                query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount,category, sessid, category_id,templateid)" +
                                    " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,LOWER(?),MD5(?),?,?)";
                                let updatesentmater_2 = await mysql1.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errorDesc, job.data.mid.appid, 0, 0, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, job.data.mid.retrycount, job.data.mid.category, waMessageId, 1, job.data.mid.templateid]);
                                console.log('updatesentmater_2 ====================>' + JSON.stringify(updatesentmater_2));
                                // errorLogger.info('UPDATESENTMASTER_2 =====================>' + JSON.stringify(updatesentmater_2));
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

                            let temperrorCode = error.code != undefined ? error.code : null;
                            console.log({ temperrorCode });
                            let Retrycount = 0;
                            // let errobj = error.response.data.error;
                            if (error.response != undefined && error.response.data != undefined && error.response.data.error != undefined) {

                                errormessage = error.response.data.error.message;
                                fbtrace_id = error.response.data.error.fbtrace_id;
                                errorCode = error.response.data.error.code;
                                console.log({ errormessage, fbtrace_id, errorCode });

                            } else {
                                errormessage = error;
                                errormessage = errormessage.toString().replace(/'/g, '');
                                fbtrace_id = null;
                                errorCode = null;
                            };

                            if (error.code === 'ECONNABORTED') {
                                errormessage = "timeout";
                                fbtrace_id = null;
                                errorCode = null;
                            };

                            if (errorCode != 130429) {
                                Retrycount = RETRYCOUNT;
                                query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount,templateid)" +
                                    " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?)";
                                try {
                                    let updatesentmater_8 = await mysql1.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errormessage, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, Retrycount, job.data.mid.templateid]);
                                    console.log('updatesentmater_8 ====================>' + JSON.stringify(updatesentmater_8));
                                    console.log("ERROR_CODE : " + job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errormessage, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, Retrycount);
                                    // errorLogger.info('UPDATESENTMASTER_8 =====================>' + JSON.stringify(updatesentmater_8));
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
                } else {
                    console.log("Insufficient Balance");
                    errorCode = 36;
                    errorDesc = 'Insufficient Balance ';
                    let Retrycount = RETRYCOUNT;

                    query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount,templateid)" +
                        " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?)";
                    try {
                        let updatesentmater_8 = await mysql1.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errorDesc, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, Retrycount, job.data.mid.templateid]);
                        console.log('updatesentmater_8 ====================>' + JSON.stringify(updatesentmater_8));
                        console.log("ERROR_CODE : " + job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errormessage, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid);
                        // errorLogger.info('UPDATESENTMASTER_8 =====================>' + JSON.stringify(updatesentmater_8));
                        done();
                    }
                    catch (sqlError) {
                        done(sqlError);
                    }

                }

            } else if (accounttype == 0) {
                console.log("Postpaid Account");

                query = "select postpaid_credit_amt, postpaid_credit_limit_flag from ezb_users where userid = ? AND account_type = ?";
                let result = await mysql.query(query, [userid, 0]);
                let postpaid_credit_amt = result[0][0].postpaid_credit_amt;
                let postpaid_credit_limit_flag = result[0][0].postpaid_credit_limit_flag;
                // console.log({ query });
                console.log("result------------------------------------> ", { postpaid_credit_amt, postpaid_credit_limit_flag });

                if (postpaid_credit_limit_flag == 0) {
                    console.log('postpaid_credit_limit_flag-------> ', postpaid_credit_limit_flag);
                    // console.log('objMsg==============================>' + JSON.stringify(objMsg));
                    // errorLogger.info('OBJMESSAGE =====================>' + JSON.stringify(objMsg));
                    let startTime = new Date().getMilliseconds();

                    axios(config)
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
                                // let bodyContent = mid[m].bodyContent;

                                // if (isMobileInternational(mid[m].mid.mobileno)) {
                                wabaCountryCodeNumeric = getCountryCodeNumeric(job.data.mid.mobileno);
                                // }


                                query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount,category, sessid, category_id,templateid)" +
                                    " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,LOWER(?),MD5(?),?,?)";
                                let updatesentmater_2 = await mysql1.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errorDesc, job.data.mid.appid, 0, 0, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, job.data.mid.retrycount, job.data.mid.category, waMessageId, 1, job.data.mid.templateid]);
                                console.log('updatesentmater_2 ====================>' + JSON.stringify(updatesentmater_2));
                                // errorLogger.info('UPDATESENTMASTER_2 =====================>' + JSON.stringify(updatesentmater_2));
                                done();
                                // console.log('updatesentmater_2 ====================>' + updatesentmater_2);
                                // errorLogger.info('UPDATESENTMASTER_2 =====================>' + JSON.stringify(updatesentmater_2));

                                // query = "Update ezb_message_request_master set issentpicked = ? where campaignid = ?";
                                // let updateissentpicked = await mysql.query(query, [0, mid[m].mid.campaignid]);
                                // console.log('updateissentpicked  ====================>' + updateissentpicked);
                            } else {
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

                            let temperrorCode = error.code != undefined ? error.code : null;
                            console.log({ temperrorCode });
                            let Retrycount = 0;
                            // let errobj = error.response.data.error;
                            if (error.response != undefined && error.response.data != undefined && error.response.data.error != undefined) {

                                errormessage = error.response.data.error.message;
                                fbtrace_id = error.response.data.error.fbtrace_id;
                                errorCode = error.response.data.error.code;
                                console.log({ errormessage, fbtrace_id, errorCode });

                            } else {
                                errormessage = error;
                                errormessage = errormessage.toString().replace(/'/g, '');
                                fbtrace_id = null;
                                errorCode = null;
                            };

                            if (error.code === 'ECONNABORTED') {
                                errormessage = "timeout";
                                fbtrace_id = null;
                                errorCode = null;
                            };

                            if (errorCode != 130429) {
                                Retrycount = RETRYCOUNT;
                                query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount,templateid)" +
                                    " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?)";
                                try {
                                    let updatesentmater_8 = await mysql1.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errormessage, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, Retrycount, job.data.mid.templateid]);
                                    console.log('updatesentmater_8 ====================>' + JSON.stringify(updatesentmater_8));
                                    console.log("ERROR_CODE : " + job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errormessage, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, Retrycount);
                                    // errorLogger.info('UPDATESENTMASTER_8 =====================>' + JSON.stringify(updatesentmater_8));
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
                }
                else if (postpaid_credit_limit_flag == 1) {
                    console.log('postpaid_credit_limit_flag-------> ', postpaid_credit_limit_flag);
                    console.log('postpaid_credit_amt--------------->  ', parseInt(postpaid_credit_amt));
                    if (parseInt(postpaid_credit_amt) > 0) {
                        // errorLogger.info('OBJMESSAGE =====================>' + JSON.stringify(objMsg));
                        let startTime = new Date().getMilliseconds();

                        axios(config)
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
                                    // let bodyContent = mid[m].bodyContent;

                                    // if (isMobileInternational(mid[m].mid.mobileno)) {
                                    wabaCountryCodeNumeric = getCountryCodeNumeric(job.data.mid.mobileno);

                                    // console.log({ bodyContent })
                                    // }


                                    query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount,category, sessid, category_id,templateid)" +
                                        " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,LOWER(?),MD5(?),?,?)";
                                    let updatesentmater_2 = await mysql1.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errorDesc, job.data.mid.appid, 0, 0, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, job.data.mid.retrycount, job.data.mid.category, waMessageId, 1, job.data.mid.templateid]);
                                    console.log('updatesentmater_2 ====================>' + JSON.stringify(updatesentmater_2));
                                    // errorLogger.info('UPDATESENTMASTER_2 =====================>' + JSON.stringify(updatesentmater_2));
                                    done();
                                } else {
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

                                let temperrorCode = error.code != undefined ? error.code : null;
                                // console.log({ temperrorCode });
                                let Retrycount = 0;
                                // let errobj = error.response.data.error;
                                if (error.response != undefined && error.response.data != undefined && error.response.data.error != undefined) {

                                    errormessage = error.response.data.error.message;
                                    fbtrace_id = error.response.data.error.fbtrace_id;
                                    errorCode = error.response.data.error.code;
                                    console.log({ errormessage, fbtrace_id, errorCode });

                                } else {
                                    errormessage = error;
                                    errormessage = errormessage.toString().replace(/'/g, '');
                                    fbtrace_id = null;
                                    errorCode = null;
                                };

                                if (error.code === 'ECONNABORTED') {
                                    errormessage = "timeout";
                                    fbtrace_id = null;
                                    errorCode = null;
                                };

                                if (errorCode != 130429) {
                                    Retrycount = RETRYCOUNT;
                                    query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount,templateid)" +
                                        " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?)";
                                    try {
                                        let updatesentmater_8 = await mysql1.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errormessage, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, Retrycount, job.data.mid.templateid]);
                                        console.log('updatesentmater_8 ====================>' + JSON.stringify(updatesentmater_8));
                                        console.log("ERROR_CODE : " + job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errormessage, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, Retrycount);
                                        // errorLogger.info('UPDATESENTMASTER_8 =====================>' + JSON.stringify(updatesentmater_8));
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

                    } else {
                        console.log("Insufficient Balance");
                        errorCode = 36;
                        errorDesc = 'Insufficient Balance ';
                        let Retrycount = RETRYCOUNT;

                        query = "INSERT INTO ezb_message_sent_master(requestid,botid,userid,mobileno,wabapayload,messageid,errcode,errdesc,createdt,appid,status,readstatus,messagetype,campaignid,contactno,msg_setting_id,direction,body_content,sentdt,submissiontype,countrycode,rate,fbtrace_id,subscriberid,retrycount,templateid)" +
                            " VALUES(?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?,?,?)";
                        try {
                            let updatesentmater_8 = await mysql1.query(query, [job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errorDesc, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid, Retrycount, job.data.mid.templateid]);
                            console.log('updatesentmater_8 ====================>' + JSON.stringify(updatesentmater_8));
                            console.log("ERROR_CODE : " + job.data.mid.id, job.data.mid.botid, job.data.mid.userid, job.data.mid.mobileno, JSON.stringify(objMsg), waMessageId, errorCode, errormessage, job.data.mid.appid, 0, 3, job.data.mid.messagetype, job.data.mid.campaignid, job.data.mid.contactno, job.data.mid.msg_setting_id, direction, bodyContent, submissiontype, wabaCountryCodeNumeric, notificationRate, fbtrace_id, job.data.mid.subscriberid);
                            // errorLogger.info('UPDATESENTMASTER_8 =====================>' + JSON.stringify(updatesentmater_8));
                            done();
                        }
                        catch (sqlError) {
                            done(sqlError);
                        }

                    }

                }

            }

        }
    } else {
        done();
    }

};