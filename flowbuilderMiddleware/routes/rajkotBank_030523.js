let express = require('express');
let axios = require('axios');
let router = express.Router();
const fs = require('fs');
const Path = require('path');


let mobileNumber = null;
let otp = null;
let accountNumber = null;
let pin = null;
let confirmpin = null;
let fileName = null;
let instrumentNumber = null;

let customerNumber = null;
let stmtDuration = null;

let url = null;
let result = null;
let response1 = null;


// Verify Mobile Number --- 1
router.post('/verifymobilenumber/:mobile', (req, res) => {

    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });

    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }

    url = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/VerifyMobileNumber?Mobile=' + mobileNumber;

    var config = {
        method: 'get',
        url: url,
        headers: {}
    };


    axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            if (response.data.code == "0") {
                result = response.data.status;
                if (result === "Mobile Number is Not Registered")
                    return res.send({
                        code: 100,
                        status: 'FAILED',
                        data: result
                    });
                else if (result === "Mobile Number Is Verified") {
                    return res.send({
                        code: 300,
                        status: 'FAILED',
                        data: result
                    });
                }
            } else {
                result = response.data.responseBody.text;
                response1 = {
                    code: 200,
                    status: "success",
                    type: "text",
                    data: result
                };
                return res.json(response1);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
});

// Verify OTP --- 2
router.post('/verifyotp/:mobile/:otp', (req, res) => {
    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });
    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }

    otp = req.params.otp;
    // console.log({ otp });
    url = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/VerifyOTP?mobile=' + mobileNumber + '&otp=' + otp;
    var config = {
        method: 'get',
        url: url,
        headers: {}
    };

    axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            if (response.data.code == "0") {
                result = response.data.status;
                return res.send({
                    code: 100,
                    status: 'FAILED',
                    data: result
                });
            } else {
                result = response.data.responseBody.text;
                response1 = {
                    code: 200,
                    status: "success",
                    type: "text",
                    data: 'OTP Verified'
                };
                return res.json(response1);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
});

// Set PIN --- 3
router.post('/setpin/:mobile/:pin/:confirmpin', (req, res) => {
    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });

    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }


    pin = req.params.pin;
    // console.log({ pin });


    confirmpin = req.params.confirmpin;
    // console.log({ confirmpin });



    url = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/PinSet?mobile=' + mobileNumber + '&pin=' + pin + '&confirmpin=' + confirmpin + '\n';
    var config = {
        method: 'get',
        url: url,
        headers: {}
    };

    axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            if (response.data.code == "0" || pin !== confirmpin) {
                result = response.data.status;
                return res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Error"
                });
            } else {
                if (pin === confirmpin && pin.length == 4 && confirmpin.length == 4) {
                    result = response.data.responseBody.text;
                    response1 = {
                        code: 200,
                        status: "success",
                        type: "text",
                        data: result
                    };
                    return res.json(response1);
                } else {
                    return res.send({
                        code: 100,
                        status: 'FAILED',
                        data: "Error"
                    });
                }

            }
        })
        .catch(function (error) {
            console.log(error);
        });



});

// Verify PIN --- 4
router.post('/verifypin/:mobile/:pin', (req, res) => {
    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });

    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }


    pin = req.params.pin;
    // console.log({ pin });

    url = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/VerifyPin?mobile=' + mobileNumber + '&pin=' + pin;
    var config = {
        method: 'get',
        url: url,
        headers: {}
    };

    axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            if (response.data.code == "0") {
                result = response.data.status;
                return res.send({
                    code: 100,
                    status: 'FAILED',
                    data: result
                });
            } else {
                if (pin.length === 4) {
                    result = response.data.responseBody.text;
                    response1 = {
                        code: 200,
                        status: "success",
                        type: "text",
                        data: "User validated"
                    };
                    return res.json(response1);
                }
                else {
                    return res.send({
                        code: 100,
                        status: 'FAILED',
                        data: result
                    });
                }

            }
        })
        .catch(function (error) {
            console.log(error);
        });
});

