const async = require('async');
const sendService = require('../../services/v1/send');
let axios = require('axios');


module.exports = async (req, res) => {

    let apikey = req.headers.apikey;

    let validateapikeyresult = await sendService.validateapikey(apikey);
    if (validateapikeyresult.length > 0 && validateapikeyresult[0].c == 1) {
        let userid = validateapikeyresult[0].userid;
        console.log({ userid });
        let fetchmediaresult = await sendService.fetchmedia(userid);
        let tempData = null;
        if (fetchmediaresult.length > 0) {
            tempData = 'media fetched successfully';
            for (let i = 0; i < fetchmediaresult.length; i++) {
                if (fetchmediaresult[i].type == 0) {
                    fetchmediaresult[i].type = 'document';
                } else if (fetchmediaresult[i].type == 1) {
                    fetchmediaresult[i].type = 'image';
                } else if (fetchmediaresult[i].type == 2) {
                    fetchmediaresult[i].type = 'video';
                }
            }
        } else {
            tempData = 'no record found';
        }
        res.send({ code: 200, status: 'success', message: tempData, data: fetchmediaresult });
    } else {
        res.send({ code: 100, status: 'success', data: 'invalid apikey' });
    }
};