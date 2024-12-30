const express = require('express');
const router = express.Router();
const axios = require('axios');
const mysql = require('mysql2');
let http = require('http');
let https = require('https');
let httpUrl = require('url');

let db_config = {
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};

let dbpool = mysql.createPool(db_config).promise();


router.post('/callback/:wanumber', async (req, res) => {
    console.log('YAMAHA_CALLBACK : '+JSON.stringify(req.body));
    let wabanumber = req.params.wanumber;
    let obj = req.body;
    let sessionid = null;
    let billing = null;
    let query = null;
    let values = null;
    
    if (obj.entry[0].changes != undefined && obj.entry[0].changes[0].value.hasOwnProperty('statuses')) {
        let recipient_id = obj.entry[0].changes[0].value.statuses[0].recipient_id;
        let status = obj.entry[0].changes[0].value.statuses[0].status;
        if (obj.entry[0].changes[0].value.statuses[0].conversation !== undefined
            && obj.entry[0].changes[0].value.statuses[0].conversation.id !== undefined) {
            sessid = obj.entry[0].changes[0].value.statuses[0].conversation.id;
            billing = obj.entry[0].changes[0].value.statuses[0].pricing.billable;

            query = 'SELECT COUNT(1) AS C FROM ezeebot.ezb_message_sent_master WHERE SESSID = ?';
            values = [sessid];

            let sessionidresult = await dbpool.query(query, values);
            console.log(sessionidresult[0]);

            let sessionidcount = sessionidresult[0][0].C;

            if (sessionidcount > 0) {
                obj.entry[0].changes[0].value.statuses[0].pricing.billable = false;
            } else {
                obj.entry[0].changes[0].value.statuses[0].pricing.billable = true;
            }

            query = 'SELECT CUSTOM_CALLBACK FROM ezeebot.ezb_custom_callback_url_master WHERE WANUMBER = ?';
            values = ['+' + wabanumber];

            let customcallbackresult = await dbpool.query(query, values);
            console.log(customcallbackresult[0]);

            let customcallbackurl = customcallbackresult[0][0].CUSTOM_CALLBACK;

            let data = JSON.stringify(obj);

            let config = {
                method: 'post',
                url: customcallbackurl,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };

            var protocol = httpUrl.parse(customcallbackurl).protocol;
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

            try {
                let customcallbackresponse = await axios(config);
                await insertlog(recipient_id, wabanumber, customcallbackurl, obj, customcallbackresponse.status, JSON.stringify(customcallbackresponse.data));
                console.log(customcallbackresponse.status);
                res.send(customcallbackresponse.data);
            } catch (err) {
                console.log(err);
                await insertlog(recipient_id, wabanumber, customcallbackurl, obj, err.response.status, '' + err);
                res.send({
                    code: err.response.status,
                    status: 'failed'
                });
            }
        }
    } else {
        res.send('success');
    }
});

let insertlog = async (mobileno, wabanumber, customcallbackurl, payload, responsecode, response) => {
    let result = null;
    try {
        let query = 'INSERT INTO backup_storage.ezb_yamaha_custom_callback_log_master(mobileno,wabanumber,customcallbackurl,payload,responsecode,response)' +
            ' VALUES(?,?,?,?,?,?)';
        let values = [mobileno, wabanumber, customcallbackurl, JSON.stringify(payload), responsecode, response];
        let result = await dbpool.query(query, values);
        console.log(result[0]);
        return result;
    } catch (err) {
        console.log(err);
        return err;
    }
};

module.exports = router;