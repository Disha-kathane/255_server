const whatsappService = require('../../services/v1/whatsapp');
const templateService = require('../../services/v1/template');
const userService = require('../../services/v1/users');
const responseHelper = require('../../utils/responseHelper');

module.exports = async (req, res) => {
    try {
        console.log("request body------------------------------------------------------------------------>", req.body);
        if (!req.headers.apikey) {
            return responseHelper(403, 'API Key is required');
        }
        const apiKey = req.headers.apikey;
        const { userId, wabaId } = await userService.getUserId(apiKey);

        if (!userId) {
            return responseHelper(404, 'Correct API Key is required');
        }

        if (!(req.body.tempid) && req.body.tempid == "") {
            return responseHelper(404, 'tempid cannot be empty');
        }

        // if (!(req.body.tempid && req.body.tempid.length)) {
        //     return responseHelper(404, 'tempid cannot be empty');
        // }

        // if (!(req.body.id && req.body.id.length)) {
        //     return responseHelper(404, 'tempid cannot be empty');
        // }

        const tempIdList = req.body.tempid;
        // const tempIdList = req.body.id;

        // const AccessToken = await templateService.getSystemAccessToken();
        const AccessToken = await templateService.template_getSystemAccessToken();

        const access_token = AccessToken[0].value;
        const tempListResponse = await templateService.getTemplateDetails(tempIdList, userId);

        if (!tempListResponse) {
            return responseHelper(404, 'Template details not found');
        }

        const result = await whatsappService.deleteMsgTemplate(access_token, tempListResponse.temptitle, wabaId);

        return responseHelper(200, 'The Template has been delete', result);
    } catch (error) {
        return responseHelper(500, error.messagetype, null, error);
    }
};