// AccountBalance --- 5
router.post('/accountbalance/:mobile', (req, res) => {
    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });

    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }

    url = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/AccountBalnce?mobile=' + mobileNumber;
    var config = {
        method: 'get',
        url: url,
        headers: {}
    };

    axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            if (response.data.code == "0") {
                result = response.data.status;

                return res.send({
                    code: 100,
                    status: 'FAILED',
                    data: result
                });
            } else {
                result = response.data.attributes;
                result1 = response.data.responseBody.text.split('A/c');
                // console.log({ result });
                // console.log({ result1 });

                temp = result1[0] + ' A/c ' + '\n';
                if (result != undefined) {
                    for (let i = 0; i < result.length; i++) {
                        temp += result[i].attrname + ') ' + result[i].attrvalue + ' is Rs. ' + result[i].attrBalance + ',';
                        temp += '\n';
                    }
                    temp += '\n';
                    temp += 'Type *#* to go back to the *Main Menu*.';
                }
                let response1 = {
                    code: '200',
                    status: "Success",
                    type: 'text',
                    data: temp
                };
                return res.json(response1);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
});

// Select Account --- 6
router.post('/selectaccount/:mobile', (req, res) => {
    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });

    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }

    url = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/SelectAccount?mobile=' + mobileNumber;
    var config = {
        method: 'get',
        url: url,
        headers: {}
    };

    axios(config)
        .then(function (response) {
            if (response.data.code == "0") {
                result = response.data.status;
                return res.send({
                    code: 100,
                    status: 'FAILED',
                    data: result
                });
            }
            else {
                result = response.data.attributes;
                result1 = response.data.responseBody.split(',');

                // console.log({ result });
                // console.log({ result1 });
                // temp = 'Account Details : ' + '\n\n';
                temp = "Please select your Account Number" + '\n\n';
                if (result != undefined) {
                    for (let i = 0; i < result.length; i++) {
                        result2 = result1[i].split('.');
                        // console.log({ result2 });
                        temp += 'Type *' + result[i].attrname + '* : ' + result2[1] + '\n';

                        temp += '\n';


                    }
                    temp += 'Type *#* to go back to the *Main Menu*.';
                } else {
                    temp = "No Account Details Found";
                }

                let response1 = {
                    code: '200',
                    status: "Success",
                    type: 'text',
                    data: temp
                };
                return res.json(response1);
            }
        })
        .catch(function (error) {
            console.log(error);
        });

});

// Select Customer Number --- 7
router.post('/selectcustomernumber/:mobile', (req, res) => {
    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });

    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }

    url = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/SelectCustomerNumber?mobile=' + mobileNumber;
    var config = {
        method: 'get',
        url: url,
        headers: {}
    };

    axios(config)
        .then(function (response) {
            if (response.data.code == "0") {
                result = response.data.status;
                return res.send({
                    code: 100,
                    status: 'FAILED',
                    data: result
                });
            }
            else {
                result = response.data.attributes;
                result1 = response.data.responseBody;
                // console.log({ result });
                if (result != undefined) {
                    // temp = 'Customer Number Details :' + '\n\n';
                    temp = "Please select your Customer Number" + '\n\n';
                    for (let i = 0; i < result.length; i++) {
                        temp += 'Type *' + result[i].attrname + '* : ' + result[i].attrvalue + '\n';

                        temp += '\n';

                    }
                    temp += 'Type *#* to go back to the *Main Menu*.';
                } else {
                    temp = "No Consumer Number Details Found";
                }

                let response1 = {
                    code: '200',
                    status: "Success",
                    type: 'text',
                    data: temp
                };
                return res.json(response1);
            }
        })
        .catch(function (error) {
            let err = {
                code: '100',
                status: 'failed',
                data: 'something went wrong'
            };
            console.log(error);
        });
});

