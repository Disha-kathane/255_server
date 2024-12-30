const whatsappService = require('../../services/v1/whatsapp');
const templateService = require('../../services/v1/template');
const userService = require('../../services/v1/users');
const responseHelper = require('../../utils/responseHelper');
var appLoggers = require('../../applogger.js');
var errorLogger = appLoggers.errorLogger;

module.exports = async (req, res) => {
    try {

        if (!req.headers.apikey) {
            return responseHelper(403, 'API Key is required');
        }
        const apiKey = req.headers.apikey;
        const { userId, wabaId } = await userService.getUserId(apiKey);

        if (!userId) {
            return responseHelper(404, 'Correct API Key is required');
        }
        
        if (!(req.body.tempid && req.body.tempid.length)) {
            return responseHelper(404, 'Template Id cannot be empty');
        }
        
        const tempIdList = req.body.tempid;
        const placeholder = await templateService.getPlaceholderfromTempId(userId, tempIdList);
        var count = (placeholder.match(/[0-9]/g).length );
        return responseHelper(200, 'The count of placeholders from Template Id', count);  
       

    } catch (error) {
        console.log(error);
        errorLogger.error(JSON.stringify(error));
        return responseHelper(500, error.messagetype, null, error);
      // return responseHelper(error);
    }
}