const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
// const dbpool = require('../DbFiles/torrentDB');
const cron = require('node-cron');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const ufs = require("url-file-size");
// const pool = require('../DbFiles/torpng');
const { log } = require('console');
const request = require('request').defaults({ encoding: null });
const mysql = require('mysql2');

let pool = mysql.createPool({
    database: 'torrent_gas',
    connectionLimit: 50,
    waitForConnections: true,
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
});

let pool1 = mysql.createPool({
    database: 'torrent_gas',
    connectionLimit: 50,
    waitForConnections: true,
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
});

pool = pool.promise();
let dbpool = pool1.promise();

let DbOperation = async (MobileNo, dataValues) => {
    try {
        let query = "SELECT * FROM png WHERE mobileno= ?";
        let values = [MobileNo];
        let [DBRes] = await dbpool.query(query, values);

        console.log("[DBRes]------------------------>", DBRes)
        if (DBRes.length > 0) {
            let query = "REPLACE INTO png (mobileno,serviceno) VALUES (?,?)";
            let values = [MobileNo, JSON.stringify(dataValues)];
            let [res] = await dbpool.query(query, values);
            if (res) {
                console.log(res);
            }
        } else {
            let query = "INSERT INTO png (mobileno,serviceno) VALUES (?,?)";
            let values = [MobileNo, JSON.stringify(dataValues)];
            let [res1] = await dbpool.query(query, values);
            if (res1) {
                console.log(res1);
            }
        }
    } catch (error) {
        return error;
    }
};


router.post('/mobileNoVerification/:mobileno', async (req, res) => {
    try {
        console.log('mobileNoVerification : '+JSON.stringify(req.body));
        let MobileNo = req.params.mobileno;
        if (MobileNo.startsWith("91")) {
            MobileNo = MobileNo.substring(2);
        }
        let response = await fetch(
            `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/getServiceNo?MobileNo=${MobileNo}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                    'Cookie': 'saplb_*=(J2EE207654120)207654151'
                }
            }
        );
        let data = await response.json();
        console.log({ data });
        let objectLength = Object.keys(data).length;
        console.log({ objectLength });
        if (objectLength > 0) {
            if (data.registrationFlag === 'N') {
                return res.status(200).json({ code: 100, status: "failed", data: data.registrationFlagMessage });
            }
            else {
                let dataValues = {};
                let keyString = '';
                let valueString = '';
                let serviceNos = data.serviceNo;
                // console.log({ serviceNos });
                for (let i = 1; i <= serviceNos.length; i++) {
                    dataValues[i] = serviceNos[(i - 1)];
                    // console.log("first", dataValues[i]);
                }
                if (serviceNos.length > 1 && serviceNos.length < 5) {
                    let DbOperationResult = await DbOperation(MobileNo, serviceNos);
                    console.log({ DbOperationResult });

                    let dataString = JSON.stringify(dataValues);
                    console.log({ dataString });
                    dataString = dataString.substring(1, (dataString.length - 1));
                    console.log({ dataString });
                    dataString = dataString.replace(/"/g, '');
                    dataString = dataString.replace(/,/g, '\n');
                    return res.status(200).json({
                        code: 300, status: "success", type: "text", data: `Your Whatsapp number is registered with us on multiple Customer ID. Request you to review below customer IDs and enter 1,2,3,or 4 to select desire ID.\n${dataString}\n\nGo back to the Main Menu Please Send *B* `
                    });
                } else if (serviceNos.length > 5) {
                    console.log("comes here", { serviceNos });
                    let DbOperationResult = await DbOperation(MobileNo, serviceNos);
                    console.log({ DbOperationResult });
                    // let dataString = JSON.stringify(dataValues);
                    // console.log("comes here1", { dataString });
                    return res.status(200).json({ code: 400, status: "success", type: "text", data: `Registed with 5 customer Id's` });
                } else {
                    let DbOperationResult = await DbOperation(MobileNo, serviceNos);
                    return res.status(200).json({ code: 200, status: "success", type: "text", data: "Registered with 1 customer Id" });
                }
            }
        }
    } catch (error) {
        return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
    }

});


