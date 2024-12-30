const express = require('express');
const router = express.Router();
let async = require('async');
let axios = require('axios');

router.post('/leads/:name/:email/:phone/:city', (req, res) => {

    let name = req.params.name;
    let Email = req.params.email;
    let mobile = req.params.phone;
    let city = req.params.city;
    // let Lead_Fields = req.params.{ 'project_4b930261': lead_fields };

    let data = {
        "name": name,
        "email": Email,
        "phone": mobile,
        "lead_fields": {
            "project_4b930261": [
                city
            ]
        }
    };

    var config = {
        method: 'post',
        url: 'https://api.metroleads.com/companies/8db79d80-37d2-40f8-8447-60f8e76e2f5b/leads/upsert',
        headers: {
            'Authorization': 'Basic YW5pc2guckBtaXR0YWxjb3JwLmNvLmluOmQ0OTNkYjAyLTY3ZGItNGMzZC05NGMxLWMwYzA4NjM5NGE0Nw==\' \\',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            if (response.data.code == 100) {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });
            } else {
                let result = response.data.lead_ids[0];
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



router.post('/lead_1/:name/:email/:phone/:projectName', (req, res) => {

    let Name = req.params.name;
    let Email = req.params.email;
    let mobile = req.params.phone;
    let ProjectName = req.params.projectName;
    let username = 'mla+surekha@metroguild.com';
    let password = '0d84d1ce-f113-4108-a304-9370fca908bd';
    let auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

    let data = {
        "name": Name,
        "email": Email,
        "phone": mobile,
        "lead_fields": {
            "project_b03": [
                ProjectName
            ]
        }
    };
    console.log(JSON.stringify(data));

    let config = {
        method: 'post',
        url: 'https://api.metroleads.com/companies/5efcd56c-9289-4ad3-8688-80c7da94d9e7/leads/upsert',
        headers: {
            'Authorization': auth,
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    };

    axios(config)
        .then(function (response) {

            // console.log('res ===========>' + response);
            console.log(JSON.stringify(response.data));

            if (response.data.code == 100) {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    // data: response.data.data,
                    data: "Something went wrong"
                });
            } else {
                let result = response.data.lead_ids[0];
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
            let data_1 = error.response.data;
            res.send({
                code: 100,
                status: 'FAILED',
                data: data_1
            });
        });

});

module.exports = router;