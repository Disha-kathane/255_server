var express = require('express');
var router = express.Router();
var axios = require('axios');
var FormData = require('form-data');
const async = require('async');
const { doesNotMatch } = require('assert');
var data = new FormData();
let moveinmessage = ''
let IsValidMessage = ''
let IsValid = ''
router.post('/check_torrent', function (req, res, next) {
    var serviceNo = req.query.ServiceNo
    console.log("hello");
    console.log(serviceNo);
    let fun1 = async (moveinmessage, IsValidMessage, IsValid) => {
        var config = {
            method: 'post',
            url: 'https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/validateServiceNo?ServiceNo=' + serviceNo,
            headers: {
                'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                'Cookie': 'saplb_*=(J2EE207654120)207654151',
                ...data.getHeaders()
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data.moveInMessage));
                moveinmessage = response.data.moveInMessage;
                console.log('moveinmessage', moveinmessage);
                IsValidMessage = response.data.isValidMessage;
                console.log('IsValidMessage', IsValidMessage);

                IsValid = response.data.isValid
                console.log("is valid", IsValid);
                // if (IsValid == 'Y') {
                //     console.log("entered in isvalid");
                //     let response = {
                //         "code": 200,
                //         "status": "success",
                //         "type": "text",
                //         "data": moveinmessage
                //     };
                //     res.status(200).json(response);
                // } else if (IsValid == 'N') {
                //     console.log("entered in else");
                //     res.send({
                //         code: 100,
                //         status: 'No Record Found',
                //         data: IsValidMessage

                //     });

                // } else {
                //     console.log("this is an empty part");
                // }
                return moveinmessage, IsValidMessage, IsValid

            })
            .catch(function (error) {
                console.log(error);

            });
    }
    let main = async (moveinmessage, IsValidMessage, IsValid) => {
        let fun1_response = await fun1(moveinmessage, IsValidMessage, IsValid)
        console.log("this is main function", fun1_response);
    }
    main()
});

module.exports = router;