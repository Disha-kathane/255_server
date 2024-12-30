let express = require('express');
let router = express.Router();
let async = require('async');
let axios = require('axios');
let fs = require('fs');

/* GET users listing. */
router.post('/reportstatus/:mobile', function (req, res) {
    let Mobile = req.params.mobile;
    // let Labid = req.params.labid
    let data = JSON.stringify({
        // "LabId": Labid,
        "Mobile": Mobile
    });

    var config = {
        method: 'post',
        url: 'http://sterlingaccuris.in/reportStatus',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            if (response.data.code != 200) {
                res.status(200).json({ 'code': 100, 'status': 'Failed' });

            } else {
                let Message = response.data.data.status;
                console.log(Message)
                res.status(200).json({ 'code': 200, 'status': 'success', 'type': 'text', "data": Message });
            }

        })
        .catch(function (error) {
            console.log(error);
        });
});

router.post('/reportdownload/:mobile', function (req, res) {
    // let Labid = req.params.labid
    let Mobile = req.params.mobile;
    let data = JSON.stringify({
        // "LabId": Labid,
        "Mobile": Mobile
    });

    var config = {
        method: 'post',
        url: 'http://sterlingaccuris.in/reportDownload',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {

            let base64String = response.data.url;
            let base64pdf = base64String.split(';base64,').pop();
            fs.writeFile('./public/pdf-files/' + Mobile + 'sterlin.pdf', base64pdf, { encoding: 'base64' }, function (err) {
                let result = {
                    code: 200,
                    status: "success",
                    type: "document",
                    url: "http://68.183.90.255:5000/pdf-files/" + Mobile + "sterlin.pdf",
                    data: "Type # to go back to main menu"
                };
                res.status(200).json(result);
            });

        })
        .catch(function (error) {
            console.log(error);
        });

})

module.exports = router;