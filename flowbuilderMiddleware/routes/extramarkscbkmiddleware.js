const express = require('express');
const router = express.Router();
const axios = require('axios');
router.use(express.json());
const extramarksSevices = require('../services/extramarks')

router.post('/:userid', async (req, res) => {
    let UserId = req.params.userid;
    let type = null;
    let mobileno = null;
    let messageid = null;
    let contextid = null;
    let wabanumber = null;

    let data = JSON.stringify(req.body);
    console.log("request 123456 ---",JSON.stringify(req.body))
    try {
        if (req.body.entry[0].changes[0].value.hasOwnProperty('statuses')) {
            console.log("inside statuses")
            type = 1; // //for statuses
            if (req.body.entry[0].changes[0].value.statuses[0].status === 'sent') {
                mobileno = req.body.entry[0].changes[0].value.statuses[0].recipient_id;
                messageid = req.body.entry[0].changes[0].value.statuses[0].id;
                wabanumber = req.body.entry[0].changes[0].value.metadata.display_phone_number;
                if (wabanumber === '918287177777') {
                    let InsertResult = await extramarksSevices.InsertCallbackData(wabanumber, mobileno, messageid, type, contextid);
                }
                // if (mobileno === '918830145689' || mobileno === "917276314872" || mobileno === "919970907421" || mobileno === "917507066331" || mobileno === "917972892712") {
                // let InsertResult = await extramarksSevices.InsertCallbackData(wabanumber, mobileno, messageid, type, contextid);
                // }

            }
        }
        if (req.body.entry[0].changes[0].value.hasOwnProperty('contacts') &&
            req.body.entry[0].changes[0].value.hasOwnProperty('messages')) {
            console.log("inside contacts")
            type = 2; //for contacts
            if (req.body.entry[0].changes[0].value.messages[0].context !== undefined) {
                contextid = req.body.entry[0].changes[0].value.messages[0].context.id;
            }
            mobileno = req.body.entry[0].changes[0].value.contacts[0].wa_id;
            messageid = req.body.entry[0].changes[0].value.messages[0].id;
            wabanumber = req.body.entry[0].changes[0].value.metadata.display_phone_number;
            if (wabanumber === '918287177777') {
                let InsertResult = await extramarksSevices.InsertCallbackData(wabanumber, mobileno, messageid, type, contextid);
            }
            // if (mobileno === '918830145689' || mobileno === "917276314872" || mobileno === "919970907421" || mobileno === "917507066331" || mobileno === "917972892712") {
            // let InsertResult = await extramarksSevices.InsertCallbackData(wabanumber, mobileno, messageid, type, contextid);
            // }
        }
        return res.send({ "code": 200, "status": "success" })
        // let CheckMobileNoResult = await extramarksSevices.CheckMobileNo(mobileno);
        // if (CheckMobileNoResult[0].c === 0 && mobileno === "918830145689") {
        //     // console.log({ mobileno, messageid, contextid })
        //     let InsertResult = await extramarksSevices.InsertCallbackData(mobileno, messageid, type, contextid);
        // } else {
        //     // console.log({ mobileno, contextid })
        //     let ReplaceResult = await extramarksSevices.ReplaceCallbackData(mobileno, contextid, type);
        // }
    } catch (error) {
        console.log(error)
        return res.send({ "code": 100, "status": "failed" })
    }

});

module.exports = router;




