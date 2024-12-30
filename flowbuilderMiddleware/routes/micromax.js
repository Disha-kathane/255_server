let express = require('express');
let router = express.Router();
let async = require('async');
let axios = require('axios');
let FormData = require('form-data');
let mysql = require('mysql');


router.post('/SearchStoreCodes/:sPincode', (req, res) => {

    let sPincode = (typeof req.params.sPincode != 'undefined') ? req.params.sPincode + '' : '';
    // let sServicetype = (typeof req.params.sServicetype != 'undefined') ? req.params.sServicetype + '' : '';

    var config = {
        method: 'post',
        url: 'https://DCMAuth.micromaxinfo.com:8080/api/led/SearchStoreCodes_APIWhatsApp',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            sPincode: sPincode,
            sServicetype: "mobile"
        }
    };


    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));

            if (response.data.code == 200) {

                let result = response.data.responseBody.text;
                let response1 = {
                    code: 200,
                    status: "success",
                    type: "text",
                    data: result
                };
                res.status(200).json(response1);

            } else {

                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });

            }
        })
        .catch(function (error) {
            console.log(error);

        });
})


router.post('/SearchServiceCenter/:sPincode', (req, res) => {

    let sPincode = (typeof req.params.sPincode != 'undefined') ? req.params.sPincode + '' : '';

    var config = {
        method: 'post',
        url: 'https://DCMAuth.micromaxinfo.com:8080/api/Led/SearchServiceCenter_APIWhatsApp',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            sPincode: sPincode,
            sServicetype: "mobile"
        }
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));

            if (response.data.code == 200) {

                let result = response.data.responseBody.text;
                let response1 = {
                    code: 200,
                    status: "success",
                    type: "text",
                    data: result
                };
                res.status(200).json(response1);

            } else {

                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });

            }
        })
        .catch(function (error) {
            console.log(error);

        });
})

router.post('/getareaapi/:sPin', (req, res) => {

    let sPin = (typeof req.params.sPin != 'undefined') ? req.params.sPin + '' : '';

    var config = {
        method: 'post',
        url: 'https://DCMAuth.micromaxinfo.com:8080/api/LED/GetArea_APIWhatsAPP',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            sPin: sPin
        }
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));

            if (response.data.code == 200) {

                let result = response.data.responseBody.text;
                let response1 = {
                    code: 200,
                    status: "success",
                    type: "text",
                    data: result
                };
                res.status(200).json(response1);

            } else {

                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });

            }
        })
        .catch(function (error) {
            console.log(error);

        });
})

router.post('/GetInsertProductfeedback/:Feedback/:PhoneNumber', (req, res) => {

    let Feedback = (typeof req.params.Feedback != 'undefined') ? req.params.Feedback + '' : '';
    let PhoneNumber = (typeof req.params.PhoneNumber != 'undefined') ? req.params.PhoneNumber + '' : '';

    var config = {
        method: 'post',
        url: 'https://aapi.micromaxinfo.com/api/Apk/GetInsertProductInfo',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            Feedback: Feedback,
            PhoneNumber: PhoneNumber
        }
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });

})


//Micromax code 09/6/2022 added by sneha 

router.post('/GetInsertProductInfo/:flag/:limit/:page/:parentid', (req, res) => {
    let Flag = req.params.flag;
    let Limit = req.params.limit;
    let Page = req.params.page;
    let ParentID = req.params.parentid;
    var data = JSON.stringify({
        "Flag": Flag,
        "Limit": Limit,
        "Page": Page,
        "ParentID": ParentID
    });

    var config = {
        method: 'post',
        url: 'https://aapi.micromaxinfo.com/api/Apk/GetInsertProductInfo',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            console.log(response)
            let result = response.data.responseBody.text;
            if (response.data.code != '200') {
                res.status(200).json({ 'code': 100, 'status': 'Failed', data: response.data.status });
            } else {

                res.status(200).json({ 'code': 200, 'status': 'success', 'type': 'text', data: result });
            }
        })
        .catch(function (error) {
            res.status(200).json({ 'code': 100, 'status': 'Failed' });
        });
})



router.post('/TrackJobSheet/:sheetnumber', (req, res) => {
    let JobSheetNumber = req.params.sheetnumber;
    var data = JSON.stringify({
        "sJobSheetNumber": JobSheetNumber,
        "sJobSheetType": "mobile"
    });

    var config = {
        method: 'post',
        url: 'https://DCMAuth.micromaxinfo.com:8080/api/LED/TrackJobSheet_APIWhatsapp',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {

            let result = response.data.responseBody.text;
            if (response.data.code != '200') {
                res.status(200).json({ 'code': 100, 'status': 'Failed', data: result });
            } else {


                res.status(200).json({ 'code': 200, 'status': 'success', 'type': 'text', data: result });
            }
        })
        .catch(function (error) {
            res.status(200).json({ 'code': 100, 'status': 'Failed' });
        });


})



router.post('/feedback/:feedval/:wanumber', (req, res) => {
    let FeedVal = req.params.feedval;
    let Wanumber = req.params.wanumber;
    var data = JSON.stringify({
        "Feedback": FeedVal,
        "Flag": "3",
        "PhoneNumber": Wanumber
    });

    var config = {
        method: 'post',
        url: 'https://aapi.micromaxinfo.com/api/Apk/GetInsertProductInfo',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            let result = response.data.responseBody.text;
            if (response.data.code != '200') {
                res.status(200).json({ 'code': 100, 'status': 'Failed', data: result });
            } else {


                res.status(200).json({ 'code': 200, 'status': 'success', 'type': 'text', data: result });
            }
        })
        .catch(function (error) {
            res.status(200).json({ 'code': 100, 'status': 'Failed' });
        });
})