router.post('/validateServiceNo/:mobileno/:input', async (req, res) => {
    try {
        let MobileNo = req.params.mobileno;
        if (MobileNo.startsWith("91")) {
            MobileNo = MobileNo.substring(2);
        }
        let maskedNumber = MobileNo.replace(/(?<=\d\d)\d(?=\d{4})/g, "*");
        let InputValue = req.params.input;
        console.log({ InputValue });
        let [getServcieNoRes] = await getServcieNo(InputValue, MobileNo);
        console.log({ getServcieNoRes });
        if (getServcieNoRes.length > 0 && getServcieNoRes[0].service_no != null) {

            console
            let ServiceNo = getServcieNoRes[0].service_no;
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/validateServiceNo?ServiceNo=${ServiceNo}`,
                headers: {
                    'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                    'Cookie': 'saplb_*=(J2EE207654120)207654150'
                }
            };

            await axios(config)
                .then(async (response) => {
                    // console.log("response==========", response);
                    let objData = response.data;
                    // console.log({ objData });
                    let objectLength = Object.keys(objData).length;
                    // console.log({ objectLength });
                    if (objectLength > 0) {
                        if (objData.isValid === 'Y' && objData.moveIn === 'Y') {
                            let data = new FormData();
                            data.append('service_no', ServiceNo);
                            // console.log("inside if");
                            let config = {
                                method: 'post',
                                maxBodyLength: Infinity,
                                url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/verification',
                                headers: {
                                    'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                                    'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
                                    ...data.getHeaders()
                                },
                                data: data
                            };

                            await axios(config)
                                .then(async (response) => {
                                    // console.log(response);
                                    let otpData = response.data.data;
                                    let OTP = otpData[0].otp;
                                    let query = "UPDATE png SET otp = ?,otpexpiry=addtime(NOW(),200) WHERE mobileno =?";
                                    let values = [OTP, MobileNo];
                                    let OtpRes = await dbpool.query(query, values);
                                    if (OtpRes) {
                                        return res.status(200).json({ code: 200, status: "success", type: "text", data: `We have sent 6-digit OTP on your Registered mobile number ${maskedNumber} and valid for two minutes. In case registered mobile is not in use please call our Toll-Free number or write to us on contact@torrentgas.com to update your mobile number.\n\nSend *P* to go back to previous menu or *B* for main menu.` });
                                    }
                                })
                                .catch(function (error) {
                                    console.log("err4", error);
                                    return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                                });
                        } else {
                            return res.status(200).json({ code: 100, status: "failed", data: "Invalid Customer ID" });
                        }
                    }
                })
                .catch(function (error) {

                    console.log("err1", error);
                    return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                });

        } else {
            console.log("err2");

            return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
        }
        // });
    } catch (error) {
        console.log(error)
        console.log("err3");

        return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
    }
});



router.post('/validateServiceNo2/:mobileno/:input', async (req, res) => {
    try {

        let MobileNo = req.params.mobileno;
        let ServiceNo = req.params.input;
        if (MobileNo.startsWith("91")) {
            MobileNo = MobileNo.substring(2);
        }
        let maskedNumber = MobileNo.replace(/(?<=\d\d)\d(?=\d{4})/g, "*");
        console.log({ maskedNumber });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/getServiceNo?MobileNo=${MobileNo}`,
            headers: {
                'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                'Cookie': 'saplb_*=(J2EE207654120)207654151'
            }
        };

        await axios(config)
            .then(async (response) => {
                console.log("response", response);
                let searchRes = response.data.serviceNo;
                // console.log({ searchRes });
                let string = searchRes.toString();
                console.log({ string });
                if (string.includes(ServiceNo)) {
                    console.log("Value found");
                    let config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/validateServiceNo?ServiceNo=${ServiceNo}`,
                        headers: {
                            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                            'Cookie': 'saplb_*=(J2EE207654120)207654150'
                        }
                    };

                    await axios(config)
                        .then(async (response) => {
                            console.log({ response });
                            let objData = response.data;
                            console.log({ objData });
                            let objectLength = Object.keys(objData).length;
                            if (objectLength > 0) {
                                if (objData.isValid === 'Y' && objData.moveIn === 'Y') {
                                    // console.log("inside move in")
                                    let data = new FormData();
                                    console.log({ data });
                                    data.append('service_no', ServiceNo);
                                    let config = {
                                        method: 'post',
                                        maxBodyLength: Infinity,
                                        url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/verification',
                                        headers: {
                                            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                                            'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
                                            ...data.getHeaders()
                                        },
                                        data: data
                                    };

                                    await axios(config)
                                        .then(async (response) => {
                                            let otpData = response.data.data;
                                            let OTP = otpData[0].otp;
                                            console.log({ OTP });
                                            let query = "UPDATE png set otp=?,otpexpiry=addtime(NOW(),30) WHERE mobileno =?";
                                            let value = [OTP, MobileNo];
                                            let OtpRes = await dbpool.query(query, value);
                                            if (OtpRes) {
                                                return res.status(200).json({ code: 200, status: "success", type: "text", data: `We have sent 6-digit OTP on your Registered mobile number ${maskedNumber} and valid for two minutes. In case registered mobile is not in use please call our Toll-Free number or write to us on contact@torrentgas.com to update your mobile number.\n\nSend *P* to go back to previous menu or *B* for main menu.` });
                                            }

                                        })
                                        .catch(function (error) {
                                            return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                                        });

                                } else {
                                    return res.status(200).json({ code: 100, status: "failed", data: "The PNG connection is not active in our record in case you are using the PNG connection please contact our Toll-Free number or send an e-mail to contact@torrentgas.com” Go back to the Main Menu Please Send *B*. " });
                                }
                            } else {
                                return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                            }
                        })
                        .catch(function (error) {
                            return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                        });

                } else {
                    return res.status(200).json({ code: 100, status: "failed", data: "ServiceNo Not Found" });
                }
            })
            .catch(function (error) {
                return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
            });

    } catch (error) {
        return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
    }
});

router.post('/validateOtp/:mobileno/:otp', async (req, res) => {
    try {
        let MobileNo = req.params.mobileno;
        if (MobileNo.startsWith("91")) {
            MobileNo = MobileNo.substring(2);
        }
        let OTP = req.params.otp;
        let query = "SELECT NOW(),otpexpiry,otp FROM png WHERE mobileno= ? AND otpexpiry >= NOW()";
        let values = [MobileNo];
        let [ValidateOtpRes] = await dbpool.query(query, values);
        if (ValidateOtpRes.length > 0) {
            let otp = ValidateOtpRes[0].otp;
            if (otp === OTP) {

                console.log("valid otp entered , ", otp, OTP)
                return res.status(200).json({ code: 200, status: "success", type: "text", data: "OTP verified successfully" });
            } else {
                console.log("wrong otp");
                console.log("invalid otp entered , ", otp, OTP)
                return res.status(200).json({ code: 300, status: "failed", data: "You have entered wrong otp\n\n Please type *P* to go back to previous menu and *B* for main menu" });
            }
        } else {

            console.log("otp expired")
            return res.status(200).json({ code: 100, status: "failed", data: "OTP is expired" });
        }
    } catch (error) {
        return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
    }
});


// router.post('/downloadPdf/:mobileno/:inputvalue/:billtype', async (req, res) => {
//     try {
//         let MobileNo = req.params.mobileno;
//         if (MobileNo.startsWith("91")) {
//             MobileNo = MobileNo.substring(2);
//         }
//         let InputValue = req.params.inputvalue;
//         let BillType = req.params.billtype;
//         console.log({ BillType });
//         if (BillType == '1') {
//             BillType = 'c';

//         } else if (BillType == '2') {
//             BillType = 'p';

//         }

//         console.log("BillType ==========================================", BillType)
//         if (InputValue.length === 10) {
//             let data = new FormData();
//             data.append('service_no', InputValue);
//             data.append('flag', BillType);
//             let config = {
//                 method: 'post',
//                 maxBodyLength: Infinity,
//                 url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/download-pdf',
//                 headers: {
//                     'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
//                     'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
//                     ...data.getHeaders()
//                 },
//                 data: data
//             };

//             await axios(config)
//                 .then(function (response) {
//                     let Url = response.data.url;
//                     return res.status(200).json({ code: 200, status: "success", type: "document", url: Url, data: `Please click on the link to view your PNG Bill \n ${Url}\n\nSend *P* to go back to previous menu.` });
//                 })
//                 .catch(function (error) {
//                     return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
//                 });
//         } else {
//             console.log("inside else block =======> ");
//             let [getServcieNoRes] = await getServcieNo(InputValue, MobileNo);
//             if (getServcieNoRes.length > 0 && getServcieNoRes[0].service_no != null) {
//                 let ServiceNo = getServcieNoRes[0].service_no;

//                 console.log("ServiceNo -----------------------------> ", ServiceNo)
//                 let data = new FormData();
//                 data.append('service_no', ServiceNo);
//                 data.append('flag', BillType);
//                 let config = {
//                     method: 'post',
//                     maxBodyLength: Infinity,
//                     url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/download-pdf',
//                     headers: {
//                         'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
//                         'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
//                         ...data.getHeaders()
//                     },
//                     data: data
//                 };
//                 await axios(config)
//                     .then(function (response) {
//                         let Url = response.data.url;
//                         let pdfRes = {
//                             code: 200,
//                             status: "success",
//                             type: "document",
//                             url: Url,
//                             data: `Please click on the link to view your PNG Bill \n ${Url}\n\nSend *P* to go back to previous menu. `
//                         };

//                         console.log("response------------", response.data.url)
//                         return res.status(200).json(pdfRes);
//                         // return res.status(200).json({ code: 200, status: "success", type: "document", url: Url, data: "Send *P* to go back to previous menu." });

//                     })
//                     .catch(function (error) {

//                         console.log("error----------------", error)
//                         return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
//                     });
//             } else {

//                 console.log("inside the else block of download pdf")
//                 return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
//             }
//         }

//     } catch (error) {
//         console.log(error);
//         return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
//     }
// });

router.post('/downloadPdf/:mobileno/:inputvalue/:billtype', async (req, res) => {
    try {
        let MobileNo = req.params.mobileno;
        if (MobileNo.startsWith("91")) {
            MobileNo = MobileNo.substring(2);
        }
        let InputValue = req.params.inputvalue;
        let BillType = req.params.billtype;
        console.log({ BillType });
        if (BillType == '1') {
            console.log("insdie bill type 1---------------------====================================----------------=");

            BillType = 'c';
            if (InputValue.length === 10) {
                let data = new FormData();
                data.append('service_no', InputValue);
                data.append('flag', BillType);
                let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/download-pdf',
                    headers: {
                        'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                        'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
                        ...data.getHeaders()
                    },
                    data: data
                };

                await axios(config)
                    .then(function (response) {
                        let Url = response.data.url;
                        return res.status(200).json({ code: 200, status: "success", type: "document", url: Url, data: `Please click on the link to view your PNG Bill \n ${Url}\n\nSend *P* to go back to previous menu.` });
                    })
                    .catch(function (error) {
                        return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                    });
            } else {
                console.log("inside else block =======> ");
                let [getServcieNoRes] = await getServcieNo(InputValue, MobileNo);
                if (getServcieNoRes.length > 0 && getServcieNoRes[0].service_no != null) {
                    let ServiceNo = getServcieNoRes[0].service_no;

                    console.log("ServiceNo -----------------------------> ", ServiceNo)
                    let data = new FormData();
                    data.append('service_no', ServiceNo);
                    data.append('flag', BillType);
                    let config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/download-pdf',
                        headers: {
                            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                            'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
                            ...data.getHeaders()
                        },
                        data: data
                    };
                    await axios(config)
                        .then(function (response) {
                            let Url = response.data.url;
                            let pdfRes = {
                                code: 200,
                                status: "success",
                                type: "document",
                                url: Url,
                                data: `Please click on the link to view your PNG Bill \n ${Url}\n\nSend *P* to go back to previous menu. `
                            };

                            console.log("response------------", response.data.url)
                            return res.status(200).json(pdfRes);
                            // return res.status(200).json({ code: 200, status: "success", type: "document", url: Url, data: "Send *P* to go back to previous menu." });

                        })
                        .catch(function (error) {

                            console.log("error----------------", error)
                            return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                        });
                } else {

                    console.log("inside the else block of download pdf")
                    return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                }
            }
        } else if (BillType == '2') {

            console.log("insdie bill ttype 2---------------------====================================----------------=")
            BillType = 'p';
            if (InputValue.length === 10) {
                let data = new FormData();
                data.append('service_no', InputValue);
                data.append('flag', BillType);
                let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/download-pdf',
                    headers: {
                        'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                        'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
                        ...data.getHeaders()
                    },
                    data: data
                };

                await axios(config)
                    .then(function (response) {
                        let Url = response.data.url;
                        return res.status(200).json({ code: 200, status: "success", type: "document", url: Url, data: `Please click on the link to view your previous PNG Bill. \n${Url} \nFor older bills please send us an email on contact@torrentgas.com or log on to connect.torrentgas.com\n\nSend *P* to go back to previous menu. ` });
                    })
                    .catch(function (error) {
                        return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                    });
            } else {
                console.log("inside else block =======> ");
                let [getServcieNoRes] = await getServcieNo(InputValue, MobileNo);
                if (getServcieNoRes.length > 0 && getServcieNoRes[0].service_no != null) {
                    let ServiceNo = getServcieNoRes[0].service_no;

                    console.log("ServiceNo -----------------------------> ", ServiceNo)
                    let data = new FormData();
                    data.append('service_no', ServiceNo);
                    data.append('flag', BillType);
                    let config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/download-pdf',
                        headers: {
                            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                            'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
                            ...data.getHeaders()
                        },
                        data: data
                    };
                    await axios(config)
                        .then(function (response) {
                            let Url = response.data.url;
                            let pdfRes = {
                                code: 200,
                                status: "success",
                                type: "document",
                                url: Url,
                                data: `Please click on the link to view your previous PNG Bill.\n${Url} \nFor older bills please send us an email on contact@torrentgas.com or log on to connect.torrentgas.com\n\nSend *P* to go back to previous menu.`
                            };

                            console.log("response------------", response.data.url)
                            return res.status(200).json(pdfRes);
                            // return res.status(200).json({ code: 200, status: "success", type: "document", url: Url, data: "Send *P* to go back to previous menu." });

                        })
                        .catch(function (error) {

                            console.log("error----------------", error)
                            return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                        });
                } else {

                    console.log("inside the else block of download pdf")
                    return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                }
            }
        }
        // if (InputValue.length === 10) {
        //     let data = new FormData();
        //     data.append('service_no', InputValue);
        //     data.append('flag', BillType);
        //     let config = {
        //         method: 'post',
        //         maxBodyLength: Infinity,
        //         url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/download-pdf',
        //         headers: {
        //             'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
        //             'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
        //             ...data.getHeaders()
        //         },
        //         data: data
        //     };

        //     await axios(config)
        //         .then(function (response) {
        //             let Url = response.data.url;
        //             return res.status(200).json({ code: 200, status: "success", type: "document", url: Url, data: `Please click on the link to view your PNG Bill \n ${Url}\n\nSend *P* to go back to previous menu.` });
        //         })
        //         .catch(function (error) {
        //             return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
        //         });
        // } else {
        //     console.log("inside else block =======> ");
        //     let [getServcieNoRes] = await getServcieNo(InputValue, MobileNo);
        //     if (getServcieNoRes.length > 0 && getServcieNoRes[0].service_no != null) {
        //         let ServiceNo = getServcieNoRes[0].service_no;

        //         console.log("ServiceNo -----------------------------> ", ServiceNo)
        //         let data = new FormData();
        //         data.append('service_no', ServiceNo);
        //         data.append('flag', BillType);
        //         let config = {
        //             method: 'post',
        //             maxBodyLength: Infinity,
        //             url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/download-pdf',
        //             headers: {
        //                 'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
        //                 'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
        //                 ...data.getHeaders()
        //             },
        //             data: data
        //         };
        //         await axios(config)
        //             .then(function (response) {
        //                 let Url = response.data.url;
        //                 let pdfRes = {
        //                     code: 200,
        //                     status: "success",
        //                     type: "document",
        //                     url: Url,
        //                     data: `Please click on the link to view your PNG Bill \n ${Url}\n\nSend *P* to go back to previous menu. `
        //                 };

        //                 console.log("response------------", response.data.url)
        //                 return res.status(200).json(pdfRes);
        //                 // return res.status(200).json({ code: 200, status: "success", type: "document", url: Url, data: "Send *P* to go back to previous menu." });

        //             })
        //             .catch(function (error) {

        //                 console.log("error----------------", error)
        //                 return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
        //             });
        //     } else {

        //         console.log("inside the else block of download pdf")
        //         return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
        //     }
        // }

    } catch (error) {
        console.log(error);
        return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
    }
});

router.post('/singleIdDownloadPdf/:mobileno/:billtype', async (req, res) => {
    try {
        let MobileNo = req.params.mobileno;
        if (MobileNo.startsWith("91")) {
            MobileNo = MobileNo.substring(2);
        }
        let BillType = req.params.billtype;
        if (BillType == '1') {
            BillType = 'c';
        } else if (BillType == '2') {
            BillType = 'p';
        }
        let data = new FormData();
        let [getSingleServcieNoRes] = await getSingleServcieNo(MobileNo);
        if (getSingleServcieNoRes.length > 0 && getSingleServcieNoRes[0].service_no != null) {
            let ServiceNo = getSingleServcieNoRes[0].service_no;
            console.log({ ServiceNo });
            let data = new FormData();
            data.append('service_no', ServiceNo);
            data.append('flag', BillType);
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/download-pdf',
                headers: {
                    'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                    'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
                    ...data.getHeaders()
                },
                data: data
            };
            await axios(config)
                .then(function (response) {
                    if (response.data.url != undefined) {
                        let Url = response.data.url;
                        let pdfRes = {
                            code: 200,
                            status: "success",
                            type: "document",
                            url: Url,
                            data: "Send *P* to go back to previous menu."
                        };
                        return res.status(200).json(pdfRes);
                    } else {
                        return res.status(200).json({ code: 100, status: "failed", data: "No Record Found" });
                    }
                })
                .catch(function (error) {
                    return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                });
        } else {
            return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
        }

    } catch (error) {
        return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
    }
});



router.post('/Payment/:mobileno/:servicenovalue', async (req, res) => {
    let MobileNo = req.params.mobileno;
    if (MobileNo.startsWith("91")) {
        MobileNo = MobileNo.substring(2);
    }
    let serviceNoValue = req.params.servicenovalue;
    console.log({ serviceNoValue });
    if (serviceNoValue.length === 10) {
        let data = new FormData();
        data.append('service_no', serviceNoValue);
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/payment',
            headers: {
                'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
                ...data.getHeaders()
            },
            data: data
        };

        await axios(config)
            .then(function (response) {
                if (response.data.data != undefined || response.data.data != null) {
                    let PaymentRes = response.data.data;
                    let Outstanding = PaymentRes[0].outstanding;
                    if (Outstanding != 'N') {
                        let due_date = PaymentRes[0].due_date;
                        let payment_link = PaymentRes[0].payment_link;
                        let amount = PaymentRes[0].amount;
                        return res.status(200).json({ code: 200, status: "success", type: "text", data: `Dear Customer, below is the details requested by you.\n\nCurrent Outstanding : *${amount}*\nDue Date : *${due_date}*\n\nPlease click below link to make payment now *${payment_link}*\n\nSend *P* to go back to previous menu or *B* for main menu”.` });
                    } else {
                        return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                    }

                } else {
                    return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                }
            })
            .catch(function (error) {
                return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
            });

    } else {
        let [getServcieNoRes] = await getServcieNo(serviceNoValue, MobileNo);
        if (getServcieNoRes.length > 0 && getServcieNoRes[0].service_no != null) {
            let ServiceNo = getServcieNoRes[0].service_no;
            let data = new FormData();
            data.append('service_no', ServiceNo);
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/payment',
                headers: {
                    'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                    'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
                    ...data.getHeaders()
                },
                data: data
            };

            await axios(config)
                .then(function (response) {
                    if (response.data.data != undefined || response.data.data != null) {
                        let PaymentRes = response.data.data;
                        let Outstanding = PaymentRes[0].outstanding;
                        if (Outstanding != 'N') {
                            let due_date = PaymentRes[0].due_date;
                            let payment_link = PaymentRes[0].payment_link;
                            let amount = PaymentRes[0].amount;
                            return res.status(200).json({ code: 200, status: "success", type: "text", data: `Dear Customer, below is the details requested by you.\n\nCurrent Outstanding : *${amount}*\nDue Date : *${due_date}*\n\nPlease click below link to make payment now *${payment_link}*\n\nSend *P* to go back to previous menu or *B* for main menu”.` });
                        } else {
                            return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                        }

                    } else {
                        return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                    }
                })
                .catch(function (error) {
                    return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                });
        } else {
            return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
        }

    }
});


router.post('/SinglePayment/:mobileno', async (req, res) => {
    let MobileNo = req.params.mobileno;
    if (MobileNo.startsWith("91")) {
        MobileNo = MobileNo.substring(2);
    }
    let [getSingleServcieNoRes] = await getSingleServcieNo(MobileNo);
    if (getSingleServcieNoRes.length > 0 && getSingleServcieNoRes[0].service_no != null) {
        let ServiceNo = getSingleServcieNoRes[0].service_no;
        let data = new FormData();
        data.append('service_no', ServiceNo);
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/payment',
            headers: {
                'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
                ...data.getHeaders()
            },
            data: data
        };
        await axios(config)
            .then(function (response) {
                if (response.data.data != undefined || response.data.data != null) {
                    let PaymentRes = response.data.data;
                    let Outstanding = PaymentRes[0].outstanding;
                    if (Outstanding != 'N') {
                        let due_date = PaymentRes[0].due_date;
                        let payment_link = PaymentRes[0].payment_link;
                        let amount = PaymentRes[0].amount;
                        return res.status(200).json({ code: 200, status: "success", type: "text", data: `Dear Customer, below is the details requested by you.\n\nCurrent Outstanding : *${amount}*\nDue Date : *${due_date}*\n\nPlease click below link to make payment now *${payment_link}*\n\nSend *P* to go back to previous menu or *B* for main menu”.` });
                    } else {
                        return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                    }
                } else {
                    return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                }
            })
            .catch(function (error) {
                return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
            });
    } else {
        return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
    }
});



router.post('/meterValidate/:serviceno/:mobileno', async (req, res) => {
    let serviceno = req.params.serviceno;
    let MobileNo = req.params.mobileno;
    let data = new FormData();
    if (MobileNo.startsWith("91")) {
        MobileNo = MobileNo.substring(2);
    }
    if (serviceno.length === 10) {
        data.append('service_no', serviceno);
    } else {
        let [getServcieNoRes] = await getServcieNo(serviceno, MobileNo);
        if (getServcieNoRes.length > 0 && getServcieNoRes[0].service_no) {
            let serviceno1 = getServcieNoRes[0].service_no;
            data.append('service_no', serviceno1);
        }
    }
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/validate-meter-reading',
        headers: {
            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
            'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
            ...data.getHeaders()
        },
        data: data
    };
    await axios(config)
        .then(async (response) => {
            let mro_open_status = response.data.data[0].mro_open_status;
            let message = response.data.data[0].message;
            let previous_reading = response.data.data[0].previous_reading;
            let default_reading = response.data.data[0].default_reading.toString();//.trim();
            if (mro_open_status == 'N') {
                return res.status(200).json({ code: 100, status: "failed", data: message });
            } else {
                let query = 'UPDATE png set previous_reading=?,default_reading=? WHERE mobileno =?';
                let values = [previous_reading, default_reading, MobileNo];
                let UpdateRes = await dbpool.query(query, values);
                if (UpdateRes) {
                    return res.status(200).json({ code: 200, status: "success", type: "text", data: 'MRO Open' });
                }
            }
        })
        .catch(function (error) {
            return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
        });

});


router.post('/submit-meter-reading/:reading/:image/:mobileno/:serviceno', async (req, res) => {
    try {
        let serviceNo = req.params.serviceno;
        let readingNo = req.params.reading;
        let mediaId = req.params.image;
        let MobileNo = req.params.mobileno;
        let tempMobileNo;
        let formattedNumber;
        if (MobileNo.startsWith("91")) {
            tempMobileNo = MobileNo.substring(2);
        }
        if (readingNo.includes(".")) {
            const regex1 = /^\d{5}(\.\d{3})?$/;
            if (regex1.test(readingNo) === true) {
                formattedNumber = readingNo;
            } else {
                return res.status(200).json({ code: 100, status: "failed", data: "Please entered 8 digit number in the below format.\n*Ex. 00123.000*\n\nSend *P* to go back to previous menu." });
            }

        } else if (readingNo.includes(".") === false && readingNo.length == 5) {
            formattedNumber = readingNo + '.000';

        } else {
            return res.status(200).json({ code: 100, status: "failed", data: "Please entered 8 digit number in the below format.\n*Ex. 00123.000*\n\nSend *P* to go back to previous menu." });
        }
        readingNo = parseInt(formattedNumber);
        console.log(readingNo);
        let query = 'SELECT previous_reading, default_reading FROM `png` WHERE mobileno = ?';
        let values = [tempMobileNo];
        let [ReadingResult] = await dbpool.query(query, values);
        if (ReadingResult) {
            let previous_reading = ReadingResult[0].previous_reading;
            let default_reading = ReadingResult[0].default_reading;
            previous_reading = parseInt(previous_reading);
            let TempReading = previous_reading + parseInt(default_reading);
            if (readingNo < previous_reading) {
                return res.status(200).json({ code: 100, status: "failed", data: 'The Current meter reading cannot be lower than last Actual Reading, please enter the meter reading and upload photo again.\n\n Send *P* to go back to previous menu.' });
            } else if (readingNo > TempReading) {
                return res.status(200).json({ code: 100, status: "failed", data: 'Gas consumption units are more than specified limit, our meter reader will visit your premises to collect meter reading as per schedule.\n\n Send *P* to go back to previous menu.' });
            } else if (readingNo > previous_reading && readingNo < TempReading) {
                let [mediaResult] = await getMediaUrl(MobileNo, mediaId);
                let mediaUrl = mediaResult.mediaurl;
                let urlFileSize = await ufs(mediaUrl);
                let urlFileSizeinKB = await Number(urlFileSize / 1024).toFixed(2);
                let urlFileSizeinMB = await Number(urlFileSizeinKB / 1024).toFixed(2);
                if (urlFileSizeinMB < 4) {
                    request.get(mediaUrl, async (error, response, body) => {
                        if (!error && response.statusCode == 200) {
                            let imagebase64 = Buffer.from(body).toString('base64');
                            let data = new FormData();
                            data.append('service_no', serviceNo);
                            data.append('meter_reading', formattedNumber);
                            data.append('meter_image', imagebase64);
                            let config = {
                                method: 'post',
                                maxBodyLength: Infinity,
                                url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/submit-meter-reading',
                                headers: {
                                    'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                                    'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
                                    ...data.getHeaders()
                                },
                                data: data
                            };
                            await axios(config)
                                .then(function (response) {
                                    if (response.data.code == 200) {
                                        return res.status(200).json({ code: 200, status: "success", type: "text", data: `Dear Customer, thank you for submitting meter photo and reading with us. You have an option to generate the bill right now, Press *Y* to generate the bill right now,\n\nSend *P* to go back to previous menu or *B* for main menu.` });
                                    }
                                })
                                .catch(function (error) {
                                    return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                                });
                        }
                    });
                } else {
                    return res.status(200).json({ code: 100, status: "failed", data: "Image Size is larger than 4 MB" });
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({ code: 100, status: "failed", data: "Something went wrong" });
    }
});


router.post('/submit-meter-reading1/:image/:reading/:mobileno/:serviceno', async (req, res) => {
    try {
        let serviceNo = req.params.serviceno;
        let readingNo = req.params.reading;
        let mediaId = req.params.image;
        let MobileNo = req.params.mobileno;
        let tempMobileNo;
        let formattedNumber;
        if (MobileNo.startsWith("91")) {
            tempMobileNo = MobileNo.substring(2);
        }
        if (readingNo.includes(".")) {
            const regex1 = /^\d{5}(\.\d{3})?$/;
            if (regex1.test(readingNo) === true) {
                formattedNumber = readingNo;
            } else {
                return res.status(200).json({ code: 100, status: "failed", data: "Please entered 8 digit number in the below format.\n*Ex. 00123.000*\n\nSend *P* to go back to previous menu." });
            }

        } else if (readingNo.includes(".") === false && readingNo.length == 5) {
            formattedNumber = readingNo + '.000';

        } else {
            return res.status(200).json({ code: 100, status: "failed", data: "Please entered 8 digit number in the below format.\n*Ex. 00123.000*\n\nSend *P* to go back to previous menu." });
        }

        readingNo = parseInt(formattedNumber);
        console.log(readingNo);
        let query = 'SELECT previous_reading, default_reading FROM `png` WHERE mobileno = ?';
        let values = [tempMobileNo];
        let [ReadingResult] = await dbpool.query(query, values);
        if (ReadingResult) {
            let previous_reading = ReadingResult[0].previous_reading;
            let default_reading = ReadingResult[0].default_reading;
            previous_reading = parseInt(previous_reading);
            let TempReading = previous_reading + parseInt(default_reading);
            if (readingNo < previous_reading) {
                console.log("inside case1");
                return res.status(200).json({ code: 100, status: "failed", data: 'The Current meter reading cannot be lower than last Actual Reading, please enter the meter reading and upload photo again.\n\n Send *P* to go back to previous menu.' });
            } else if (readingNo > TempReading) {
                console.log("inside case2");
                return res.status(200).json({ code: 100, status: "failed", data: 'Gas consumption units are more than specified limit, our meter reader will visit your premises to collect meter reading as per schedule.\n\n Send *P* to go back to previous menu.' });
            } else if (readingNo > previous_reading && readingNo < TempReading) {
                console.log("inside case3");
                let [mediaResult] = await getMediaUrl(MobileNo, mediaId);
                let mediaUrl = mediaResult.mediaurl;
                let urlFileSize = await ufs(mediaUrl);
                let urlFileSizeinKB = await Number(urlFileSize / 1024).toFixed(2);
                let urlFileSizeinMB = await Number(urlFileSizeinKB / 1024).toFixed(2);
                if (urlFileSizeinMB < 4) {
                    request.get(mediaUrl, async (error, response, body) => {
                        if (!error && response.statusCode == 200) {
                            let imagebase64 = Buffer.from(body).toString('base64');
                            let data = new FormData();
                            if (serviceNo.length === 10) {
                                console.log(serviceNo);
                                data.append('service_no', serviceNo);
                            } else {
                                let res = await getServcieNo(serviceNo, tempMobileNo);
                                // console.log(res)
                            }
                            console.log(formattedNumber, imagebase64);
                            data.append('meter_reading', formattedNumber);
                            data.append('meter_image', imagebase64);
                            // console.log("pushed data===============", data);
                            let config = {
                                method: 'post',
                                maxBodyLength: Infinity,
                                url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/submit-meter-reading',
                                headers: {
                                    'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                                    'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
                                    ...data.getHeaders()
                                },
                                data: data
                            };
                            console.log("pushed data=====================", config);
                            await axios(config)
                                .then(function (response) {
                                    console.log("response  received data===============", JSON.stringify(response.data));
                                    if (response.data.code == 200) {
                                        return res.status(200).json({ code: 200, status: "success", type: "text", data: `Dear Customer, thank you for submitting meter photo and reading with us. You have an option to generate the bill right now, Press *Y* to generate the bill right now,\n\nSend *P* to go back to previous menu or *B* for main menu.` });
                                    }
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                                });
                        }
                    });
                } else {
                    return res.status(200).json({ code: 100, status: "failed", data: "Image Size is larger than 4 MB" });
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({ code: 100, status: "failed", data: "Something went wrong" });
    }
});


router.post('/generate-bill/:serviceno', async (req, res) => {
    let serviceNo = req.params.serviceno;
    let data = new FormData();
    data.append('service_no', serviceNo);
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/generate-bill',
        headers: {
            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
            'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
            ...data.getHeaders()
        },
        data: data
    };

    await axios(config)
        .then(function (response) {
            let result = response.data;
            if (result) {
                return res.status(200).json({ code: 200, status: "success", type: "text", data: result.data[0].message });
            } else {
                return res.status(200).json({ code: 100, status: "failed", data: "No Record Found" });
            }

        })
        .catch(function (error) {
            return res.status(200).json({ code: 100, status: "failed", data: "Something went wrong" });
        });

});


router.post('/meterValidateSingle/:mobileno', async (req, res) => {
    let MobileNo = req.params.mobileno;
    let data = new FormData();
    if (MobileNo.startsWith("91")) {
        MobileNo = MobileNo.substring(2);
    }
    let [getServcieNoRes] = await getSingleServcieNo(MobileNo);
    if (getServcieNoRes.length > 0 && getServcieNoRes[0].service_no) {
        let serviceno1 = getServcieNoRes[0].service_no;
        data.append('service_no', serviceno1);
    }

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/validate-meter-reading',
        headers: {
            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
            'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
            ...data.getHeaders()
        },
        data: data
    };
    await axios(config)
        .then(async (response) => {
            let mro_open_status = response.data.data[0].mro_open_status;
            let message = response.data.data[0].message;
            let previous_reading = response.data.data[0].previous_reading;
            let default_reading = response.data.data[0].default_reading.toString();//.trim();
            if (mro_open_status == 'N') {
                return res.status(200).json({ code: 100, status: "failed", data: message });
            } else {
                let query = 'UPDATE png set previous_reading=?,default_reading=? WHERE mobileno =?';
                let values = [previous_reading, default_reading, MobileNo];
                let UpdateRes = await dbpool.query(query, values);
                if (UpdateRes) {
                    return res.status(200).json({ code: 200, status: "success", type: "text", data: 'MRO Open' });
                }
            }
        })
        .catch(function (error) {
            return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
        });

});


router.post('/submit-meter-readingSingle/:reading/:image/:mobileno', async (req, res) => {
    try {
        let readingNo = req.params.reading;
        let mediaId = req.params.image;
        let MobileNo = req.params.mobileno;
        let tempMobileNo;
        let formattedNumber;
        if (MobileNo.startsWith("91")) {
            tempMobileNo = MobileNo.substring(2);
        }
        if (readingNo.includes(".")) {
            const regex1 = /^\d{5}(\.\d{3})?$/;
            if (regex1.test(readingNo) === true) {
                formattedNumber = readingNo;
            } else {
                return res.status(200).json({ code: 100, status: "failed", data: "Please entered 8 digit number in the below format.\n*Ex. 00123.000*\n\nSend *P* to go back to previous menu." });
            }

        } else if (readingNo.includes(".") === false && readingNo.length == 5) {
            formattedNumber = readingNo + '.000';

        } else {
            return res.status(200).json({ code: 100, status: "failed", data: "Please entered 8 digit number in the below format.\n*Ex. 00123.000*\n\nSend *P* to go back to previous menu." });
        }
        readingNo = parseInt(formattedNumber);
        let query = 'SELECT previous_reading, default_reading FROM `png` WHERE mobileno = ?';
        let values = [tempMobileNo];
        let [ReadingResult] = await dbpool.query(query, values);
        if (ReadingResult) {
            let previous_reading = ReadingResult[0].previous_reading;
            let default_reading = ReadingResult[0].default_reading;
            previous_reading = parseInt(previous_reading);
            let TempReading = previous_reading + parseInt(default_reading);
            if (readingNo < previous_reading) {
                return res.status(200).json({ code: 100, status: "failed", data: 'The Current meter reading cannot be lower than last Actual Reading, please enter the meter reading and upload photo again.\n\n Send *P* to go back to previous menu.' });
            } else if (readingNo > TempReading) {
                return res.status(200).json({ code: 100, status: "failed", data: 'Gas consumption units are more than specified limit, our meter reader will visit your premises to collect meter reading as per schedule.\n\n Send *P* to go back to previous menu.' });
            } else if (readingNo > previous_reading && readingNo < TempReading) {
                let [mediaResult] = await getMediaUrl(MobileNo, mediaId);
                let mediaUrl = mediaResult.mediaurl;
                let urlFileSize = await ufs(mediaUrl);
                let urlFileSizeinKB = await Number(urlFileSize / 1024).toFixed(2);
                let urlFileSizeinMB = await Number(urlFileSizeinKB / 1024).toFixed(2);
                if (urlFileSizeinMB < 4) {
                    request.get(mediaUrl, async (error, response, body) => {
                        if (!error && response.statusCode == 200) {
                            let imagebase64 = Buffer.from(body).toString('base64');
                            let data = new FormData();
                            let [getServcieNoRes] = await getSingleServcieNo(tempMobileNo);
                            if (getServcieNoRes.length > 0 && getServcieNoRes[0].service_no) {
                                let serviceno1 = getServcieNoRes[0].service_no;
                                data.append('service_no', serviceno1);
                            }

                            // data.append('service_no', serviceNo);
                            data.append('meter_reading', formattedNumber);
                            data.append('meter_image', imagebase64);
                            let config = {
                                method: 'post',
                                maxBodyLength: Infinity,
                                url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/submit-meter-reading',
                                headers: {
                                    'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                                    'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
                                    ...data.getHeaders()
                                },
                                data: data
                            };
                            await axios(config)
                                .then(function (response) {
                                    if (response.data.code == 200) {
                                        return res.status(200).json({ code: 200, status: "success", type: "text", data: `Dear Customer, thank you for submitting meter photo and reading with us. You have an option to generate the bill right now, Press *Y* to generate the bill right now,\n\nSend *P* to go back to previous menu or *B* for main menu.` });
                                    }
                                })
                                .catch(function (error) {
                                    return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                                });
                        }
                    });
                } else {
                    return res.status(200).json({ code: 100, status: "failed", data: "Image Size is larger than 4 MB" });
                }
            }
        }
    } catch (error) {
        return res.status(200).json({ code: 100, status: "failed", data: "Something went wrong" });
    }
});


router.post('/submit-meter-reading1/:image/:reading/:mobileno', async (req, res) => {
    try {
        let readingNo = req.params.reading;
        let mediaId = req.params.image;
        let MobileNo = req.params.mobileno;
        let tempMobileNo;
        let formattedNumber;
        if (MobileNo.startsWith("91")) {
            tempMobileNo = MobileNo.substring(2);
        }
        if (readingNo.includes(".")) {
            const regex1 = /^\d{5}(\.\d{3})?$/;
            if (regex1.test(readingNo) === true) {
                formattedNumber = readingNo;
            } else {
                return res.status(200).json({ code: 100, status: "failed", data: "Please entered 8 digit number in the below format.\n*Ex. 00123.000*\n\nSend *P* to go back to previous menu." });
            }

        } else if (readingNo.includes(".") === false && readingNo.length == 5) {
            formattedNumber = readingNo + '.000';

        } else {
            return res.status(200).json({ code: 100, status: "failed", data: "Please entered 8 digit number in the below format.\n*Ex. 00123.000*\n\nSend *P* to go back to previous menu." });
        }

        readingNo = parseInt(formattedNumber);
        let query = 'SELECT previous_reading, default_reading FROM `png` WHERE mobileno = ?';
        let values = [tempMobileNo];
        let [ReadingResult] = await dbpool.query(query, values);
        if (ReadingResult) {
            let previous_reading = ReadingResult[0].previous_reading;
            let default_reading = ReadingResult[0].default_reading;
            previous_reading = parseInt(previous_reading);
            let TempReading = previous_reading + parseInt(default_reading);
            if (readingNo < previous_reading) {
                console.log("inside case1");
                return res.status(200).json({ code: 100, status: "failed", data: 'The Current meter reading cannot be lower than last Actual Reading, please enter the meter reading and upload photo again.\n\n Send *P* to go back to previous menu.' });
            } else if (readingNo > TempReading) {
                console.log("inside case2");
                return res.status(200).json({ code: 100, status: "failed", data: 'Gas consumption units are more than specified limit, our meter reader will visit your premises to collect meter reading as per schedule.\n\n Send *P* to go back to previous menu.' });
            } else if (readingNo > previous_reading && readingNo < TempReading) {
                console.log("inside case3");
                let [mediaResult] = await getMediaUrl(MobileNo, mediaId);
                let mediaUrl = mediaResult.mediaurl;
                let urlFileSize = await ufs(mediaUrl);
                let urlFileSizeinKB = await Number(urlFileSize / 1024).toFixed(2);
                let urlFileSizeinMB = await Number(urlFileSizeinKB / 1024).toFixed(2);
                if (urlFileSizeinMB < 4) {
                    request.get(mediaUrl, async (error, response, body) => {
                        if (!error && response.statusCode == 200) {
                            let imagebase64 = Buffer.from(body).toString('base64');
                            let data = new FormData();
                            let [getServcieNoRes] = await getSingleServcieNo(tempMobileNo);
                            if (getServcieNoRes.length > 0 && getServcieNoRes[0].service_no) {
                                let serviceno1 = getServcieNoRes[0].service_no;
                                data.append('service_no', serviceno1);
                            }
                            data.append('meter_reading', formattedNumber);
                            data.append('meter_image', imagebase64);
                            let config = {
                                method: 'post',
                                maxBodyLength: Infinity,
                                url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/submit-meter-reading',
                                headers: {
                                    'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
                                    'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
                                    ...data.getHeaders()
                                },
                                data: data
                            };
                            await axios(config)
                                .then(function (response) {
                                    if (response.data.code == 200) {
                                        return res.status(200).json({ code: 200, status: "success", type: "text", data: `Dear Customer, thank you for submitting meter photo and reading with us. You have an option to generate the bill right now, Press *Y* to generate the bill right now,\n\nSend *P* to go back to previous menu or *B* for main menu.` });
                                    }
                                })
                                .catch(function (error) {
                                    return res.status(200).json({ code: 100, status: "failed", data: "Something Went Wrong" });
                                });
                        }
                    });
                } else {
                    return res.status(200).json({ code: 100, status: "failed", data: "Image Size is larger than 4 MB" });
                }
            }
        }
    } catch (error) {
        return res.status(200).json({ code: 100, status: "failed", data: "Something went wrong" });
    }
});


router.post('/generate-bill/:mobileno', async (req, res) => {
    let MobileNo = req.params.mobileno;
    let data = new FormData();
    if (MobileNo.startsWith("91")) {
        tempMobileNo = MobileNo.substring(2);
    }
    let [getServcieNoRes] = await getSingleServcieNo(tempMobileNo);
    if (getServcieNoRes.length > 0 && getServcieNoRes[0].service_no) {
        let serviceno1 = getServcieNoRes[0].service_no;
        data.append('service_no', serviceno1);
    }
    // data.append('service_no', serviceNo);
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/generate-bill',
        headers: {
            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
            'Cookie': 'cookiesession1=678A8C356AC8D4274561D80A4037C0D1',
            ...data.getHeaders()
        },
        data: data
    };

    await axios(config)
        .then(function (response) {
            let result = response.data;
            if (result) {
                return res.status(200).json({ code: 200, status: "success", type: "text", data: result.data[0].message });
            } else {
                return res.status(200).json({ code: 100, status: "failed", data: "No Record Found" });
            }

        })
        .catch(function (error) {
            return res.status(200).json({ code: 100, status: "failed", data: "Something went wrong" });
        });

});

router.post('/checkServiceNo/:mobileno', async (req, res) => {
    let mobileNo = req.params.mobileno;
    console.log({ mobileNo });

    if (mobileNo.length == 12 && mobileNo.startsWith("91")) {
        mobileNo = mobileNo.substring(2);
    }

    var data1 = '';

    var config1 = {
        method: 'post',
        url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/getServiceNo?MobileNo=${mobileNo}`,

        headers: {
            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1'
        },
        data: data1
    };

    let result = await axios(config1);

    let serviceNumberMsg = '';
    if (result.data.registrationFlag.toLowerCase() == "Y".toLowerCase()) {
        let tempServiceNumber = result.data.serviceNo;
        serviceNumberMsg += 'Please select from below mentioned customer code(s) found for your mobile number\n\n';
        let j = 1;
        for (let i = 0; i < tempServiceNumber.length; i++) {
            serviceNumberMsg += 'Type 👉 *' + j + '* for ' + tempServiceNumber[i] + '\n';
            j++;
        }
        console.log({ serviceNumberMsg });
        res.send({
            code: '200',
            status: 'SUCCESS',
            type: 'text',
            data: serviceNumberMsg
        });
    }
    if (result.data.registrationFlag.toLowerCase() == "N".toLowerCase()) {
        return res.send({
            code: '100',
            status: 'failed',
            data: 'Your mobile number is not registered with us.'
        });
    }
});


//Register Complaint_1
// Type 1 for High Bill - 443
// Type 2 Payment not updated - 262
// Type 3 Wrong Reading - 157
// Type 4 Estimated Bill to Actual Bill - 172
// Type 5 Check status of the complaint

router.post('/registerComplaint_1/:typeOfComplain/:mobileno/:remarks/:serviceno', async (req, res) => {

    let mobileNo = req.params.mobileno;
    let serviceno = req.params.serviceno;
    console.log({ mobileNo });

    if (mobileNo.length == 12 && mobileNo.startsWith("91")) {
        mobileNo = mobileNo.substring(2);
    }

    var data1 = '';

    var config1 = {
        method: 'post',
        url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/getServiceNo?MobileNo=${mobileNo}`,

        headers: {
            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1'
        },
        data: data1
    };

    let result = await axios(config1);

    console.log("result=====>>>" + (result.data.serviceNo));

    let serviceNumber = null;
    if (result.data.registrationFlag.toLowerCase() == "Y".toLowerCase()) {
        serviceNumber = result.data.serviceNo[parseInt(serviceno) - 1];
        console.log({ serviceNumber });
    }
    if (result.data.registrationFlag.toLowerCase() == "N".toLowerCase()) {
        return res.send({
            code: '100',
            status: 'failed',
            data: 'Your mobile number is not registered with us.'
        });
    }

    let complaintType = req.params.typeOfComplain;
    // let mobileNo = req.params.mobileno;
    console.log({ mobileNo });
    let remarks = req.params.remarks;
    let data = new FormData();

    let complaintTypecode = [443, 262, 157, 172];

    if (complaintType === '1') {
        complaintType = complaintTypecode[0];
    } else if (complaintType === '2') {
        complaintType = complaintTypecode[1];
    } else if (complaintType === '3') {
        complaintType = complaintTypecode[2];
    } else if (complaintType === '4') {
        complaintType = complaintTypecode[3];
    } else if (complaintType === '5') {
        return res.send({
            code: '300',
            status: 'SUCCESS',
            type: 'text',
            data: 'Dear Customer, please select option below to check status of your complaint. send “P” to go back to previous menu or “B” for main menu.'
        });
    } else {
        // complaintType = null;

        return res.send({
            code: '300',
            status: 'SUCCESS',
            type: 'text',
            data: 'You have entered incorrect option. Kindly refer the above notification. Send “P” to go back to previous menu or “B” for main menu'
        });

    }

    data.append('customerId', `${serviceNumber}`);
    data.append('typeOfComplain', `${complaintType}`);
    data.append('remarks', `${remarks}`);

    let config = {
        method: 'post',
        url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/register-complaint',
        headers: {
            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
            ...data.getHeaders()
        },
        data: data
    };


    let result_1 = await axios(config);
    try {
        console.log("result_1=====>>>" + result_1.data.msg);
        res.send({
            code: '200',
            status: 'SUCCESS',
            type: 'text',
            data: result_1.data.msg
        });
    } catch (error) {
        console.log(error);
    }

});

//Register_Compliant_2 for Image

router.post('/registerComplaint_2/:typeOfComplain/:mobileno/:remarks/:mediaid/:serviceno', async (req, res) => {
    let mobileNo = req.params.mobileno;
    let serviceno = req.params.serviceno;
    let mediaId = req.params.mediaid;
    console.log({ mobileNo });

    if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
        mobileNo = mobileNo.substring('2');
    }

    var data1 = '';

    var config1 = {
        method: 'post',
        url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/getServiceNo?MobileNo=${mobileNo}`,

        headers: {
            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1'
        },
        data: data1
    };

    let result = await axios(config1);

    console.log("result=====>>>" + (result.data.serviceNo));

    let serviceNumber = null;
    if (result.data.registrationFlag.toLowerCase() == "Y".toLowerCase()) {
        serviceNumber = result.data.serviceNo[parseInt(serviceno) - 1];
        console.log({ serviceNumber });
    }
    if (result.data.registrationFlag.toLowerCase() == "N".toLowerCase()) {
        return res.send({
            code: '100',
            status: 'failed',
            data: 'Your mobile number is not registered with us.'
        });
    }

    let imageconfig = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://partners.pinbot.ai/v1/downloadmedia/' + mediaId,
        headers: {
            'wanumber': '919921009285',
            'apikey': '3055acfa-7225-11ed-a7c7-9606c7e32d76'
        },
        responseType: 'arraybuffer'
    };
    let imageresult = await axios(imageconfig);
    console.log({ imageresult });
    let imageBase64String = Buffer.from(imageresult.data).toString('base64');
    console.log({ imageBase64String });
    let complaintType = req.params.typeOfComplain;
    // let mobileNo = req.params.mobileno;
    console.log({ mobileNo });
    let remarks = req.params.remarks;
    let data = new FormData();

    let complaintTypecode = [443, 262, 157, 172];

    if (complaintType === '1') {
        complaintType = complaintTypecode[0];
    } else if (complaintType === '2') {
        complaintType = complaintTypecode[1];
    } else if (complaintType === '3') {
        complaintType = complaintTypecode[2];
    } else if (complaintType === '4') {
        complaintType = complaintTypecode[3];
    } else if (complaintType === '5') {
        return res.send({
            code: '300',
            status: 'SUCCESS',
            type: 'text',
            data: 'Dear Customer, please select option below to check status of your complaint. send “P” to go back to previous menu or “B” for main menu.'
        });
    } else {
        // complaintType = null;

        return res.send({
            code: '300',
            status: 'SUCCESS',
            type: 'text',
            data: 'You have entered incorrect option. Kindly refer the above notification. Send “P” to go back to previous menu or “B” for main menu'
        });

    }

    data.append('customerId', `${serviceNumber}`);
    data.append('typeOfComplain', `${complaintType}`);
    data.append('remarks', `${remarks}`);
    data.append('attachment', 'data:image/jpeg;base64,' + imageBase64String);

    let config = {
        method: 'post',
        url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/register-complaint',
        headers: {
            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
            ...data.getHeaders()
        },
        data: data
    };


    let result_1 = await axios(config);
    try {
        console.log("result_1=====>>>" + result_1.data.msg);
        res.send({
            code: '200',
            status: 'SUCCESS',
            type: 'text',
            data: result_1.data.msg
        });
    } catch (error) {
        console.log(error);
    }
});

//Complaint_Status with customer ID at params

router.post('/complaintStatus/:typeOfComplain/:mobileno/:serviceno', async (req, res) => {
    let serviceno = req.params.serviceno;
    let complaintType = req.params.typeOfComplain;
    let mobileNo = req.params.mobileno;
    console.log({ serviceno });
    console.log({ mobileNo });

    if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
        mobileNo = mobileNo.substring('2');
    }

    var data1 = '';

    var config1 = {
        method: 'post',
        url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/getServiceNo?MobileNo=${mobileNo}`,

        headers: {
            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1'
        },
        data: data1
    };

    let result = await axios(config1);

    console.log("result=====>>>" + (result.data.serviceNo));
    let serviceNumber = null;
    if (result.data.registrationFlag.toLowerCase() == "Y".toLowerCase()) {
        serviceNumber = result.data.serviceNo[parseInt(serviceno) - 1];
        console.log({ serviceNumber });
    }
    if (result.data.registrationFlag.toLowerCase() == "N".toLowerCase()) {
        return res.send({
            code: '100',
            status: 'failed',
            data: 'Your mobile number is not registered with us.'
        });
    }

    let complaintTypecode = [443, 262, 157, 172];
    if (complaintType === '1') {
        complaintType = complaintTypecode[0];
    } else if (complaintType === '2') {
        complaintType = complaintTypecode[1];
    } else if (complaintType === '3') {
        complaintType = complaintTypecode[2];
    } else if (complaintType === '4') {
        complaintType = complaintTypecode[3];
    }


    var data = new FormData();
    data.append('customer_id', `${serviceNumber}`);

    var config = {
        method: 'post',
        url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/complaint-history',
        headers: {
            'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
            ...data.getHeaders()
        },
        data: data
    };

    let response = await axios(config);
    try {
        console.log(response.data);
        if (response.data.status.toLowerCase() == "FAIL".toLowerCase()) {
            res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: response.data.msg
            });
        } else {
            let tempResponse = response.data.response;
            let tempStr = 'Dear Customer, No complaint open in our system. To register the complaint, Go back to previous menu. send “P” to go back to previous menu or “B” for main menu';

            for (let i = 0; i < tempResponse.length; i++) {
                console.log(complaintType, tempResponse[i].Object_Code, tempResponse[i].Object_Code == complaintType);
                if (tempResponse[i].Object_Code == complaintType) {
                    tempStr = '';
                    console.log('i m here 1');
                    tempStr += 'Your complaint for Wrong Reading is registered with us with reference number ' + tempResponse[i].Notification_number;
                    tempStr += ' and our team is working on it to resolve at the earliest. We request you call at our Toll-Free number';
                    tempStr += ' or write us at contact@torrentgas.com to know more. send “P” to go back to previous menu or “B”';
                    tempStr += ' for main menu.';
                    break;
                } else {
                    console.log('i m here 2');
                }

            }
            res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: tempStr
            });
        }

    } catch (error) {
        console.log(error);
    }

});


// contact Us api

router.post('/contactUs/:mobileno', async (req, res) => {
    try {
        let mobileNo = req.params.mobileno;
        console.log({ mobileNo });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }

        // var data1 = '';

        let data = JSON.stringify({
            "Address_Type": "01"
        });

        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/FetchAddress`,

            headers: {
                'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
            },
            data: data
        };

        let result = await axios(config1);
        let arrobj = result.data.RECORD
        console.log("arrobj.length================>", arrobj.length)
        let stateArr = [];
        // console.log(map)
        let count = 1
        for (let i = 0; i < arrobj.length; i++) {
            console.log("i---------->", i, arrobj[i].STATE_NAME, "-----DISTRICT------------", arrobj[i].DISTRICT)
            stateArr.push(arrobj[i].STATE_NAME)
        }
        console.log(stateArr)
        const uniqueStates = [...new Set(stateArr)];

        let temp = "Please select the below state👇 \n\n";

        for (let i = 0; i < uniqueStates.length; i++) {
            temp += `Type ${i + 1} 👉 for  ${uniqueStates[i]} \n`;

        }
        console.log("uniqueStates-------------->", uniqueStates)

        if (result.data != 0) {
            return res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: temp
            });
        } else {
            return res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: "No address list found here"
            });
        }

    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: err
        });
    }



});

