const cron = require('node-cron');
const async = require('async');
const extramarksSevices = require('../services/extramarks');
const axios = require('axios');
const moment = require('moment');
const { errorLogger, infoLogger } = require('../applogger');

module.exports = cron.schedule('*/1 * * * * ', async () => {
    try {
        //console.log("scheduling cron after 2 days " + moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"));
        let count = 0;
        let templateId = null;
        let CheckContextIdResult;
        let GetMobileNoArry = await extramarksSevices.GetMobileNo();
        if (GetMobileNoArry.length > 0) {
            //console.log({ GetMobileNoArry });
            for (let i = 0; i < GetMobileNoArry.length; i++) {
                CheckContextIdResult = await extramarksSevices.CheckContextId(GetMobileNoArry[i].mobileno);
                //console.log("cron1", { CheckContextIdResult });
                // //console.log("cron1", { CheckContextIdResult })
                if (CheckContextIdResult.length > 0) {
                    let contextId = CheckContextIdResult[0].contextid;
                    if (contextId == null) {
                        let mobileno = CheckContextIdResult[0].mobileno;
                        let TargetDate = CheckContextIdResult[0].targetdate;
                        let Id = CheckContextIdResult[0].id;
                        let messageid = CheckContextIdResult[0].messageid;
                        // //console.log({ messageid, Id });
                        let currentDate = new Date();
                        // //console.log("cron1",{ currentDate })
                        flag = 1;
                        let data = null;
                        //console.log("cron1", messageid);
                        let currentTempNameResult = await extramarksSevices.FetchCurrentTempName(messageid);
                        // //console.log("cron1", { currentTempNameResult });
                        if (currentTempNameResult.length > 0) {
                            currentTempNameResult = currentTempNameResult[0].wabapayload;
                            let currentTempNameResult1 = JSON.parse(currentTempNameResult);
                            // //console.log(JSON.stringify(currentTempNameResult1));
                            if (currentTempNameResult1.type === 'template') {
                                let tempname = currentTempNameResult1.template.name;
                                let currentTempIdResult = await extramarksSevices.FetchCurrentTemplateId(tempname);
                                if (currentTempIdResult.length > 0) {
                                    // //console.log({ currentTempIdResult });
                                    let currentTempId = currentTempIdResult[0].tempid;
                                    let nextTempIdResult = await extramarksSevices.FetchNextTempId(currentTempId);
                                    if (nextTempIdResult.length > 0) {
                                        // //console.log("cron1", { nextTempIdResult });
                                        let nextTempId = nextTempIdResult[0].next_templateid;
                                        let issessionend = nextTempIdResult[0].issessionend;
                                        //console.log("cron1", { nextTempId });

                                        let currentTempIdResult = await extramarksSevices.getTemplateData(nextTempId);
                                        nextTempIdResult = currentTempIdResult[0].tempid;
                                        let head_mediatype = currentTempIdResult[0].head_mediatype;

                                        let SelectMediaUrlResult = await extramarksSevices.SelectMediaUrl(nextTempId);
                                        // //console.log("cron1", { currentDate, TargetDate });

                                        if (currentDate >= TargetDate && TargetDate != null) {
                                            //console.log("cron1", { currentDate, TargetDate });
                                            if (head_mediatype == 0) {
                                                //document template
                                                let MediaUrl = SelectMediaUrlResult[1].media_url;
                                                //console.log(MediaUrl.substring(MediaUrl.lastIndexOf('/') + 1));
                                                let tempText = MediaUrl.substring(MediaUrl.lastIndexOf('/') + 1);
                                                let tmpFile = await removeUnderscoreAndCapitalize(tempText);
                                                //console.log("cron1", { tmpFile });
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
                                            if (head_mediatype == null) {
                                                // text template
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

                                            //console.log(JSON.stringify(data));
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
                                                    // if (response.data.code == 200) {
                                                    //console.log(response.data);
                                                    infoLogger.info("REQUEST_BODY cron1:", JSON.stringify(response.data))
                                                    let result = await extramarksSevices.updateFlag(messageid);
                                                    if (issessionend == 1) {
                                                        let result = await extramarksSevices.lastsession(response.data.data.messageid);
                                                        //console.log({ result });
                                                    }
                                                    // }
                                                })
                                                .catch((error) => {
                                                    //console.log(error);
                                                });

                                        }

                                    } else {
                                        //console.log("no next templateid found");
                                    }
                                }

                            } else {
                                //console.log("Its not a template");
                            }
                        } else {
                            //console.log("no record found");
                        }
                    } else {
                        //console.log("context id is not null");
                    }
                } else {
                    //console.log("contextid is null");
                }
            }
            //  CheckContextIdResult = await extramarksSevices.CheckContextId();
        } else {
            //console.log("No Mobile No Found");
        }


    } catch (error) {
        errorLogger.error("**********************************");
        errorLogger.error("ERROR", error)
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
}











