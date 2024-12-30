const express = require('express');
const router = express.Router();
const async = require('async');
const axios = require('axios');
const qs = require('qs');
const mysql = require('mysql');
// const moment = require('moment');
let dbpool;

//DB connection
let parseString = require('xml2js').parseString;

let db_config = {
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'bse_db',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};

dbpool = mysql.createPool(db_config);

//Get the list of StockName 
router.post('/SecurityName/:scripcodename', (req, res) => {
    let ScripCodeType = (typeof req.params.scripcodename != undefined) ? req.params.scripcodename + '' : '';
    let getData = (callback) => {
        let data = qs.stringify({
            'UserID': 'pinnacle',
            'Password': 'BSE@chatbot',
            'SearchValue': ScripCodeType,
            'flag': '0'
        });
        let config = {
            method: 'post',
            url: 'https://search.bseindia.com/webServiceAnn/WebServiceI.asmx/GetScriptWise_CPDHLData',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };
        axios(config)
            .then(function (response) {

                let MessageContent = 'Following are the stocks which starts with *' + ScripCodeType + '*.\nPlease select the one you wish to know more about\n\n*For ex*: Type *1* for TATA POWER COLTD.\n\n';
                let xmlResponse = response.data.toString().replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                console.log(xmlResponse);
                parseString(xmlResponse, function (err, results) {
                    if (err) {
                        callback(err);
                    }

                    // parsing to json
                    if (results.string._ != 'No Record Found') {
                        // console.log("do this")
                        let data = results.string.CompanySearch[0].Company;

                        for (i = 0; i < data.length; i++) {
                            TypeId = (i + 1);
                            MessageContent += 'Type 👉' + ' *' + (i + 1) + '* ' + data[i].$.extra + '\n';
                            let query = 'REPLACE INTO `bse_scripcode_master`(scripcodetype,text,scripcode,typeid) VALUES(?,?,?,?)';
                            let values = [ScripCodeType, data[i].$.extra, data[i].$.scripcode, TypeId];
                            let s = dbpool.query(query, values, (err, result) => {
                                if (err) {
                                    done(err);
                                } else {
                                    console.log(result);
                                }
                            });
                            console.log(s.sql);
                        }
                        callback(null, MessageContent);
                    } else {
                        res.send({
                            code: 100,
                            status: 'FAILED',
                            data: "NO record Found"
                        });
                    }

                });

            })
            .catch(function (error) {
                console.log(error);
                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "NO record Found"
                });
            });
    }

    async.waterfall([getData], (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: 'FAILED',
                data: "Something went wrong"
            });
        } else {
            let response = {
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: result
            };
            res.status(200).json(response);
        }
    });

});

//Get the list of Product Option
router.post('/ProductOptions/:scripcodename/:stocknameid', (req, res) => {
    try {
        let ScripCodeType = (typeof req.params.scripcodename != undefined) ? req.params.scripcodename + '' : '';
        let StockNameId = (typeof req.params.stocknameid != undefined) ? req.params.stocknameid + '' : '';
        getOptions = (callback) => {
            let MessageContent = '';
            let query = 'SELECT text FROM `bse_scripcode_master` WHERE scripcodetype =? AND typeid = ?';
            let values = [ScripCodeType, StockNameId];
            let s = dbpool.query(query, values, (err, result) => {
                if (err) {
                    callback(err)
                } else {
                    // console.log("RESULT==================", result)
                    if (result.length > 0) {
                        let ProductName = result[0].text;
                        MessageContent = 'Please select from one of the below options for *' + ProductName + '*\n\n*For ex*: Type *1* for Current Price.\n\nType 👉 *1*  Current Price\nType 👉 *2*  Corporate Announcement\nType 👉 *3*  Corporate Action\nType 👉 *4*  Results\nType 👉 *5*  AGM\nType 👉 *6*  52 Week High Low \n\n';
                        callback(null, MessageContent);
                    }
                    else {
                        res.send({
                            code: 100,
                            status: 'FAILED',
                            data: "NO record Found"
                        });
                    }
                }
            })
            console.log(s.sql);
        }
        async.waterfall([getOptions], (err, result) => {
            if (err) {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });
            } else {
                let response = {
                    code: 200,
                    status: "SUCCESS",
                    type: "text",
                    data: result
                };
                res.status(200).json(response);
            }

        })
    } catch (error) {
        res.send({
            code: 100,
            status: 'FAILED',
            data: "NO record Found"
        });
    }
})