router.post('/getstatestest/:mobileno/:getstate', async (req, res) => {
    try {
        let mobileNo = req.params.mobileno;
        let type = req.params.getstate
        console.log({ mobileNo });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }

        // var data1 = '';

        let data = JSON.stringify({
            "Address_Type": "01"
        });

        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/FetchAddress`,

            headers: {
                'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
            },
            data: data
        };

        let result = await axios(config1);
        let arrobj = result.data.RECORD

        const stateDistrictArray = [];
        const postalcodeDistrict = [];
        // Iterate through the data array
        arrobj.forEach(item => {
            const { STATE_NAME, DISTRICT, Postal_Code } = item;
            // Find if the state already exists in the result array
            const existingStateIndex = stateDistrictArray.findIndex(state => state[STATE_NAME]);
            const existingDistIndex = postalcodeDistrict.findIndex(dist => dist[DISTRICT]);

            // If the state exists, push the district to its array of districts
            if (existingStateIndex !== -1) {
                stateDistrictArray[existingStateIndex][STATE_NAME].push(DISTRICT);
            } else {
                // If the state doesn't exist, create a new object and push it to the result array
                const stateObj = { [STATE_NAME]: [DISTRICT] };
                stateDistrictArray.push(stateObj);
            }

            if (existingDistIndex !== -1) {
                postalcodeDistrict[existingDistIndex][DISTRICT].push(Postal_Code);
            } else {
                const postcodeobj = { [DISTRICT]: [Postal_Code] };
                postalcodeDistrict.push(postcodeobj);
            }
        });
        console.log("postalcodeDistrict---------------------------->", postalcodeDistrict)

        console.log("stateDistrictArray-------------------->", stateDistrictArray);

        let stateArr = [];
        let DistArr = [];
        // console.log("arrobj------------------------>", arrobj)
        for (let i = 0; i < arrobj.length; i++) {
            // console.log("i---------->", i, arrobj[i].STATE_NAME, "-----DISTRICT------------", arrobj[i].DISTRICT)
            stateArr.push(arrobj[i].STATE_NAME);
            DistArr.push(arrobj[i].DISTRICT)
        }
        // console.log("stateArr-------------------   ", stateArr)
        const uniqueStates = [...new Set(stateArr)];
        const uniniwueDist = [... new Set(DistArr)];

        // console.log("uniqueStates-------->", uniqueStates)
        let temp = "Below are the district list \n\n";


        let a;
        for (let i = 0; i < uniqueStates.length; i++) {
            // console.log("inside uniqueStates for loop");
            if (type == (i + 1)) {
                // console.log("iside the if")
                // console.log("uniqueStates[i]:", uniqueStates[i], (i + 1))
                a = uniqueStates[i];
                break;
            }
            // console.log("a------------------------>", a)
        }
        // console.log("a1111111111111----------------------->", a)
        let uniqueDistrict;
        let uniqueDistrictArr = [];
        for (let j = 0; j < stateDistrictArray.length; j++) {

            // console.log("stateDistrictArray[i][j].STATE_NAME) -------------------->", stateDistrictArray[j][`${a}`])
            uniqueDistrict = stateDistrictArray[j][`${a}`]
            uniqueDistrictArr = [...new Set(uniqueDistrict)];

            console.log("uniqueDistrictArr ------------> ", uniqueDistrictArr)

            for (let i = 0; i < uniniwueDist.length; i++) {
                if (uniqueDistrictArr.length > 0 && uniqueDistrictArr[0] == uniniwueDist[i]) {
                    console.log(uniqueDistrictArr)
                }
            }


            if (stateDistrictArray[j][`${a}`] != undefined) {
                for (let i = 0; i < uniqueDistrict.length; i++) {


                    temp += `Type ${i + 1} 👉   ${uniqueDistrict[i]} \n`;
                }
            }
        }
        if (result.data != 0) {
            return res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: temp
            });
        } else {
            return res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: "No address list found here"
            });
        }

    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: err
        });
    }


});

router.post('/contactUs/:mobileno/:district', async (req, res) => {
    try {
        let mobileNo = req.params.mobileno;
        console.log({ mobileNo });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }

        // var data1 = '';

        let data = JSON.stringify({
            "Address_Type": "01"
        });

        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/FetchAddress`,

            headers: {
                'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
            },
            data: data
        };

        let result = await axios(config1);
        let arrobj = result.data.RECORD
        let map = new Map()
        console.log(map)
        let count = 1
        for (let i = 0; i < arrobj.length; i++) {
            if (map.get(arrobj[i].STATE_NAME)) {
                map.set(arrobj[i].STATE_NAME, count)
            } else {
                map.set(arrobj[i].STATE_NAME, (count + 1))
            }
        }
        let arr = [];
        for (let keys of map) {
            console.log("keys==================>", keys[0])
            arr.push(keys[0])

        }
        console.log("arr-------------->", arr)


        console.log(map)

        if (result.data != 0) {
            return res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: arr
            });
        } else {
            return res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: "No address list found here"
            });
        }

    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: err
        });
    }

});