// TAN Certificate --- 8 & Download TAN Certificate --- 9
router.post('/tancertificate/:mobile/:customernumber', async (req, res) => {
    customerNumber = req.params.customernumber;
    // console.log({ customerNumber });

    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });

    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }

    // Select Customer Number

    url3 = `http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/SelectCustomerNumber?mobile=${mobileNumber}`;
    var config3 = {
        method: 'get',
        url: url3,
        headers: {}
    };

    axios(config3)
        .then(async function (response3) {
            if (response3.data.code == 0) {
                // console.log('Something went wrong');
                result = response.data.status;
                return res.send({
                    code: 100,
                    status: 'FAILED',
                    data: result
                });
            }
            else {
                result3 = response3.data.attributes;
                result4 = response3.data.responseBody;
                // console.log({ result3 });
                // console.log({ result4 });
                if (result3 != undefined) {
                    if (result3.length < customerNumber) {
                        // console.log(result3.length);
                        return res.send({
                            code: 100,
                            status: 'FAILED',
                            data: "Something went wrong"
                        });
                    }
                    else {
                        // temp = 'Customer Number Details :' + '\n\n';
                        for (let i = 0; i < result3.length; i++) {
                            //  temp += result3[i].attrname + ':' + result3[i].attrvalue + '\n';

                            //  temp += '\n';

                            if (result3[i].attrname === customerNumber) {
                                // console.log(result3[i].attrvalue);
                                url = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/TanCertificate?customerNo=' + result3[i].attrvalue;
                                var config = {
                                    method: 'get',
                                    url: url,
                                    headers: {}
                                };

                                try {
                                    const response = await axios(config);
                                    // console.log(JSON.stringify(response.data));
                                    if (response.data.code == "200") {
                                        result = response.data.responseBody.text !== null ? response.data.responseBody.text : response.data.responseBody.status;

                                        // Download TAN Certificate --- 9
                                        let fileName = result.split('?fileName=');
                                        // console.log(fileName[1]);
                                        let url1 = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/DownloadTanCertificate?fileName=' + fileName[1];

                                        try {
                                            const path = Path.resolve(__dirname, './public/pdf-files/', fileName[1]);

                                            // axios image download with response type "stream"
                                            const response1 = await axios({
                                                method: 'GET',
                                                url: url1,
                                                responseType: 'stream'
                                            });

                                            // pipe the result stream into a file on disc
                                            response1.data.pipe(fs.createWriteStream('./public/pdf-files/' + fileName[1]));
                                            temp1 = 'Type *#* to go back to the *Main Menu*.';
                                            // return a promise and resolve when download finishes
                                            response1.data.on('end', () => {
                                                let response2 = {
                                                    code: 200,
                                                    status: "success",
                                                    type: "document",
                                                    url: "http://68.183.90.255:5000/pdf-files/" + fileName[1],
                                                    data: temp1

                                                };
                                                return res.json(response2);
                                            });

                                            // response1.data.on('error', () => {

                                            // });

                                        } catch (err) {
                                            console.log(err);
                                        }
                                    }
                                    else {
                                        console.log('error');
                                        result = response.data.status;
                                        return res.send({
                                            code: 100,
                                            status: 'FAILED',
                                            data: result
                                        });
                                    }
                                } catch (err) {
                                    console.log(err);
                                }
                            }

                        }
                    }

                } else {
                    temp = "No Consumer Number Details Found";
                }

                // console.log(temp);

            }
        })
        .catch(function (error) {
            let err = {
                code: '100',
                status: 'failed',
                data: 'something went wrong'
            };
            console.log(error);
        });




});


