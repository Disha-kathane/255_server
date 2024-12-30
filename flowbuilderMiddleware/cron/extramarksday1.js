const cron = require('node-cron');
const async = require('async');
const extramarksSevices = require('../services/extramarks');
const axios = require('axios');
const moment = require('moment');
const { errorLogger, infoLogger } = require('../applogger');


module.exports = cron.schedule('*/1 * * * * ', async () => {
    try {
        // console.log("scheduling cron after 1 days " + moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"));
        let GetMobileNoArry = await extramarksSevices.GetMobileNo();
        if (GetMobileNoArry.length > 0) {
            for (let i = 0; i < GetMobileNoArry.length; i++) {
                let SelectContexIdDataResult = await extramarksSevices.SelectContexIdData(GetMobileNoArry[i].mobileno);
                // console.log("cron2", { SelectContexIdDataResult });
                if (SelectContexIdDataResult.length > 0) {
                    let contextId = SelectContexIdDataResult[0].contextid;
                    if (contextId !== null) {
                        let data = null;
                        let Id = SelectContexIdDataResult[0].id;
                        let mobileno = SelectContexIdDataResult[0].mobileno;
                        let TargetDate = SelectContexIdDataResult[0].targetdate;
                        let flag = SelectContexIdDataResult[0].flag;
                        let type = SelectContexIdDataResult[0].type;
                        let messageid = SelectContexIdDataResult[0].messageid;
                        let currentDate = new Date();
                        // console.log("cron2", { currentDate });
                        let currentTempNameResult = await extramarksSevices.FetchCurrentTempName(messageid);
                        if (currentTempNameResult.length > 0) {
                            currentTempNameResult = currentTempNameResult[0].wabapayload;
                            let currentTempNameResult1 = JSON.parse(currentTempNameResult);
                            // console.log(JSON.stringify(currentTempNameResult1));
                            let currentTempID = currentTempNameResult1.body;
                            console.log("cron2", { currentTempID });
                            let nextTempIdResult = await extramarksSevices.FetchNextTempId(currentTempID);
                            console.log({ nextTempIdResult });
                            if (nextTempIdResult.length > 0) {
                                console.log("cron2", { nextTempIdResult });
                                let nextTempId = nextTempIdResult[0].next_templateid;
                                let issessionend = nextTempIdResult[0].issessionend;
                                console.log("cron2", { nextTempId });
                                let currentTempIdResult = await extramarksSevices.getTemplateData(nextTempId);
                                // console.log("cron2", { currentTempIdResult });
                                nextTempIdResult = currentTempIdResult[0].tempid;
                                let head_mediatype = currentTempIdResult[0].head_mediatype;
                                let SelectMediaUrlResult = await extramarksSevices.SelectMediaUrl(nextTempId);
                                // console.log("cron2", SelectMediaUrlResult[1].media_url);

                                console.log("cron2", { currentDate, TargetDate });
                                if (nextTempId == '61116' || nextTempId == '61117') {
                                    console.log("inside 61116  61117 templateid");
                                    console.log("original target date", { TargetDate });
                                    let targetDate = new Date(TargetDate);
                                    targetDate.setDate(targetDate.getDate() + 1);

                                    // console.log(targetDate.toISOString());
                                    // let newDate = moment(TargetDate).add(1, 'day');
                                    // let formattedDate = newDate.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
                                    // console.log({ currentDate, formattedDate });
                                    // currentDate = currentDate.toString();
                                    // console.log({ currentDate });

                                    console.log("new target date", { targetDate, currentDate });
                                    if (currentDate >= targetDate && targetDate != null) {
                                        console.log("cron2", "inside matched date", head_mediatype);
                                        if (head_mediatype == null) {
                                            //text template
                                            let MediaUrl = SelectMediaUrlResult[1].media_url;

                                            data = {
                                                "from": "918287177777",
                                                "to": mobileno,
                                                "type": "template",
                                                "message": {
                                                    "templateid": nextTempId,
                                                    "placeholders": [],
                                                    "footer": {
                                                        "text": "pinnacle.in"
                                                    },
                                                    "buttons": [
                                                        {
                                                            "index": 0,
                                                            "type": "quick_reply",

                                                        }
                                                    ]
                                                }
                                            };
                                        }

                                        let config = {
                                            method: 'post',
                                            maxBodyLength: Infinity,
                                            url: 'https://api.pinbot.ai/v2/wamessage/sendMessage',
                                            headers: {
                                                'apikey': '85dd1519-7b6e-11ec-a7c7-9606c7e32d76',
                                                'Content-Type': 'application/json'
                                            },
                                            data: data
                                        };

                                        await axios.request(config)
                                            .then(async (response) => {
                                                if (response.data.code == 200) {
                                                    console.log(response.data);
                                                    infoLogger.info("REQUEST_BODY cron2:", JSON.stringify(response.data));
                                                    let result = await extramarksSevices.updateFlag(messageid);
                                                    if (issessionend == 1) {
                                                        let result = await extramarksSevices.lastsession(response.data.data.messageid);
                                                        // console.log({ result });
                                                    }
                                                }
                                            })
                                            .catch((error) => {
                                                console.log(error);
                                            });

                                    }
                                } else {
                                    if (currentDate >= TargetDate && TargetDate != null) {
                                        console.log("cron2", "inside matched condition of day 1");
                                        console.log("cron2", { currentDate, TargetDate });
                                        if (head_mediatype == 0) {
                                            //document template
                                            let MediaUrl = SelectMediaUrlResult[1].media_url;
                                            console.log(MediaUrl.substring(MediaUrl.lastIndexOf('/') + 1));
                                            let tempText = MediaUrl.substring(MediaUrl.lastIndexOf('/') + 1);
                                            let tmpFile = await removeUnderscoreAndCapitalize(tempText);
                                            console.log("cron2", { tmpFile });
                                            data = {
                                                "from": "918287177777",
                                                "to": mobileno,
                                                "type": "template",
                                                "message": {
                                                    "templateid": nextTempId,
                                                    "placeholders": [],
                                                    "url": MediaUrl,
                                                    "filename": tmpFile,
                                                    "footer": {
                                                        "text": "pinnacle.in"
                                                    },
                                                    "buttons": [
                                                        {
                                                            "index": 0,
                                                            "type": "quick_reply",

                                                        }
                                                    ]
                                                }
                                            };
                                        }

                                        // console.log(data);
                                        let config = {
                                            method: 'post',
                                            maxBodyLength: Infinity,
                                            url: 'https://api.pinbot.ai/v2/wamessage/sendMessage',
                                            headers: {
                                                'apikey': '85dd1519-7b6e-11ec-a7c7-9606c7e32d76',
                                                'Content-Type': 'application/json'
                                            },
                                            data: data
                                        };

                                        await axios.request(config)
                                            .then(async (response) => {
                                                if (response.data.code == 200) {
                                                    console.log(response.data);
                                                    infoLogger.info("REQUEST_BODY cron2:", JSON.stringify(response.data));
                                                    let result = await extramarksSevices.updateFlag(messageid);
                                                    if (issessionend == 1) {
                                                        let result = await extramarksSevices.lastsession(response.data.data.messageid);
                                                        // console.log({ result });
                                                    }
                                                }
                                            })
                                            .catch((error) => {
                                                console.log(error);
                                            });
                                    }
                                }

                            } else {
                                console.log("no next templateid found");
                            }
                        }
                    }

                }
            }
        } else {
            console.log("No Mobile No Found");
        }

    } catch (error) {
        errorLogger.error("**********************************");
        errorLogger.error("ERROR", error);
        console.log({
            code: 'WA101',
            status: 'FAILED',
            message: error.message,
            data: []
        });
    }

});




let removeUnderscoreAndCapitalize = async (str) => {
    var words = str.split('_');
    for (var i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substring(1);
    }
    return words.join(' ');
};