// getstatestest
router.post('/getstates/:mobileno/:getstate', async (req, res) => {
    try {
        let mobileNo = req.params.mobileno;
        let type = req.params.getstate
        console.log({ mobileNo });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }
        let data = JSON.stringify({
            "Address_Type": "01"
        });
        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/FetchAddress`,

            headers: {
                'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
            },
            data: data
        };

        let result = await axios(config1);
        let arrobj = result.data.RECORD

        const stateDistrictArray = [];
        // Iterate through the data array
        arrobj.forEach(item => {
            const { STATE_NAME, DISTRICT, Postal_Code } = item;
            // Find if the state already exists in the result array
            const existingStateIndex = stateDistrictArray.findIndex(state => state[STATE_NAME]);

            // If the state exists, push the district to its array of districts
            if (existingStateIndex !== -1) {
                stateDistrictArray[existingStateIndex][STATE_NAME].push(DISTRICT);
            } else {
                // If the state doesn't exist, create a new object and push it to the result array
                const stateObj = { [STATE_NAME]: [DISTRICT] };
                stateDistrictArray.push(stateObj);
            }
        });

        console.log("stateDistrictArray-------------------->", stateDistrictArray);

        let stateArr = [];
        for (let i = 0; i < arrobj.length; i++) {
            stateArr.push(arrobj[i].STATE_NAME);
        }
        const uniqueStates = [...new Set(stateArr)];
        let temp = "";
        let temp1 = ""
        // console.log("uniqueStates-------->", uniqueStates)
        // let temp = "Below are the district list \n\n";


        let a;
        for (let i = 0; i < uniqueStates.length; i++) {
            // console.log("inside uniqueStates for loop");
            if (type == (i + 1)) {
                // console.log("iside the if")
                a = uniqueStates[i];
                break;
            }
        }
        // console.log("a1111111111111----------------------->", a);
        const stateEntry = arrobj.filter(entry => entry.STATE_NAME == a);

        // Extract district and postal code for each entry in Maharashtra
        const arrdist_post = stateEntry.map(entry => ({
            District: entry.DISTRICT,
            Postal_Code: entry.Postal_Code
        }));
        console.log("arrdist_post--------------->", arrdist_post);

        for (let j = 0; j < stateDistrictArray.length; j++) {
            temp1 = `Below are the ${arrdist_post[0].District} district postal code list \n\n`

            if (stateDistrictArray[j][`${a}`] != undefined) {
                for (let i = 0; i < arrdist_post.length; i++) {
                    temp += `Type postal code 👉 ${arrdist_post[i].Postal_Code}\n`;
                }
            }
        }
        if (result.data != 0) {
            return res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: temp1 + temp
            });
        } else {
            return res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: "No address list found here"
            });
        }

    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: err
        });
    }


});

router.post('/getdistAddress/:mobileno/:address', async (req, res) => {
    try {
        let mobileNo = req.params.mobileno;
        let type = req.params.address
        console.log({ mobileNo, type });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }
        let data = JSON.stringify({
            "Address_Type": "01"
        });
        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/FetchAddress`,

            headers: {
                'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
            },
            data: data
        };
        let temp = "Below are the address \n\n";
        let result = await axios(config1);
        let arrobj = result.data.RECORD;
        let Address1 = "";
        console.log("arrobj------------> ", arrobj)

        // function getAddressByPostalCode(postalCode) {
        // const foundAddress = arrobj.find(item => item.Postal_Code === type);

        for (let i = 0; i < arrobj.length; i++) {
            if (arrobj[i].Postal_Code == type) {
                console.log(arrobj[i].Address1 + arrobj[i].Address2)
                temp = arrobj[i].Address1 + arrobj[i].Address2
            }
        }

        // console.log("foundAddress----------------->", foundAddress)
        // if (foundAddress) {

        //     Address1 = foundAddress.Address1 + foundAddress.Address2

        // } else {
        //     return "Postal code not found!";
        // }
        // }

        // // Example usage:
        // const postalCode = 411014; // Change this to the postal code you want to search for
        // const address = getAddressByPostalCode(postalCode);
        // if (typeof address === 'string') {
        //     console.log(address);
        // } else {
        //     console.log("Address 1:", address.Address1);
        //     console.log("Address 2:", address.Address2);
        // }

        // const stateDistrictArray = [];
        // // Iterate through the data array
        // arrobj.forEach(item => {
        //     const { STATE_NAME, DISTRICT, Postal_Code } = item;
        //     // Find if the state already exists in the result array
        //     const existingStateIndex = stateDistrictArray.findIndex(state => state[STATE_NAME]);

        //     // If the state exists, push the district to its array of districts
        //     if (existingStateIndex !== -1) {
        //         stateDistrictArray[existingStateIndex][STATE_NAME].push(DISTRICT);
        //     } else {
        //         // If the state doesn't exist, create a new object and push it to the result array
        //         const stateObj = { [STATE_NAME]: [DISTRICT] };
        //         stateDistrictArray.push(stateObj);
        //     }
        // });

        // console.log("stateDistrictArray-------------------->", stateDistrictArray);

        // let stateArr = [];
        // for (let i = 0; i < arrobj.length; i++) {
        //     stateArr.push(arrobj[i].STATE_NAME);
        // }
        // const uniqueStates = [...new Set(stateArr)];

        // // console.log("uniqueStates-------->", uniqueStates)



        // let a;
        // for (let i = 0; i < uniqueStates.length; i++) {
        //     // console.log("inside uniqueStates for loop");
        //     if (type == (i + 1)) {
        //         // console.log("iside the if")
        //         a = uniqueStates[i];
        //         break;
        //     }
        // }
        // // console.log("a1111111111111----------------------->", a);
        // const stateEntry = arrobj.filter(entry => entry.STATE_NAME == a);

        // // Extract district and postal code for each entry in Maharashtra
        // const arrdist_post = stateEntry.map(entry => ({
        //     District: entry.DISTRICT,
        //     Postal_Code: entry.Postal_Code
        // }));
        // console.log("arrdist_post--------------->", arrdist_post);

        // for (let j = 0; j < stateDistrictArray.length; j++) {

        //     if (stateDistrictArray[j][`${a}`] != undefined) {
        //         for (let i = 0; i < arrdist_post.length; i++) {
        //             temp += `Type ${i + 1} 👉 ${arrdist_post[i].District} postal code ${arrdist_post[i].Postal_Code}\n`;
        //         }
        //     }
        // }
        if (result.data != 0) {
            return res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: temp
            });
        } else {
            return res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: "No address list found here"
            });
        }

    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: err
        });
    }


});

