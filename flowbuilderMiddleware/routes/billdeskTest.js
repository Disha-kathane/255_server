let express = require('express');
let router = express.Router();
let axios = require('axios');
const jws = require('jws');

// let privateKey = 'L3W0iVfLfTLeht3iZuDQHTHDevepyS56';
// let clientid = 'pmcuat';
// let mercid = "PMCUAT";

const generateUniqueId = require('generate-unique-id');

// create transaction
router.post('/create', async (req, res) => {
    let privateKey = req.body.privateKey;
    let clientid = req.body.clientid;
    let mercid = req.body.mercid;
    let orderid = req.body.orderid;
    let amount = req.body.amount;
    console.log({ orderid, amount });
    let payload = {
        "mercid": mercid,
        "orderid": orderid,
        "amount": amount,
        "currency": "356",
        "bankid": "ICW",
        "txn_process_type": "intent",
        "itemcode": "DIRECT",
        "payment_method_type": "upi",
        "additional_info": {
            "additional_info1": "Details1",
            "additional_info2": "Details2",
            "additional_info3": "Details3",
            "additional_info4": "Details4",
            "additional_info5": "Details5",
            "additional_info6": "Details6",
            "additional_info7": "Details7",
            "additional_info8": "Details8",
            "additional_info9": "Details9",
            "additional_info10": "Details10"
        },
        "device": {
            "init_channel": "internet",
            "ip": "124.124.1.1",
            "user_agent": "Mozilla/5.0(Windows NT10.0; WOW64; rv: 51.0)"
        }
    };

    const signature = jws.sign({
        header: { alg: 'HS256', clientid: clientid },
        payload: payload,
        secret: privateKey,
    });

    // console.log({ signature });


    let bdTraceId = generateUniqueId({
        length: 8,
        useLetters: true,
        excludeSymbols: ['@', '#', '|']
    });



    Date.prototype.toUnixTime = function () { return this.getTime() / 1000 | 0; };
    Date.time = function () { return new Date().toUnixTime(); };

    let timestamp = Date.time();
    // console.log(timestamp);

    var config = {
        method: 'post',
        url: 'https://pguat.billdesk.io/payments/ve1_2/transactions/create',
        headers: {
            'Accept': 'application/jose',
            'BD-Traceid': bdTraceId,
            'BD-Timestamp': timestamp,
            'Content-Type': 'application/jose'
        },
        data: signature
    };


    try {
        const response = await axios(config);
        // console.log(JSON.stringify(response.data));
        let decodedString = jws.decode(response.data);
        // console.log(JSON.parse(decodedString.payload));
        let decodedData = JSON.parse(decodedString.payload);
        let transactionId = decodedData.wa_txnid;
        res.send({
            code: 200,
            status: "success",
            data: {
                "transactionId": transactionId
            }
        });
    }
    catch (err) {
        console.log(err);
        console.log('Billdesk create order ==================> ' + err);
        res.send({
            code: 100,
            status: "failed",
            data: err.message
        });
    }

});


// get transaction
router.post('/get', async (req, res) => {
    let privateKey = req.body.privateKey;
    let clientid = req.body.clientid;
    let mercid = req.body.mercid;
    let orderid = req.body.orderid;

    let payload = {
        "mercid": mercid,
        "orderid": orderid
    };

    const signature = jws.sign({
        header: { alg: 'HS256', clientid: clientid },
        payload: payload,
        secret: privateKey,
    });

    // console.log({ signature });

    let bdTraceId = generateUniqueId({
        length: 8,
        useLetters: true,
        excludeSymbols: ['@', '#', '|']
    });


    Date.prototype.toUnixTime = function () { return this.getTime() / 1000 | 0; };
    Date.time = function () { return new Date().toUnixTime(); };

    let timestamp = Date.time();
    console.log(timestamp);


    var config = {
        method: 'post',
        url: 'https://pguat.billdesk.io/payments/ve1_2/transactions/get',
        headers: {
            'Accept': 'application/jose',
            'BD-Traceid': bdTraceId,
            'BD-Timestamp': timestamp,
            'Content-Type': 'application/jose'
        },
        data: signature
    };


    try {
        const response = await axios(config);
        console.log(JSON.stringify(response.data));
        let decodedString = jws.decode(response.data);
        console.log({ decodedString });
        let decodedData = JSON.parse(decodedString.payload);
        res.send({
            code: 200,
            status: "success",
            data: decodedData
        });
    }
    catch (err) {
        console.log('Billdesk get order ==================> ' + err);
        res.send({
            code: 100,
            status: "failed",
            data: err.message
        });
    }

});


router.post('/testbilldesk/:orderid/:amount', async (req, res) => {

    let orderid = req.params.orderid;
    let amount = req.params.amount;
    let privateKey = "L3W0iVfLfTLeht3iZuDQHTHDevepyS56";
    let clientid = "pmcuat";
    let mercid = "PMCUAT";
    console.log({ orderid, amount });
    var data = JSON.stringify({
        "privateKey": privateKey,
        "clientid": clientid,
        "mercid": mercid,
        "orderid": orderid,
        "amount": amount
    });

    var config = {
        method: 'post',
        url: 'http://68.183.90.255:5000/billdesk/create',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        const response = await axios(config);
        console.log(JSON.stringify(response.data));
        let retailerId = generateUniqueId({
            length: 8,
            useLetters: true,
            excludeSymbols: ['@', '#', '|']
        });
        let response1 = {
            code: '200',
            status: 'success',
            type: 'non-catalog',
            data: {
                "productretailerid": retailerId,
                "productname": "BILLDESK_TEST",
                "productamount": amount,
                "productquantity": 1,
                "productorderid": response.data.data.transactionId,
                "productimageurl": "https://www.learningcontainer.com/wp-content/uploads/2020/07/Sample-PNG-File-for-Testing.png"
            }
        };
        return res.json(response1);
    }
    catch (err) {
        console.log(err);
        return res.send({
            code: 100,
            status: 'FAILED',
            data: err.message
        });
    }

});

module.exports = router;