// Check PIN Generated --- 10
router.post('/checkpingenerated/:mobile', (req, res) => {
    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });

    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }

    url = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/CheckPinGenerated?mobile=' + mobileNumber;
    var config = {
        method: 'get',
        url: url,
        headers: {}
    };

    axios(config)
        .then(function (response) {
            // console.log(JSON.stringify(response.data));
            if (response.data.code == "0") {
                result = response.data.status;
                return res.send({
                    code: 100,
                    status: 'FAILED',
                    data: result
                });
            } else {
                result = response.data.responseBody.text;
                if (response.data.responseBody.text === "Pin already Generated.") {
                    response1 = {
                        code: 200,
                        status: "success",
                        type: "text",
                        data: result
                    };
                    return res.json(response1);
                }
                else {
                    return res.send({
                        code: 300,
                        status: 'success',
                        data: result
                    });
                }

            }
        })
        .catch(function (error) {
            console.log(error);
        });
});


// Check Status --- 11 & Download PDF check status --- 12
router.post('/checkstatus/:mobile/:accountNumber/:instrumentNumber', async (req, res) => {
    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });

    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }

    accountNumber = req.params.accountNumber;
    // console.log({ accountNumber });

    instrumentNumber = req.params.instrumentNumber;

    if (instrumentNumber.length == 6) {
        instrumentNumber = req.params.instrumentNumber;
        // console.log({ instrumentNumber });
    }

    // Select Account Number
    url3 = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/SelectAccount?mobile=' + mobileNumber;
    var config3 = {
        method: 'get',
        url: url3,
        headers: {}
    };

    axios(config3)
        .then(async function (response) {
            if (response.data.code == "0") {
                // console.log('Something went wrong');
                return res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });
            }
            else {
                result3 = response.data.attributes;
                result4 = response.data.responseBody.split(',');

                // console.log({ result3 });
                // console.log({ result4 });
                // temp = 'Account Details : ' + '\n\n';
                if (result3 != undefined) {
                    // if (instrumentNumber.length !== 6) {
                    //     res.send({
                    //         code: 100,
                    //         status: 'FAILED',
                    //         data: "Please enter valid input"
                    //     });
                    // }

                    if (result3.length < accountNumber || instrumentNumber.length !== 6) {
                        // console.log(result3.length);
                        return res.send({
                            code: 100,
                            status: 'FAILED',
                            data: "Something went wrong"
                        });
                    }
                    else {
                        for (let i = 0; i < result3.length; i++) {
                            result5 = result4[i].split('.');
                            // console.log({ result5 });
                            // temp += result3[i].attrname + ' : ' + result3[i].attrvalue + '\n' + ' : ' + result5[1] + '\n';

                            // temp += '\n';

                            if (result3[i].attrname === accountNumber && instrumentNumber.length === 6) {
                                // console.log(result5[1]);
                                url = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/Checkstatus?mobile=' + mobileNumber + '&accountNumber=' + result5[1] + '&instrumentNumber=' + instrumentNumber;
                                var config = {
                                    method: 'get',
                                    url: url,
                                    headers: {}
                                };

                                try {
                                    const response = await axios(config);
                                    // console.log(JSON.stringify(response.data));
                                    if (response.data.code == "0") {
                                        result = response.data.status;
                                        return res.send({
                                            code: 100,
                                            status: 'FAILED',
                                            data: result
                                        });
                                    } else {
                                        result = response.data.responseBody.text !== null ? response.data.responseBody.text : response.data.responseBody.status;

                                        // Download PDF check status --- 12
                                        let fileName = result.split('?fileName=');
                                        // console.log(fileName[1]);
                                        let url1 = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/DownloadPDFCheckStatus?fileName=' + fileName[1];

                                        try {
                                            const path = Path.resolve(__dirname, './public/pdf-files/', fileName[1]);

                                            // axios image download with response type "stream"
                                            const response1 = await axios({
                                                method: 'GET',
                                                url: url1,
                                                responseType: 'stream'
                                            });

                                            // pipe the result stream into a file on disc
                                            response1.data.pipe(fs.createWriteStream('./public/pdf-files/' + fileName[1]));
                                            temp1 = 'Type *#* to go back to the *Main Menu*.';
                                            // return a promise and resolve when download finishes
                                            response1.data.on('end', () => {
                                                let response2 = {
                                                    code: 200,
                                                    status: "success",
                                                    type: "document",
                                                    url: "http://68.183.90.255:5000/pdf-files/" + fileName[1],
                                                    data: temp1

                                                };
                                                return res.json(response2);
                                            });

                                            // response1.data.on('error', () => {

                                            // });

                                        } catch (err) {
                                            console.log(err);
                                        }
                                    }
                                } catch (err) {
                                    console.log(err);
                                }
                            }
                        }
                    }




                } else {
                    temp = "No Account Details Found";
                }


            }
        })
        .catch(function (error) {
            console.log(error);
        });

});