/**
router.post('/getstates/:mobileno/:getstate', async (req, res) => {
    try {
        let mobileNo = req.params.mobileno;
        let type = req.params.getstate
        console.log({ mobileNo });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }

        // var data1 = '';

        let data = JSON.stringify({
            "Address_Type": "01"
        });

        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/FetchAddress`,

            headers: {
                'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
            },
            data: data
        };

        let result = await axios(config1);
        let arrobj = result.data.RECORD

        const stateDistrictArray = [];

        // Iterate through the data array
        arrobj.forEach(item => {
            const { STATE_NAME, DISTRICT } = item;
            // Find if the state already exists in the result array
            const existingStateIndex = stateDistrictArray.findIndex(state => state[STATE_NAME]);
            // If the state exists, push the district to its array of districts
            if (existingStateIndex !== -1) {
                stateDistrictArray[existingStateIndex][STATE_NAME].push(DISTRICT);
            } else {
                // If the state doesn't exist, create a new object and push it to the result array
                const stateObj = { [STATE_NAME]: [DISTRICT] };
                stateDistrictArray.push(stateObj);
            }
        });

        // console.log("stateDistrictArray-------------------->", stateDistrictArray);

        let stateArr = [];

        for (let i = 0; i < arrobj.length; i++) {
            // console.log("i---------->", i, arrobj[i].STATE_NAME, "-----DISTRICT------------", arrobj[i].DISTRICT)
            stateArr.push(arrobj[i].STATE_NAME)
        }
        // console.log(stateArr)
        const uniqueStates = [...new Set(stateArr)];

        // console.log("uniqueStates-------->", uniqueStates)
        let temp = "Below are the district list \n\n";

        let a;
        for (let i = 0; i < uniqueStates.length; i++) {
            // console.log("inside uniqueStates for loop");
            if (type == (i + 1)) {
                // console.log("iside the if")
                // console.log("uniqueStates[i]:", uniqueStates[i], (i + 1))
                a = uniqueStates[i];
                break;
            }
            console.log("a------------------------>", a)
        }
        // console.log("a1111111111111----------------------->", a)
        let uniqueDistrict;
        let uniqueDistrictArr = [];
        for (let j = 0; j < stateDistrictArray.length; j++) {

            // console.log("stateDistrictArray[i][j].STATE_NAME) -------------------->", stateDistrictArray[j][`${a}`])
            uniqueDistrict = stateDistrictArray[j][`${a}`]
            uniqueDistrictArr = [...new Set(uniqueDistrict)];

            if (stateDistrictArray[j][`${a}`] != undefined) {
                for (let i = 0; i < uniqueDistrictArr.length; i++) {

                    temp += `Type ${i + 1} 👉   ${uniqueDistrictArr[i]} \n`;
                }
            }
        }
        if (result.data != 0) {
            return res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: temp
            });
        } else {
            return res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: "No address list found here"
            });
        }

    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: err
        });
    }


}); 
 */