router.post('/Led/GetArea/:spin', (req, res) => {
    let Spin = req.params.spin;
    var data = JSON.stringify({
        "sPin": Spin
    });

    var config = {
        method: 'post',
        url: 'https://DCMAuth.micromaxinfo.com:8080/api/LED/GetArea_APIWhatsAPP',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            let result = response.data.responseBody.text;
            if (response.data.code != '200') {
                res.status(200).json({ 'code': 100, 'status': 'Failed', data: result });
            } else {


                res.status(200).json({ 'code': 200, 'status': 'success', 'type': 'text', data: result });
            }
        })
        .catch(function (error) {
            // console.log(error);
            res.status(200).json({ 'code': 100, 'status': 'Failed' });
        });

})


router.post('/SearchServiceCenter/:pincode', (req, res) => {
    let Pincode = req.params.pincode;
    var data = JSON.stringify({
        "sPincode": Pincode,
        "sServicetype": "CE"
    });

    var config = {
        method: 'post',
        url: 'https://DCMAuth.micromaxinfo.com:8080/api/Led/SearchServiceCenter_APIWhatsApp',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            let result = response.data.responseBody.text;
            if (response.data.code != '200') {
                res.status(200).json({ 'code': 100, 'status': 'Failed', data: result });
            } else {
                res.status(200).json({ 'code': 200, 'status': 'success', 'type': 'text', data: result });
            }
        })
        .catch(function (error) {
            // console.log(error);
            res.status(200).json({ 'code': 100, 'status': 'Failed' });
        });

})


router.post('/getproductdetails/:parentid/:productid', (req, res) => {
    let ProductId = req.params.productid;
    let ParentId = req.params.parentid;
    var data = JSON.stringify({
        "Flag": "2",
        "ParentID": ParentId,
        "ProductID": ProductId
    });

    var config = {
        method: 'post',
        url: 'https://aapi.micromaxinfo.com/api/Apk/GetInsertProductInfo',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            let result = response.data.responseBody.text;
            if (response.data.code != '200') {
                res.status(200).json({ 'code': 100, 'status': 'Failed', data: result });
            } else {
                res.status(200).json({ 'code': 200, 'status': 'success', 'type': 'text', data: result });
            }
        })
        .catch(function (error) {
            // console.log(error);
            res.status(200).json({ 'code': 100, 'status': 'Failed' });
        });
})



router.post('/getproductlist/:flag/:parentid', (req, res) => {
    let Flag = req.params.flag;
    // let Limit = req.params.limit;
    // let Page = req.params.page;
    let ParentID = req.params.parentid;

    var data = {
        "Flag": Flag,
        "ParentID": ParentID

    };

    var config = {
        method: 'post',
        url: 'https://aapi.micromaxinfo.com/api/Apk/GetInsertProductInfo',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            // console.log(response.data);
            let result = response.data.responseBody.text;
            let attributes = response.data.attributes;
            for (i = 0; i < attributes.length; i++) {
                let Page = attributes[0].attrvalue;
                let Limit = attributes[1].attrvalue;
                data.Page = Page;
                data.Limit = Limit;

            }

            if (response.data.code != '200') {
                res.status(200).json({ 'code': 100, 'status': 'Failed', data: result });
            } else {
                res.status(200).json({ 'code': 200, 'status': 'success', 'type': 'text', data: result });
            }
        })
        .catch(function (error) {
            // console.log(error);
            res.status(200).json({ 'code': 100, 'status': 'Failed' });
        });


})



router.post('/Led/TrackJobSheetCE/:sheetno', (req, res) => {
    let SheetNo = req.params.sheetno;
    var data = JSON.stringify({
        "sJobSheetNumber": SheetNo,
        "sJobSheetType": "CE"
    });

    var config = {
        method: 'post',
        url: 'https://DCMAuth.micromaxinfo.com:8080/api/LED/TrackJobSheet_APIWhatsapp',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            let result = response.data.responseBody.text;
            if (response.data.code != '200') {
                res.status(200).json({ 'code': 100, 'status': 'Failed', data: result });
            } else {
                res.status(200).json({ 'code': 200, 'status': 'success', 'type': 'text', data: result });
            }
        })
        .catch(function (error) {
            // console.log(error);
            res.status(200).json({ 'code': 100, 'status': 'Failed' });
        });

})



router.post('/Led/SearchServiceCenter/:sPincode', (req, res) => {

    let sPincode = (typeof req.params.sPincode != 'undefined') ? req.params.sPincode + '' : '';

    var data = JSON.stringify({
        "sPincode": sPincode,
        "sServicetype": "CE"
    });

    var config = {
        method: 'post',
        url: 'https://DCMAuth.micromaxinfo.com:8080/api/Led/SearchServiceCenter_APIWhatsApp',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            let result = response.data.responseBody.text;
            if (response.data.code != '200') {
                res.status(200).json({ 'code': 100, 'status': 'Failed', data: result });
            } else {
                res.status(200).json({ 'code': 200, 'status': 'success', 'type': 'text', data: result });
            }
        })
        .catch(function (error) {
            // console.log(error);
            res.status(200).json({ 'code': 100, 'status': 'Failed' });
        });
})

module.exports = router;