// Get Account Statement Taxation --- 13 & Download PDF Account Statement --- 14
router.post('/getaccountstatementtxn/:mobile/:accountnumber', async (req, res) => {
    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });

    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }

    accountNumber = req.params.accountnumber;
    // console.log({ accountNumber });

    // Select Account Number
    url3 = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/SelectAccount?mobile=' + mobileNumber;
    var config3 = {
        method: 'get',
        url: url3,
        headers: {}
    };

    axios(config3)
        .then(async function (response) {
            if (response.data.code == "0") {
                // console.log('Something went wrong');
                return res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });
            }
            else {
                result3 = response.data.attributes;
                result4 = response.data.responseBody.split(',');

                // console.log({ result3 });
                // console.log({ result4 });
                // temp = 'Account Details : ' + '\n\n';
                if (result3 != undefined) {

                    if (result3.length < accountNumber) {
                        // console.log(result3.length);
                        return res.send({
                            code: 100,
                            status: 'FAILED',
                            data: "Something went wrong"
                        });
                    }
                    else {
                        for (let i = 0; i < result3.length; i++) {
                            result5 = result4[i].split('.');
                            // console.log({ result5 });
                            // temp += result3[i].attrname + ' : ' + result3[i].attrvalue + '\n' + ' : ' + result5[1] + '\n';

                            // temp += '\n';

                            if (result3[i].attrname === accountNumber) {
                                // console.log(result5[1]);
                                url = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/GetAccountStatementTxn?mobile=' + mobileNumber + '&accountNumber=' + result5[1];

                                var config = {
                                    method: 'get',
                                    url: url,
                                    headers: {}
                                };


                                try {
                                    const response = await axios(config);
                                    // console.log(JSON.stringify(response.data));
                                    if (response.data.code == "0") {
                                        result = response.data.status;
                                        return res.send({
                                            code: 100,
                                            status: 'FAILED',
                                            data: result
                                        });
                                    } else {
                                        result = response.data.responseBody.text !== null ? response.data.responseBody.text : response.data.responseBody.status;

                                        // Download PDF Account Statement --- 14
                                        let fileName = result.split('?fileName=');
                                        // console.log(fileName[1]);
                                        let url1 = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/DownloadPDFAccountStmt?fileName=' + fileName[1];

                                        try {
                                            const path = Path.resolve(__dirname, './public/pdf-files/', fileName[1]);

                                            // axios image download with response type "stream"
                                            const response1 = await axios({
                                                method: 'GET',
                                                url: url1,
                                                responseType: 'stream'
                                            });

                                            // pipe the result stream into a file on disc
                                            response1.data.pipe(fs.createWriteStream('./public/pdf-files/' + fileName[1]));
                                            temp1 = 'Type *#* to go back to the *Main Menu*.';
                                            // return a promise and resolve when download finishes
                                            response1.data.on('end', () => {
                                                let response2 = {
                                                    code: 200,
                                                    status: "success",
                                                    type: "document",
                                                    url: "http://68.183.90.255:5000/pdf-files/" + fileName[1],
                                                    data: temp1

                                                };
                                                return res.json(response2);
                                            });

                                            // response1.data.on('error', () => {

                                            // });

                                        } catch (err) {
                                            console.log(err);
                                        }

                                    }
                                } catch (err) {
                                    console.log(err);
                                }
                            }
                        }
                    }


                } else {
                    temp = "No Account Details Found";
                }


            }
        })
        .catch(function (error) {
            console.log(error);
        });


});