//Complaint status 

// router.post('/complaintStatus/:mobileno', async (req, res) => {

//     let mobileNo = req.params.mobileno;
//     console.log({ mobileNo });

//     if (mobileNo.startsWith('91')) {
//         mobileNo = mobileNo.substring('2');
//     }

//     // let complaintType = req.params.typeOfComplain;
//     // console.log({ complaintType });

//     // let complaintTypeCode = [443, 172, 157, 262];

//     // if (typeOfComplain === "1") {
//     //     complaintType = complaintTypeCode[0];
//     // } else if (typeOfComplain === "2") {
//     //     complaintType = complaintTypeCode[1];
//     // } else if (typeOfComplain == "3") {
//     //     complaintType = complaintTypeCode[2];
//     // } else {
//     //     complaintType = complaintTypeCode[3];
//     // }

//     var data = '';

//     var config1 = {
//         method: 'post',
//         url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/getServiceNo?MobileNo=${mobileNo}`,
//         headers: {
//             'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
//             'Cookie': 'saplb_*=(J2EE207654120)207654151'
//         },
//         data: data
//     };

//     let response1 = await axios(config1);
//     // console.log("result===>>" + JSON.stringify(response1.data.serviceNo));

//     let customer_id = JSON.stringify(response1.data.serviceNo);
//     console.log({ customer_id });


