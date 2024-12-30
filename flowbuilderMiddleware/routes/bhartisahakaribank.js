let express = require('express');
let router = express.Router();
let async = require('async');
let axios = require('axios');
const fs = require('fs');


router.post('/balanceenquiry/:mobile/:text', (req, res) => {

    let Mobilenumber = req.params.mobile;
    let Text = req.params.text;
    let match = Mobilenumber.match(/\d{10}$/g)
    Mobilenumber = match[0]

    console.log('Mobilenumber==============================>' + JSON.stringify(Mobilenumber));
    console.log('Text======================>' + JSON.stringify(Text));
    var config = {
        method: 'post',
        url: 'https://demo.jjitonline.com/jw_assist/jwAssist.asmx/WhatsAppDirectApi?mobile=' + Mobilenumber + '&type=' + 17 + '&text=' + Text + '',
        headers: {
            'ApiKey': 'ffbdn7nl6Fg6D81K9SH7hu2B3l8KuIzXsVRv+2+Ror4='
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
})


router.post('/ministatement/:mobile/:text', (req, res) => {


    let Mobilenumber = req.params.mobile;
    let Text = req.params.text;
    let match = Mobilenumber.match(/\d{10}$/g)
    Mobilenumber = match[0]

    var config = {
        method: 'post',
        url: 'https://demo.jjitonline.com/jw_assist/jwAssist.asmx/WhatsAppDirectApi?mobile=' + Mobilenumber + '&type=' + 10 + '&text=' + Text + '',
        headers: {
            'ApiKey': 'ffbdn7nl6Fg6D81K9SH7hu2B3l8KuIzXsVRv+2+Ror4='
        }
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



router.post('/acdetails/:mobile/:text', (req, res) => {

    let Mobilenumber = req.params.mobile;
    let Text = req.params.text;
    let match = Mobilenumber.match(/\d{10}$/g)
    Mobilenumber = match[0]



    var config = {
        method: 'post',
        url: 'https://demo.jjitonline.com/jw_assist/jwAssist.asmx/WhatsAppDirectApi?mobile=' + Mobilenumber + '&type=' + 13 + '&text=' + Text + '',
        headers: {
            'ApiKey': 'ffbdn7nl6Fg6D81K9SH7hu2B3l8KuIzXsVRv+2+Ror4='
        }
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



router.post('/lodgedclearing/:mobile/:text', (req, res) => {

    let Mobilenumber = req.params.mobile;
    let Text = req.params.text;
    let match = Mobilenumber.match(/\d{10}$/g)
    Mobilenumber = match[0]

    var config = {
        method: 'post',
        url: 'https://demo.jjitonline.com/jw_assist/jwAssist.asmx/WhatsAppDirectApi?mobile=' + Mobilenumber + '&type=' + 14 + '&text=' + Text + '',
        headers: {
            'ApiKey': 'ffbdn7nl6Fg6D81K9SH7hu2B3l8KuIzXsVRv+2+Ror4='
        }
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



router.post('/getbranchlist/:mobile/:text', (req, res) => {

    let Mobilenumber = req.params.mobile;
    let Text = req.params.text;
    let match = Mobilenumber.match(/\d{10}$/g)
    Mobilenumber = match[0]

    var config = {
        method: 'post',
        url: 'https://demo.jjitonline.com/jw_assist/jwAssist.asmx/WhatsAppDirectApi?mobile=' + Mobilenumber + '&type=' + 22 + '&text=' + Text + '',
        headers: {
            'ApiKey': 'ffbdn7nl6Fg6D81K9SH7hu2B3l8KuIzXsVRv+2+Ror4='
        }
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


router.post('/statement/:mobile/:text/:period', (req, res) => {


    let Mobilenumber = req.params.mobile;
    let Text = req.params.text;
    let Period = req.params.period;
    let match = Mobilenumber.match(/\d{10}$/g)
    Mobilenumber = match[0]



    var config = {
        method: 'post',
        url: 'https://demo.jjitonline.com/jw_assist/jwAssist.asmx/WhatsAppDirectApi?mobile=' + Mobilenumber + '&type=' + 11 + '&text=' + Text + '&period=' + Period + '',
        headers: {
            'ApiKey': 'ffbdn7nl6Fg6D81K9SH7hu2B3l8KuIzXsVRv+2+Ror4='
        }
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
                let result = response.data.data;
                let temparr = result.split('|');
                if (result.includes('|') && result.split('|')) {
                    console.log('temparr=================================>' + JSON.stringify(temparr));
                    fs.writeFile('./public/pdf-files/' + temparr[1] + '.pdf', temparr[2], { encoding: 'base64' }, function (err) {
                        let response1 = {
                            code: 200,
                            status: "success",
                            type: "document",
                            url: "http://68.183.90.255:5000/pdf-files/" + temparr[1] + ".pdf",
                            data: temparr[3]

                        };
                        res.status(200).json(response1);
                    });
                }
                else {
                    let result = response.data.data;
                    let response1 = {
                        code: 200,
                        status: "success",
                        type: "text",
                        data: result
                    };
                    res.status(200).json(response1);
                }

            }
        })


        .catch(function (error) {
            console.log(error);
        });

})



module.exports = router;