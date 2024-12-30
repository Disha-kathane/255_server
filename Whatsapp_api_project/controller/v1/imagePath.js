const whatsappService = require('../../services/v1/whatsapp');
const userService = require('../../services/v1/users');
const responseHelper = require('../../utils/responseHelper');
const moment = require("moment");
var appLoggers = require('../../applogger.js');
var errorLogger = appLoggers.errorLogger;

module.exports = async (req, res) => {
    try {
        let fetchImagePath;
        const messageId = req.body.messageid.trim();
        const mobileNo = req.body.mobileno.trim();

        if (!messageId) {
            return responseHelper(404, 'Correct message ID is required');
        }

        if (!mobileNo) {
            return responseHelper(404, 'correct Mobile number is required');
        }


        console.log("messageId", typeof(messageId));
        console.log("mobileNo", typeof(mobileNo));

        setTimeout(async () => {
            fetchImagePath = await userService.getImagePath(messageId, mobileNo);
            console.log("fetchImagePath", fetchImagePath);
            res.send(fetchImagePath);
        },3000);
        
    } catch (error) {
        console.log(error);
        errorLogger.error(JSON.stringify(error));
        return responseHelper(500, error.messagetype, null, error);
      // return responseHelper(error);
    }
}