//     var data = new FormData();
//     data.append('customer_id', `${customer_id}`);

//     var config = {
//         method: 'post',
//         url: 'https://www.torrentgas.com/frontend/web/index.php/wapp/complaint-history',
//         headers: {
//             'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
//             ...data.getHeaders()
//         },
//         data: data
//     };

//     let response = await axios(config);
//     try {
//         console.log(response.data);
//         res.send({
//             code: '200',
//             status: 'SUCCESS',
//             type: 'text',
//             data: response.data
//         });

//     } catch (error) {
//         console.log(error);
//     }

// });



// router.post('/getServiceNo/:mobileNo', async (req, res) => {
//     let mobileNo = req.params.mobileNo;
//     console.log({ mobileNo });

//     if (mobileNo.startsWith("91")) {
//         mobileNo = mobileNo.substring(2);
//     }

//     var data = '';

//     var config = {
//         method: 'post',
//         url: `https://uatcloudwebservices.torrentgas.com:8024/RESTAdapter/getServiceNo?MobileNo=${mobileNo}`,
//         headers: {
//             'Authorization': 'Basic UFdTVVNSOlBXNSRBUCFfVDBSR0E1',
//             'Cookie': 'saplb_*=(J2EE207654120)207654151'
//         },
//         data: data
//     };

