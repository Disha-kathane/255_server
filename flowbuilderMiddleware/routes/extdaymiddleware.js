const express = require('express');
const axios = require('axios');
const router = express.Router();
const moment = require('moment');


router.post('/', async (req, res) => {
    try {
        let today = moment()
        let daysToAdd = 1; // Start with adding one day
        if (today.day() === 6) {
            daysToAdd++; // Add an additional day to skip Sunday
        }

        // Set the new date by adding the days
        today.add(daysToAdd, 'days');

        // Get the next three days
        var nextThreeDays = [];
        let tempText = ''
        for (var i = 0; i < 3; i++) {
            nextThreeDays.push(today.format('dddd')); // Add numbering before each day
            if (today.day() === 6) {
                today.add(1, 'days');
            }
            today.add(1, 'days');
            tempText += 'Type *' + [i + 1] + '*. for ' + nextThreeDays[i] + '\n';
        }


        return res.send({ code: 200, status: "success", type: "text", data: tempText });



    } catch (error) {
        res.send({
            code: 100,
            status: 'FAILED',
            data: "Something Went Wrong"
        });
    }
})


router.post('/test', async (req, res) => {
    try {
        let today = moment();
        let daysToAdd = 1; // Start with adding one day
        if (today.day() === 6) {
            daysToAdd++; // Add an additional day to skip Sunday
        }

        // Set the new date by adding the days
        today.add(daysToAdd, 'days');

        // Get the next three days
        var nextThreeDays = [];
        let tempText = '';
        for (var i = 0; i < 3; i++) {
            nextThreeDays.push(today.format('dddd')); // Add numbering before each day
            if (today.day() === 6) {
                today.add(1, 'days');
            }
            today.add(1, 'days');
            // tempText += 'Type *' + [i + 1] + '*. for ' + nextThreeDays[i] + '\n';
        }


        // return res.send({ code: 200, status: "success", type: "text", data: tempText });

        return res.send(
            {
                code: "200",
                status: "success",
                type: "button",
                data: {
                    "header_type": "",
                    "header_media_url": "",
                    "header_text": "",
                    "body_text": "🗓️ To schedule a call please tap on below button to select the day",
                    "footer_text": "",
                    "buttons": [
                        nextThreeDays[0],
                        nextThreeDays[1],
                        nextThreeDays[2],

                    ]
                }
            }
        );



    } catch (error) {
        res.send({
            code: 100,
            status: 'FAILED',
            data: "Something Went Wrong"
        });
    }
});






module.exports = router;