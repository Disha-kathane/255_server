const whatsappService = require('../../services/v1/whatsapp');
const userService = require('../../services/v1/users');
const responseHelper = require('../../utils/responseHelper');
var appLoggers = require('../../applogger.js');
var errorLogger = appLoggers.errorLogger;


module.exports = async (req, res) => {
    try {

        if (!req.headers.apikey) {
            return responseHelper(403, 'API Key is required');
        }

        if (!req.body.wanumber) {
            return responseHelper(403, 'Wa  Number is required');
        }

        let waNumberID = req.body.wanumber;
        const apiKey = req.headers.apikey;
        const { userId, wabaId } = await userService.getUserId(apiKey);
        const { waurl, authtoken, usrnm, usrpass, wanumber } = await userService.getUserSettings(userId);




        const access_token = await userService.fetchAccessToken();
        console.log("access_toeken ================>", access_token);

        if (!waNumberID) {
            return responseHelper(400, 'waNumber is required');
        }

        waNumberID = waNumberID.toString().replace(/[^0-9]/g, "");

        if (!(waNumberID.length >= 10)) {
            return responseHelper(404, 'Invalid Number');
        }

        if (/^\+/.test(waNumberID) == true) {
            waNumberID = waNumberID.toString().replace('+', '');
        }

        AppendResult = '+' + waNumberID;
        const wabaNumber = await userService.getWabanumber(userId);
        let PhoneResult = await whatsappService.getPhoneNumberId(wabaNumber, access_token);
        var Id = [];
        console.log(PhoneResult)
        for (let i = 0; i < PhoneResult.data.length; i++) {
            console.log('waNumberID: ', (JSON.stringify(PhoneResult.data[i].display_phone_number).toString().replace(/[^0-9]/g, "")), (waNumberID));
            if (JSON.stringify(PhoneResult.data[i].display_phone_number).toString().replace(/[^0-9]/g, "") == waNumberID) {
                console.log('JSON.stringify(PhoneResult.data[i].display_phone_number).toString().replace(/[^0-9]/g, ""): ' + JSON.stringify(PhoneResult.data[i].display_phone_number).toString().replace(/[^0-9]/g, ""), PhoneResult.data[i].platform_type, PhoneResult.data[i].throughput.level);
                // console.log({ Id });
                let updateTPSInfoResult = await userService.updateTPSInfo(JSON.stringify(PhoneResult.data[i].display_phone_number).toString().replace(/[^0-9]/g, ""), PhoneResult.data[i].platform_type, PhoneResult.data[i].throughput.level);
                Id = PhoneResult.data[i].id;
                console.log("phonenumberid which is obtained ------------->", Id)
                console.log({ updateTPSInfoResult }, PhoneResult.data[i].id, Id);
            }
        }

        return ({
            code: 200,
            status: 'SUCCESS',
            message: 'Waba Phone Id',
            Id,
        });

    } catch (error) {
        console.log(error);
        errorLogger.error(JSON.stringify(error));
        return responseHelper(500, error.messagetype, null, error);

    }
};