//get the product option result based on flag
router.post('/Price/:scripcodename/:stocknameid/:optionid', (req, res) => {
    let ScripCodeType = (typeof req.params.scripcodename != undefined) ? req.params.scripcodename + '' : '';
    let StockNameId = (typeof req.params.stocknameid != undefined) ? req.params.stocknameid + '' : '';
    let OptionId = (typeof req.params.optionid != undefined) ? req.params.optionid + '' : '';

    let getScripCode = (callback) => {
        if (OptionId > 6) {
            callback(1);
        } else {
            let query = 'SELECT scripcode,text FROM `bse_scripcode_master` WHERE typeid = ? AND scripcodetype = ?';
            let values = [StockNameId, ScripCodeType];
            let s = dbpool.query(query, values, (err, result) => {
                if (err) {
                    callback(err);
                } else {
                    if (result.length > 0) {
                        let flag;
                        if (OptionId == '1') {
                            flag = 1;
                        } else if (OptionId == '2') {
                            flag = 4;
                        } else if (OptionId == '3') {
                            flag = 3;
                        } else if (OptionId == '4') {
                            flag = 5;
                        } else if (OptionId == '5') {
                            flag = 6;
                        } else if (OptionId == '6') {
                            flag = 2;
                        }
                        let text = result[0].text;
                        let scripcode = result[0].scripcode;
                        let data = qs.stringify({
                            'UserID': 'pinnacle',
                            'Password': 'BSE@chatbot',
                            'SearchValue': scripcode,
                            'flag': flag
                        });
                        let config = {
                            method: 'post',
                            url: 'https://search.bseindia.com/webServiceAnn/WebServiceI.asmx/GetScriptWise_CPDHLData',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            data: data
                        };

                        console.log("config data", config);

                        axios(config)
                            .then(function (response) {

                                let MessageContent = '';
                                let xmlResponse = response.data.toString().replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                                parseString(xmlResponse, function (err, results) {
                                    if (err) {
                                        callback(err);
                                    }
                                    console.log("results==================", results);
                                    if (results.string._ != 'No Record Found') {
                                        // console.log("do this ")
                                        if (flag == '1') {
                                            if (results.string.CurrentPriceDHLs != undefined) {
                                                let data = results.string.CurrentPriceDHLs[0].CurrentPriceDHL;
                                                for (i = 0; i < data.length; i++) {
                                                    let LongName = data[i].$.LongName;
                                                    let LastTradeRate = data[i].$.LastTradeRate;
                                                    let PriceChange = data[i].$.PriceChange;
                                                    let PriceChangePerc = data[i].$.PricechangePer;
                                                    MessageContent = 'The current price of *' + LongName + '*  is *' + LastTradeRate + '*\n\n*Price Change* : ' + PriceChange + '\n*Price Change (%)* : ' + PriceChangePerc;
                                                }
                                            } else {
                                                MessageContent = 'The current price of ' + LongName + ' is  : NA \n\n*Price Change* :  NA\n\n  *Price Change Perc(%)* : NA';
                                            }

                                            callback(null, MessageContent);

                                        }
                                        else if (flag == '4') {
                                            if (results.string.CorporateAnnouncements != undefined) {
                                                let data1 = results.string.CorporateAnnouncements[0].CorporateAnnouncement;
                                                console.log("announcementdata", data1)
                                                for (i = 0; i < data1.length; i++) {
                                                    let NewsDate = data1[i].$.News_dt;
                                                    let WebURL = data1[i].$.WebURL;
                                                    // let tempNewBody = NewsBody.toString().replace(/&lt;BR&gt;/g, '\n');
                                                    // tempNewBody = tempNewBody.replace(/&lt;/g, '');
                                                    // tempNewBody = tempNewBody.replace(/&gt;/g, '');
                                                    // tempNewBody = tempNewBody.replace(/&amp;/g, '');
                                                    // tempNewBody = tempNewBody.replace(/a href=&quot;/g, '');
                                                    // tempNewBody = tempNewBody.replace(/&quot;/g, '')
                                                    // MessageContent += (i + 1) + '. ' + NewsDate + '\n' + data1[i].$.newssub + '\n' + data1[i].$.newsbody + '\n\n';
                                                    MessageContent += '*' + NewsDate + '*' + '\n\n' + data1[i].$.newssub + '\n\n';
                                                }

                                            } else {
                                                MessageContent = '1. *NewsDate* : NA \n2. *newssub* : NA \n3. *newsbody* : NA';
                                            }

                                            callback(null, MessageContent);

                                        } else if (flag == '3') {

                                            MessageContent = 'Corporate Action of *' + text + '*\n\n';
                                            if (results.string.CorporateActions != undefined) {
                                                let data2 = results.string.CorporateActions[0].CorporateAction;
                                                for (i = 0; i < data2.length; i++) {
                                                    let ExpDate = data2[i].$.Ex_Date;
                                                    // MessageContent += (i + 1) + '. ' + ExpDate + '\n' + data2[i].$.Purpose + '\n\n';
                                                    MessageContent += '*' + ExpDate + '*' + '\n' + data2[i].$.Purpose + '\n\n';
                                                }
                                            }
                                            else {
                                                MessageContent = 'Corporate Action of ' + text + '\n\n1. *ExpDate*  : NA\n\n2. *Purpose*  : NA';
                                            }
                                            callback(null, MessageContent);

                                        } else if (flag == '5') {
                                            if (results.string.Results != undefined) {
                                                let data3 = results.string.Results[0].Result;

                                                for (i = 0; i < data3.length; i++) {
                                                    let NewsDate = data3[i].$.News_dt;
                                                    let WebURL = data3[i].$.WebURL;
                                                    // let NewsBody = data3[i].$.newsbody;
                                                    // let tempNewBody = NewsBody.toString().replace(/&lt;BR&gt;/g, '\n');
                                                    // tempNewBody = tempNewBody.replace(/&lt;/g, '');
                                                    // tempNewBody = tempNewBody.replace(/&gt;/g, '');
                                                    // tempNewBody = tempNewBody.replace(/&amp;/g, '');
                                                    // tempNewBody = tempNewBody.replace(/a href=&quot;/g, '');
                                                    // tempNewBody = tempNewBody.replace(/&quot;/g, '')
                                                    // MessageContent += (i + 1) + '. ' + NewsDate + '\n' + data3[i].$.newssub + '\n' + data3[i].$.newsbody + '\n\n';
                                                    MessageContent += '*' + NewsDate + '*' + '\n\n' + data3[i].$.newssub + '\n\n';
                                                }

                                            } else {
                                                MessageContent = '1. *NewsDate* : NA \n\n2. *newssub* : NA\n\n *newsbody* : NA';
                                            }
                                            callback(null, MessageContent);
                                        } else if (flag == '6') {
                                            MessageContent += 'AGM of *' + text + '*\n\n';
                                            if (results.string.BordMeetingAgms != undefined) {
                                                let data4 = results.string.BordMeetingAgms[0].BordMeetingAgm;
                                                for (i = 0; i < data4.length; i++) {
                                                    let MeetingDate = data4[i].$.MeetingDate;
                                                    let PurposeName = data4[i].$.PurposeName;
                                                    // MessageContent += 'AGM of *' + text + '*\n\n';
                                                    // MessageContent += '*' + (i + 1) + '*' + '. ' + 'Last Meeting Date :' + MeetingDate + '\n' + 'Purpose :' + PurposeName;
                                                    MessageContent += '*Last Meeting Date* :' + MeetingDate + '\n' + '*Purpose* :' + PurposeName + '\n\n';
                                                }
                                            } else {
                                                // MessageContent = 'AGM of *' + text + '*\n\n';
                                                MessageContent = 'AGM of *' + text + '*\n\n' + '*Last Meeting Date* : NA\n *Purpose* : NA';
                                            }
                                            callback(null, MessageContent);
                                        } else if (flag == '2') {
                                            console.log(results.string.W52_High_Lows)
                                            if (results.string.W52_High_Lows != undefined) {
                                                let data5 = results.string.W52_High_Lows[0].W52_High_Low;
                                                console.log(data5);
                                                for (i = 0; i < data5.length; i++) {
                                                    let LastTradeRate = data5[i].$.Ltradert;
                                                    let WeekHigh = data5[i].$.WeekHigh;
                                                    let WeekLow = data5[i].$.WeekLow;
                                                    let MonthHigh = data5[i].$.MonthHigh;
                                                    let MonthLow = data5[i].$.MonthLow;
                                                    let YearHigh = data5[i].$.YearHigh;
                                                    let YearLow = data5[i].$.YearLow;
                                                    let YearHighDate = data5[i].$.YearHighDate;
                                                    let YearLowDate = data5[i].$.YearLowDate;
                                                    let YearUnadjustHighDate = data5[i].$.YearUnadjustHighDate;
                                                    let YearUnadjustLowDate = data5[i].$.YearUnadjustLowDate;
                                                    MessageContent += '52 Week High Low of *' + text + '*\n\n';
                                                    // MessageContent += '*' + (i + 1) + '*' + '. ' + 'Last traded at :' + LastTradeRate + '\n' + 'Week High :' + WeekHigh + '\n'
                                                    //     + 'Week Low : ' + WeekLow + '\n' + 'Month High :' + MonthHigh + '\n' + 'Month Low :' + MonthLow + '\n' + 'Year High :' + YearHigh + '\n' + 'Year Low :' + YearLow;
                                                    MessageContent += '*Last traded at* :' + LastTradeRate + '\n\n' + '*Week High* :' + WeekHigh + ' *:* ' + YearUnadjustHighDate + '\n\n'
                                                        // + '*Week Low* : ' + WeekLow + '\n\n' + '*Month High* :' + MonthHigh + '\n\n' + '*Month Low* :' + MonthLow + '\n\n' + '*Year High* :' + YearHigh + '\n\n' + '*Year Low* :' + YearLow + '\n\n';
                                                        + '*Week Low* : ' + WeekLow + ' *:* ' + YearUnadjustLowDate + '\n\n' + '*Month High* :' + MonthHigh + ' *:* ' + YearUnadjustHighDate + '\n\n' + '*Month Low* :' + MonthLow + ' *:* ' + YearUnadjustLowDate + '\n\n' + '*Year High* :' + YearHigh + '  *:*  ' + YearUnadjustHighDate + '\n\n' + '*Year Low* :' + YearLow + '  *:*  ' + YearUnadjustLowDate + '\n\n';
                                                }
                                            } else {
                                                //   MessageContent = '52 Week High Low of ' + text + '\n\n' ;
                                                MessageContent = '52 Week High Low of *' + text + '*\n\n' + '*Last traded at* : NA \n\n *Week High* : NA \n\n *Week Low* : NA \n\n *Month High* : NA\n\n *Month Low* : NA\n\n *Year High* : NA\n\n *Year Low* : NA';
                                            }
                                            callback(null, MessageContent);
                                        }
                                    } else {
                                        res.send({
                                            code: 100,
                                            status: 'FAILED',
                                            data: "NO record Found"
                                        });
                                    }
                                });
                            })
                            .catch(function (error) {
                                console.log(error);
                                callback(1);
                            });
                    }
                }
            });
            console.log(s.sql);
        }
    }
    async.waterfall([getScripCode], (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: 'FAILED',
                data: "Something went wrong"
            });
        } else {
            let response = {
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: result
            };
            res.status(200).json(response);
        }

    })
})

router.post('/MarketInformation/:freetext', (req, res) => {
    let FreeText = (typeof req.params.freetext != undefined) ? req.params.freetext + '' : '';
    let getUrl = (callback) => {
        var data = JSON.stringify({
            "UserID": "pinnacle",
            "PassWd": "BSE@chatbot",
            "SearchValue": FreeText,
            "FLAG": "200"
        });

        var config = {
            method: 'post',
            url: 'https://dfws.bseindia.com/DataFeedService/api/DataFeed/ITmines/w',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                console.log({ response })
                let MessageContent = '';
                let data = response.data;
                console.log(data.Error_Msg)
                if (data.Error_Msg == 'No records found') {
                    callback(error)
                }
                for (i = 0; i < data.length; i++) {
                    urls = data[i].URL;
                    MessageContent += urls + '\n\n';
                }
                callback(null, MessageContent)

            })
            .catch(function (error) {
                callback(error)
            });
    }
    async.waterfall([getUrl], (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: 'FAILED',
                data: "Something went wrong"
            });
        } else {
            let response = {
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: result
            };
            res.status(200).json(response);
        }

    })
})




module.exports = router;
