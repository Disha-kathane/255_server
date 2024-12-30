const express = require('express');
const router = express.Router();
let async = require('async');
let axios = require('axios');

router.post('/gADBYDoc', (req, res) => {

    var config = {
        method: 'post',
        url: 'https://osapi.doctor9.com/gADBYDoc',
        headers: {
            'authtoken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJUF9TRVNTSU9OX0lEIjozOTkzNzMsIk9SR19JRCI6MTE0NiwiTE9DX0lEIjoxMTg1LCJNSUdfSUQiOjExNjcsImlhdCI6MTY3MzQ0NjcyOX0.tc4zK-6S4o3D0mwNhzGe2CdWayvp4r3uGZguUGrx6Sg'
        }
    };

    axios(config)
        .then(function (response) {
            if (response.data.code == 100) {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });
            } else {

                let result = response.data.data;
                let response1 = {
                    code: 200,
                    status: "success",
                    type: "text",
                    data: result
                };
                res.status(200).json(response1);

            }
        })
        .catch(function (error) {
            console.log(error);
        });
});



router.post('/getAptBySlot/:SLOTS_ID/:PAT_NAME/:AGE/:GENDER/:PAT_MOBILE', (req, res) => {


    let SLOTS_ID = req.params.SLOTS_ID;
    let PAT_NAME = req.params.PAT_NAME;
    let AGE = req.params.AGE;
    let GENDER = req.params.GENDER;
    let PAT_MOBILE = req.params.PAT_MOBILE;

    var config = {
        method: 'post',
        url: 'https://apk.doctor9.com/osapi/api/getAptBySlot?',
        headers: {
            'authtoken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJUF9TRVNTSU9OX0lEIjozOTkzNzMsIk9SR19JRCI6MTE0NiwiTE9DX0lEIjoxMTg1LCJNSUdfSUQiOjExNjcsImlhdCI6MTY3MzQ0NjcyOX0.tc4zK-6S4o3D0mwNhzGe2CdWayvp4r3uGZguUGrx6Sg',
            'Content-Type': 'application/json'
        },
        data: { SLOTS_ID, PAT_NAME, AGE, GENDER, PAT_MOBILE }
    };


    axios(config)
        .then(function (response) {
            console.log('getAptBySlot : '+JSON.stringify(response.data));
            if (response.data.code == 100) {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });
            } else {

                let result = response.data.data;
                let response1 = {
                    code: 200,
                    status: "success",
                    type: "document",
                    url:"https://console.pinbot.ai/assets/flowbuilder/536/IMMIGRATION%20DOCUMENT_2-4-2022.pdf",
                    data: "Dear {{name_passport}}, You have an Appointment with DR.IMMIGRATION {{medical_checkup}} on {{available_date_resp}} {{slot_id_new}} (Apmnt Id:"+result+"). Please report at the hospital 15 Min prior to the scheduled Time. Please carry Government approved ID proof along with you.Thank you. - KD Hospital"
                };
                res.status(200).json(response1);

            }
        })
        .catch(function (error) {
            console.log(error);
        });
});


router.post('/gASByDoc/:SLOT_DATE', (req, res) => {


    let SLOT_DATE = req.params.SLOT_DATE;

    var config = {
        method: 'post',
        url: 'https://apk.doctor9.com/osapi/api/gASByDoc?',
        headers: {
            'authtoken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJUF9TRVNTSU9OX0lEIjozOTkzNzMsIk9SR19JRCI6MTE0NiwiTE9DX0lEIjoxMTg1LCJNSUdfSUQiOjExNjcsImlhdCI6MTY3MzQ0NjcyOX0.tc4zK-6S4o3D0mwNhzGe2CdWayvp4r3uGZguUGrx6Sg',
            'Content-Type': 'application/json'
        },
        data: { SLOT_DATE }
    };

    axios(config)
        .then(function (response) {
            if (response.data.code == 100) {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });
            } else {

                let result = response.data.data;
                let response1 = {
                    code: 200,
                    status: "success",
                    type: "text",
                    data: result
                };
                res.status(200).json(response1);

            }
        })
        .catch(function (error) {
            console.log(error);
        });

})


module.exports = router;