// Get Account Statement --- 15 &  Download PDF Account Statement --- 16
router.post('/getaccountstatement/:mobile/:accountnumber/:stmtduration', async (req, res) => {
    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });

    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }


    accountNumber = req.params.accountnumber;
    // console.log({ accountNumber });
    stmtDuration = req.params.stmtduration;
    // console.log({ stmtDuration });


    if (stmtDuration.toLowerCase() === 'prv') {
        stmtDuration = 24;
        // console.log({ stmtDuration });
    }

    // Select Account Number
    url3 = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/SelectAccount?mobile=' + mobileNumber;
    var config3 = {
        method: 'get',
        url: url3,
        headers: {}
    };

    axios(config3)
        .then(async function (response) {
            if (response.data.code == "0") {
                // console.log('Something went wrong');
                return res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });
            }
            else {
                result3 = response.data.attributes;
                result4 = response.data.responseBody.split(',');

                // console.log({ result3 });
                // console.log({ result4 });
                // temp = 'Account Details : ' + '\n\n';
                if (result3 != undefined) {

                    if (result3.length < accountNumber) {
                        // console.log(result3.length);
                        return res.send({
                            code: 100,
                            status: 'FAILED',
                            data: "Something went wrong"
                        });
                    }
                    else {
                        for (let i = 0; i < result3.length; i++) {
                            result5 = result4[i].split('.');
                            // console.log({ result5 });
                            // temp += result3[i].attrname + ' : ' + result3[i].attrvalue + '\n' + ' : ' + result5[1] + '\n';

                            // temp += '\n';

                            if (result3[i].attrname === accountNumber) {
                                // console.log(result5[1]);
                                let url = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/GetAccountStatement?mobile=' + mobileNumber + '&accountNumber=' + result5[1] + '&stmtDuration=' + stmtDuration;

                                var config = {
                                    method: 'get',
                                    url: url,
                                    headers: {}
                                };

                                try {
                                    const response = await axios(config);
                                    // console.log(JSON.stringify(response.data));
                                    if (response.data.code == "0") {
                                        result = response.data.status;
                                        return res.send({
                                            code: 100,
                                            status: 'FAILED',
                                            data: result
                                        });
                                    } else {
                                        result = response.data.responseBody.text !== null ? response.data.responseBody.text : response.data.responseBody.status;

                                        // Download PDF Account Statement --- 16
                                        let fileName = result.split('?fileName=');
                                        // console.log(fileName[1]);
                                        let url1 = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/DownloadPDFAccountStmt?fileName=' + fileName[1];

                                        try {
                                            const path = Path.resolve(__dirname, './public/pdf-files/', fileName[1]);

                                            // axios image download with response type "stream"
                                            const response1 = await axios({
                                                method: 'GET',
                                                url: url1,
                                                responseType: 'stream'
                                            });

                                            // pipe the result stream into a file on disc
                                            response1.data.pipe(fs.createWriteStream('./public/pdf-files/' + fileName[1]));
                                            temp1 = 'Type *#* to go back to the *Main Menu*.';
                                            // return a promise and resolve when download finishes
                                            response1.data.on('end', () => {
                                                let response2 = {
                                                    code: 200,
                                                    status: "success",
                                                    type: "document",
                                                    url: "http://68.183.90.255:5000/pdf-files/" + fileName[1],
                                                    data: temp1

                                                };
                                                return res.json(response2);
                                            });

                                            // response1.data.on('error', () => {

                                            // });

                                        } catch (err) {
                                            console.log(err);
                                        }
                                    }
                                } catch (err) {
                                    console.log(err);
                                }
                            }
                        }
                    }


                } else {
                    temp = "No Account Details Found";
                }


            }
        })
        .catch(function (error) {
            console.log(error);
        });

});


