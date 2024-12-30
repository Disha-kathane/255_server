const express = require('express');
const router = express.Router();
let async = require('async');
let axios = require('axios');
var http = require('http');
var https = require('https');
var httpUrl = require('url');

router.post('/demoEnquiry/:wanumber', (req, res) => {
    let m = req.params.wanumber;
    if (m.length == 12 && m.startsWith("91")) {
        m = m.substring(2, 12);
    }
    if (m.length == 13 && m.startsWith("+91")) {
        m = m.substring(3, 13);
    }
    if (m.length == 13 && m.startsWith("091")) {
        m = m.substring(3, 13);
    }
    if (m.length == 11 && m.startsWith("0")) {
        m = m.substring(1, 11);
    }

    let url = 'https://click2call.pinnacle.in/demoEnquiry';

    var data = JSON.stringify({
        "mobile_no": m
    });

    var config = {
        method: 'post',
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Cookie': 'connect.sid=s%3AuxJcoAsPE5CaBLmRyIYGlU3AIrN5r6H2.m1qlpCTl3%2FdHOOg9gryYJDXDreDNzFZTilCtqcIJ9eo'
        },
        data: data
    };

    let protocol = httpUrl.parse(url).protocol;
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

    axios(config)
        .then(function (response) {
            let result = response.data.message;
            let response1 = {
                code: 200,
                status: "success",
                type: "text",
                data: result
            };
            res.status(200).json(response1);
        })
        .catch(function (error) {
            let err_res = {
                code: 100,
                status: 'failed',
                data: 'Something went wrong'
            };
            res.status(100).json(err_res);
        });
});

router.post('/campdash/:wanumber/:keyword/:name', (req, res) => {
    let m = req.params.wanumber;
    let k = req.params.keyword;
    let n = req.params.name;
    let url = 'https://schatapi.pinnacle.in/campaign';

    var data = JSON.stringify({
        "campaignId": "7234424",
        "keyword": k,
        "mobile": m,
        "mode": "whatsapp",
        "name": n
    });

    var config = {
        method: 'post',
        url: url,
        headers: {
            'APIKEY': 'asdfqwrcver',
            'Content-Type': 'application/json'
        },
        data: data
    };

    let protocol = httpUrl.parse(url).protocol;
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

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            let response1 = {
                code: 200,
                status: "success",
                type: "text",
                data: 'Thanks for contacting us.'
            };
            res.status(200).json(response1);
        })
        .catch(function (error) {
            console.log(error);
            let err_res = {
                code: 100,
                status: 'failed',
                data: 'Something went wrong'
            };
            res.status(100).json(err_res);
        });
});

module.exports = router;