//     await axios(config)
//         .then(function (response) {
//             let serviceNumber = JSON.parse(response.data.serviceNo);
//             console.log({ serviceNumber });
//             res.send({
//                 code: '200',
//                 status: 'SUCCESS',
//                 type: 'text',
//                 data: serviceNumber
//             });
//         })
//         .catch(function (error) {
//             console.log({ error });
//         });
// });



let getMediaUrl = async (MobileNo, mediaId) => {
    let query = 'SELECT mediaurl FROM ezb_flowbuilder_attributes WHERE session_mobile = ? AND mediaid = ?';
    let values = [MobileNo, mediaId];
    let [result] = await pool.query(query, values);
    return result;
};


let getServcieNo = async (serviceNo, tempMobileNo) => {
    let ServiceNo1 = null;
    let query = "SELECT JSON_EXTRACT(serviceno,?) AS service_no FROM png where mobileno=?";
    let values = ['$[' + (serviceNo - 1) + ']', tempMobileNo];

    console.log("values---------------------------", values, '$[' + (serviceNo - 1) + ']', tempMobileNo)
    let result = await dbpool.query(query, values);

    console.log("result _____________________>", result)
    return result;
};

let getSingleServcieNo = async (MobileNo) => {
    let ServiceNo1 = null;
    let query = "SELECT JSON_EXTRACT(serviceno,?) AS service_no FROM png where mobileno=?";
    let values = ['$[0]', MobileNo];
    let result = await dbpool.query(query, values);
    // console.log("=====>>>" + JSON.stringify(result[0][0]));
    return result;
};


module.exports = router;