// Interest Certificate --- 17 & Download Interest Certificate --- 18
router.post('/interestcertificate/:mobile/:accountnumber', async (req, res) => {
    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });

    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }

    accountNumber = req.params.accountnumber;
    // console.log({ accountNumber });


    // Select Account Number
    url3 = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/SelectAccount?mobile=' + mobileNumber;
    var config3 = {
        method: 'get',
        url: url3,
        headers: {}
    };

    axios(config3)
        .then(async function (response) {
            if (response.data.code == "0") {
                // console.log('Something went wrong');
                return res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });
            }
            else {
                result3 = response.data.attributes;
                result4 = response.data.responseBody.split(',');

                // console.log({ result3 });
                // console.log({ result4 });
                // temp = 'Account Details : ' + '\n\n';
                if (result3 != undefined) {

                    if (result3.length < accountNumber) {
                        // console.log(result3.length);
                        return res.send({
                            code: 100,
                            status: 'FAILED',
                            data: "Something went wrong"
                        });
                    }
                    else {
                        for (let i = 0; i < result3.length; i++) {
                            result5 = result4[i].split('.');
                            // console.log({ result5 });
                            // temp += result3[i].attrname + ' : ' + result3[i].attrvalue + '\n' + ' : ' + result5[1] + '\n';

                            // temp += '\n';

                            if (result3[i].attrname === accountNumber) {
                                // console.log(result5[1]);
                                url = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/InterestCertificate?mobile=' + mobileNumber + '&accountNumber=' + result5[1];


                                var config = {
                                    method: 'get',
                                    url: url,
                                    headers: {}
                                };

                                try {
                                    const response = await axios(config);
                                    // console.log(JSON.stringify(response.data));
                                    if (response.data.code == "200") {
                                        result = response.data.responseBody.text !== null ? response.data.responseBody.text : response.data.responseBody.status;

                                        // Download Interest Certificate --- 18
                                        let fileName = result.split('?fileName=');
                                        // console.log(fileName[1]);
                                        let url1 = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/DownloadInterestCertificate?fileName=' + fileName[1];

                                        try {
                                            const path = Path.resolve(__dirname, './public/pdf-files/', fileName[1]);

                                            // axios image download with response type "stream"
                                            const response1 = await axios({
                                                method: 'GET',
                                                url: url1,
                                                responseType: 'stream'
                                            });

                                            // pipe the result stream into a file on disc
                                            response1.data.pipe(fs.createWriteStream('./public/pdf-files/' + fileName[1]));
                                            temp1 = 'Type *#* to go back to the *Main Menu*.';
                                            // return a promise and resolve when download finishes
                                            response1.data.on('end', () => {
                                                let response2 = {
                                                    code: 200,
                                                    status: "success",
                                                    type: "document",
                                                    url: "http://68.183.90.255:5000/pdf-files/" + fileName[1],
                                                    data: temp1

                                                };
                                                // console.log({ response2 });
                                                return res.json(response2);
                                            });

                                            // response1.data.on('error', () => {

                                            // });

                                        } catch (err) {
                                            console.log(err);
                                        }
                                    }
                                    else {
                                        console.log('error');
                                        result = response.data.status;
                                        return res.send({
                                            code: 100,
                                            status: 'FAILED',
                                            data: result
                                        });
                                    }

                                } catch (err) {
                                    console.log(err);
                                }
                            }
                        }
                    }


                } else {
                    temp = "No Account Details Found";
                }


            }
        })
        .catch(function (error) {
            console.log(error);
        });



});


