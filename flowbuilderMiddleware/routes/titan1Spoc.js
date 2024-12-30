let express = require('express');
let router = express.Router();
let dbpool = require('../db/connection');

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

router.post('/checkReferral', async (req, res) => {
    try {
        let wabanumber = req.body.wabanumber;
        let recipientno = req.body.recipientno;
        let flowid = req.body.flowtoken;

        let query = null;
        let values = null;
        let result = null;

        query = "SELECT CONVERT(wabapayload using utf8) AS wabapayload, messagetype FROM ezb_message_sent_master WHERE contactno = ? AND mobileno = ? AND direction = ? AND messagetype = ? ORDER BY id desc LIMIT ?";
        values = ['+' + wabanumber, recipientno, 0, 9, 1];
        result = await dbpool.query(query, values);
        if (result[0][0] != undefined && isJsonString(result[0][0].wabapayload)) {
            let wabapayload = JSON.parse(result[0][0].wabapayload);
            console.log(wabapayload);
            
            if (isJsonString(wabapayload.body)) {
                let temp_flow_id = JSON.parse(wabapayload.body).flow_token;
                console.log({ temp_flow_id });
                console.log(temp_flow_id == flowid);
                if (temp_flow_id == flowid) {
                    res.send({
                        code: 200,
                        status: 'success'
                    });
                } else {
                    res.send({
                        code: 100,
                        status: 'failed'
                    });
                }
            }
            else {
                res.send({
                    code: 100,
                    status: 'failed'
                });
            }
        } else {
            res.send({
                code: 100,
                status: 'failed'
            });
        }
    } catch (error) {
        console.log(error);
        return res.send({ code: 500, status: 'failed' });
    }
});

router.post('/checkReferral_1', async (req, res) => {
    try {
        let wabanumber = req.body.wabanumber;
        let recipientno = req.body.recipientno;
        let flowid = req.body.flowtoken;

        let query = null;
        let values = null;
        let result = null;

        query = "SELECT CONVERT(wabapayload using utf8) AS wabapayload, messagetype FROM ezb_message_sent_master WHERE contactno = ? AND mobileno = ? AND direction = ? ORDER BY id desc LIMIT ?";
        values = ['+' + wabanumber, recipientno, 1, 1];
        result = await dbpool.query(query, values);
        let wabapayload = JSON.parse(result[0][0].wabapayload);
        let messagetype = result[0][0].messagetype;
        console.log({ wabapayload });
        if ((wabapayload == undefined &&
            wabapayload == null) || wabapayload.template==undefined) {
            return res.send({
                code: 100,
                status: 'failed'
            });
        }
        let buttonindex = wabapayload.template.components.findIndex(x => x.type === "button");
        console.log({ buttonindex });
        if (result[0][0] != undefined &&
            wabapayload.template.components[buttonindex] != undefined &&
            isJsonString(result[0][0].wabapayload)) {
            let temp_flow_id = wabapayload.template.components[buttonindex].parameters[0].action.flow_token;
            console.log({ temp_flow_id });
            if (temp_flow_id == flowid && messagetype == 8) {
                res.send({
                    code: 200,
                    status: 'success'
                });
            } else {
                res.send({
                    code: 100,
                    status: 'failed'
                });
            }
        } else {
            res.send({
                code: 100,
                status: 'failed'
            });
        }
    } catch (error) {
        console.log(error);
        return res.send({ code: 500, status: 'failed' });
    }
});

module.exports = router;