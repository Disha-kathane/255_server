const whatsappService = require('../../services/v1/whatsapp');
const templateService = require('../../services/v1/template')
const cron = require('node-cron');
const moment = require("moment");
var appLoggers = require('../../applogger.js');
var errorLogger = appLoggers.errorLogger;

module.exports = cron.schedule('*/10 * * * *', async () => {
    try {
        // const AccessToken = await templateService.getSystemAccessToken();
        const AccessToken = await templateService.template_getSystemAccessToken();

        const access_token = AccessToken[0].value;
        const watemplateStatus = await templateService.getTemplateTitlesUserid();

        if (watemplateStatus && watemplateStatus.length) {
            await Promise.all(watemplateStatus.map(async (item) => {
                const wabaTempTitle = await templateService.getWabaUserId(item.temptitle, item.userid, item.tempid);
                const templateStatus = await whatsappService.getMsgTemplateStatus(item.temptitle, access_token, wabaTempTitle);

                console.log("templateStatus", item.temptitle, templateStatus);
                let statusCode;
                if (templateStatus == 'REJECTED') {
                    statusCode = 2;
                } else if (templateStatus == 'APPROVED') {
                    statusCode = 1;
                } else if (templateStatus == 'DISABLED') {
                    statusCode = 12;
                } else if (templateStatus == 'PAUSED') {
                    statusCode = 11;
                } else if (templateStatus == 'FLAGGED') {
                    statusCode = 5;
                } else if (templateStatus == 'BAD REQUEST') {
                    statusCode = 3;
                } else if (templateStatus == 'INVALID REQUEST') {
                    statusCode = 4;
                } else if (templateStatus == 'IN REVIEW') {
                    statusCode = 6;
                } else if (templateStatus == 'ACTIVE - QUALITY PENDING') {
                    statusCode = 7;
                } else if (templateStatus == 'ACTIVE - HIGH QUALITY') {
                    statusCode = 8;
                } else if (templateStatus == 'ACTIVE - MEDIUM QUALITY') {
                    statusCode = 9;
                } else if (templateStatus == 'ACTIVE - LOW QUALITY') {
                    statusCode = 10;
                } else if (templateStatus == 'APPEAL REQUESTED') {
                    statusCode = 13;
                } else {
                    statusCode = 0;
                }
                const responseStatus = await templateService.updateMsgTemplateStatus(statusCode, item.temptitle, item.userid, item.tempid);
                
                await sleep(10000);

                return;
            }))
        }
    } catch (error) {
        errorLogger.error(JSON.stringify(error));
        return responseHelper(500, error.messagetype, null, error);
    }
}, {
    scheduled: false
});


async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}