// New Cheque Book Req --- 19
router.post('/newchequebookreq/:mobile/:accountnumber', async (req, res) => {
    accountNumber = req.params.accountnumber;
    // console.log({ accountNumber });
    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });

    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }

    // Select Cheque Account Number
    url3 = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/SelectChequeAccount?mobile=' + mobileNumber;
    var config3 = {
        method: 'get',
        url: url3,
        headers: {}
    };

    axios(config3)
        .then(async function (response) {
            if (response.data.code == "0") {
                // console.log('Something went wrong');
                return res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });
            }
            else {
                result3 = response.data.attributes;
                result4 = response.data.responseBody.split(',');

                // console.log({ result3 });
                // console.log({ result4 });
                // temp = 'Account Details : ' + '\n\n';
                if (result3 != undefined) {

                    if (result3.length < accountNumber) {
                        // console.log(result3.length);
                        return res.send({
                            code: 100,
                            status: 'FAILED',
                            data: "Something went wrong"
                        });
                    }
                    else {
                        for (let i = 0; i < result3.length; i++) {
                            result5 = result4[i].split('.');
                            // console.log({ result5 });
                            // temp += result3[i].attrname + ' : ' + result3[i].attrvalue + '\n' + ' : ' + result5[1] + '\n';

                            // temp += '\n';

                            if (result3[i].attrname === accountNumber) {
                                // console.log(result5[1]);
                                url = 'http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/NewChequeBookReq?accountNumber=' + result5[1];

                                var config = {
                                    method: 'get',
                                    url: url,
                                    headers: {}
                                };

                                axios(config)
                                    .then(function (response) {
                                        // console.log(JSON.stringify(response.data));
                                        if (response.data.code == "0" || response.data.code == null) {
                                            result = response.data.status;
                                            return res.send({
                                                code: 100,
                                                status: 'FAILED',
                                                data: result
                                            });
                                        } else {
                                            result = response.data.responseBody.text;
                                            response1 = {
                                                code: 200,
                                                status: "success",
                                                type: "text",
                                                data: result
                                            };
                                            return res.json(response1);
                                        }
                                    })
                                    .catch(function (error) {
                                        console.log(error);
                                    });

                            }
                        }
                    }


                } else {
                    temp = "No Account Details Found";
                }


            }
        })
        .catch(function (error) {
            console.log(error);
        });


});

// Select Cheque Account --- 20
router.post('/selectchequeaccount/:mobile', async (req, res) => {
    mobileNumber = req.params.mobile;
    // console.log({ mobileNumber });

    if (mobileNumber.length == 12) {
        mobileNumber = mobileNumber.substring(2, 12);
        // console.log({ mobileNumber });
    }

    url = ' http://203.112.134.222:9084/FINCORE.CONNECT/FinCoreWhatsappConnect.svc/Wapi/WhatsappAPI/SelectChequeAccount?mobile=' + mobileNumber;
    var config = {
        method: 'get',
        url: url,
        headers: {}
    };

    axios(config)
        .then(function (response) {
            if (response.data.code == "0") {
                result = response.data.status;
                return res.send({
                    code: 100,
                    status: 'FAILED',
                    data: result
                });
            }
            else {
                result = response.data.attributes;
                result1 = response.data.responseBody.split(',');

                // console.log({ result });
                // console.log({ result1 });
                // temp = 'Account Details : ' + '\n\n';
                temp = "Please select your Account Number" + '\n\n';
                if (result != undefined) {
                    for (let i = 0; i < result.length; i++) {
                        result2 = result1[i].split('.');
                        // console.log({ result2 });
                        temp += 'Type *' + result[i].attrname + '* : ' + result2[1] + '\n';

                        temp += '\n';


                    }
                    temp += 'Type *#* to go back to the *Main Menu*.';
                } else {
                    temp = "No Account Details Found";
                }

                let response1 = {
                    code: '200',
                    status: "Success",
                    type: 'text',
                    data: temp
                };
                return res.json(response1);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
});


module.exports = router;




