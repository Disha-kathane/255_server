const express = require('express');
const router = express.Router();
let async = require('async');
let axios = require('axios');
const mysql = require('mysql');
let FormData = require('form-data');
let fs = require('fs');
const http = require('https');

let db_config = {
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'ezeebot',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};

let dbpool = mysql.createConnection(db_config);

let db_config_1 = {
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'pmcdb',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};

let dbpool_1 = mysql.createConnection(db_config_1);

// router.post('/getPMCWard/:circleName', (req, res) => {
//     let circleName = req.params.circleName.toString().toLowerCase();

//     let data = JSON.stringify({});

//     let config = {
//         method: 'post',
//         url: 'http://api.patnaswm.in/api/Vendor/VehicleGpsData',
//         headers: {
//             'Authorization': 'Basic cGF0bmE6cGF0bmEjMjAyMA==',
//             'Content-Type': 'application/json'
//         },
//         data: data
//     };

//     axios(config)
//         .then(function (response) {
//             let tempResult = 'Please select ward for ' + req.params.circleName + ' circle\n';
//             let tempWardArray = [];
//             console.log(JSON.stringify(response.data.Table));
//             for (let i = 0; i < response.data.Table.length; i++) {
//                 if (circleName == response.data.Table[i].CircleName.toString().toLowerCase()) {
//                     tempWardArray.push(response.data.Table[i].WardNo);
//                 }
//             }

//             let newWardArray = tempWardArray.filter((value, index, self) => self.indexOf(value) === index);

//             for (let i = 0; i < newWardArray.length; i++) {
//                 tempResult += '\nType *' + newWardArray[i] + '* for Ward No.' + newWardArray[i];
//             }

//             res.send({
//                 code: 200,
//                 status: 'success',
//                 type: 'text',
//                 data: tempResult
//             });
//         })
//         .catch(function (error) {
//             console.log(error);
//             res.send({
//                 code: 100,
//                 status: 'failed',
//                 data: 'Something went wrong'
//             });
//         });
// });

// router.post('/getDriverDetails/:circleName/:wardNo', (req, res) => {
//     let circleName = req.params.circleName.toString().toLowerCase();
//     let wardNo = req.params.wardNo.toString().toLowerCase();

//     let data = JSON.stringify({});

//     let config = {
//         method: 'post',
//         url: 'http://api.patnaswm.in/api/Vendor/VehicleGpsData',
//         headers: {
//             'Authorization': 'Basic cGF0bmE6cGF0bmEjMjAyMA==',
//             'Content-Type': 'application/json'
//         },
//         data: data
//     };

//     axios(config)
//         .then(function (response) {
//             let tempResult = 'Please find the vehicle details for your Ward No.' + req.params.wardNo + ' in ' + req.params.circleName + ' circle\n';
//             console.log(JSON.stringify(response.data.Table));
//             for (let i = 0; i < response.data.Table.length; i++) {
//                 if (circleName == response.data.Table[i].CircleName.toString().toLowerCase()
//                     && wardNo == response.data.Table[i].WardNo.toString().toLowerCase()) {
//                     tempResult += '\nVehicle No : ' + response.data.Table[i].VehicleNo;
//                     // tempResult += '\nVehicle Type : ' + response.data.Table[i].VehicleType;
//                     // tempResult += '\nIgnition : ' + response.data.Table[i].Ignition;
//                     tempResult += '\nLocation : https://www.google.com/maps/place/' + response.data.Table[i].Lat + ',' + response.data.Table[i].Lng;
//                     tempResult += '\n\n';
//                 }
//             }

//             res.send({
//                 code: 200,
//                 status: 'success',
//                 type: 'text',
//                 data: tempResult
//             });
//         })
//         .catch(function (error) {
//             console.log(error);
//             res.send({
//                 code: 100,
//                 status: 'failed',
//                 data: 'Something went wrong'
//             });
//         });
// });

//https://whatsappdata.s3.amazonaws.com/700131838272998_IMG.jpeg
router.post('/addComplaint/:wanumber/:mobileno/:complaint_text/:categoryid/:mediaid/:location', async (req, res) => {
    console.log(req.params);
    let wanumber = req.params.wanumber;
    let mobileno = req.params.mobileno;
    let complaint_text = req.params.complaint_text;
    let categoryid = req.params.categoryid;
    let mediaid = req.params.mediaid;
    let location = req.params.location;
    let tmplocation = location.split('loc:');
    tmplocation = tmplocation[1].split(',');
    let latitude = tmplocation[0];
    let longitude = tmplocation[1];

    console.log({ complaint_text });
    console.log({ categoryid });
    console.log({ latitude });
    console.log({ longitude });
    console.log({ mobileno });

    let query = "SELECT mediaurl FROM ezb_flowbuilder_attributes WHERE session_mobile = ? AND mediaid = ?";
    let values = [wanumber, mediaid];
    let s = dbpool.query(query, values, (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: 'failed',
                data: 'Something went wrong'
            });
        } else {
            let tmpFileName = /[^/]*$/.exec(result[0].mediaurl)[0];
            console.log(tmpFileName);
            let tmpFilePath = './public/images/' + tmpFileName;
            console.log(tmpFilePath);
            const file = fs.createWriteStream(tmpFilePath);

            const request = http.get(result[0].mediaurl, function (response) {
                response.pipe(file);

                // after download completed close filestream
                file.on("finish", () => {
                    file.close();
                    console.log("Download Completed");

                    let data = new FormData();
                    // data.append('Input', '{"Complaint": ' + complaint_text + ',"CategoryId": ' + categoryid + ',"Lat": ' + latitude + ',"Lng": ' + longitude + ',"ContactNo": ' + mobileno + ',"UHouseId": ""}');
                    data.append('Input', '{  "Complaint": "' + complaint_text + '",  "CategoryId": ' + categoryid + ',  "Lat": ' + latitude + ',  "Lng": ' + longitude + ',  "ContactNo": ' + mobileno + ',  "UHouseId": ""}');
                    data.append('image', fs.createReadStream(tmpFilePath));

                    let config = {
                        method: 'post',
                        url: 'http://api.patnaswm.in/api/Citizen/AddComplaint',
                        headers: {
                            'Authorization': 'Basic cGF0bmE6cGF0bmEjMjAyMA==',
                            ...data.getHeaders()
                        },
                        data: data
                    };

                    axios(config)
                        .then(function (response) {
                            console.log(JSON.stringify(response.data));
                            res.send({
                                code: 200,
                                status: 'success',
                                type: 'text',
                                data: response.data.Msg
                            });
                        })
                        .catch(function (error) {
                            console.log(error);
                            res.send({
                                code: 100,
                                status: 'failed',
                                data: 'Something went wrong'
                            });
                        });
                });
            });
        }
    });
});

router.post('/addComplaint_1/:wanumber/:mobileno/:complaint_text/:categoryid/:mediaid/*', async (req, res) => {
    console.log(req.params);
    let wanumber = req.params.wanumber;
    let mobileno = req.params.mobileno;
    let complaint_text = req.params.complaint_text;
    let categoryid = req.params.categoryid;
    let mediaid = req.params.mediaid;
    let location = req.params['0'];
    console.log({ location });
    let tmplocation = location.split('www.google.com/maps/place/');
    tmplocation = tmplocation[1].split(',');
    let latitude = tmplocation[0];
    let longitude = tmplocation[1];

    console.log({ complaint_text });
    console.log({ categoryid });
    console.log({ latitude });
    console.log({ longitude });
    console.log({ mobileno });

    let query = "SELECT mediaurl FROM ezb_flowbuilder_attributes WHERE session_mobile = ? AND mediaid = ?";
    let values = [wanumber, mediaid];
    let s = dbpool.query(query, values, (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: 'failed',
                data: 'Something went wrong'
            });
        } else {
            let tmpFileName = /[^/]*$/.exec(result[0].mediaurl)[0];
            console.log(tmpFileName);
            let tmpFilePath = mediaid != 0 ? './public/images/' + tmpFileName : './public/images/patna_default.jpeg';
            console.log(tmpFilePath);
            const file = fs.createWriteStream(tmpFilePath);

            const request = http.get(result[0].mediaurl, function (response) {
                response.pipe(file);

                // after download completed close filestream
                file.on("finish", () => {
                    file.close();
                    console.log("Download Completed");

                    let data = new FormData();
                    // data.append('Input', '{"Complaint": ' + complaint_text + ',"CategoryId": ' + categoryid + ',"Lat": ' + latitude + ',"Lng": ' + longitude + ',"ContactNo": ' + mobileno + ',"UHouseId": ""}');
                    data.append('Input', '{  "Complaint": "' + complaint_text + '",  "CategoryId": ' + categoryid + ',  "Lat": ' + latitude + ',  "Lng": ' + longitude + ',  "ContactNo": ' + mobileno + ',  "UHouseId": "' + new Date().getTime() + '"}');
                    data.append('image', fs.createReadStream(tmpFilePath));

                    let config = {
                        method: 'post',
                        url: 'http://api.patnaswm.in/api/Citizen/AddComplaint',
                        headers: {
                            'Authorization': 'Basic cGF0bmE6cGF0bmEjMjAyMA==',
                            ...data.getHeaders()
                        },
                        data: data
                    };

                    axios(config)
                        .then(function (response) {
                            console.log(JSON.stringify(response.data));
                            res.send({
                                code: 200,
                                status: 'success',
                                type: 'text',
                                data: response.data.Msg
                            });
                        })
                        .catch(function (error) {
                            console.log(error);
                            res.send({
                                code: 100,
                                status: 'failed',
                                data: 'Something went wrong'
                            });
                        });
                });
            });
        }
    });
});

// router.post('/addComplaint_2/:circleName/:wardId/:wanumber/:mobileno/:complaint_text/:categoryid/:mediaid/*', async (req, res) => {
//     let circleData = [
//         {
//             "circleName": "PATLIPUTRA", "circleId": "1"
//         },
//         {
//             "circleName": "NCC", "circleId": "2"
//         },
//         {
//             "circleName": "KANKARBAGH", "circleId": "3"
//         },
//         {
//             "circleName": "BANKIPUR", "circleId": "4"
//         },
//         {
//             "circleName": "AZIMABAD", "circleId": "5"
//         },
//         {
//             "circleName": "PATNA CITY", "circleId": "6"
//         },
//         {
//             "circleName": "RAMCHAK-BAIRIA", "circleId": "7"
//         },
//         {
//             "circleName": "HO", "circleId": "8"
//         },
//         {
//             "circleName": "ELECTRIC DIVISION", "circleId": "10"
//         },
//         {
//             "circleName": "OTHERS", "circleId": "12"
//         }
//     ];
//     console.log(req.params);
//     let circleName = req.params.circleName;
//     let wardId = req.params.wardId;
//     let wanumber = req.params.wanumber;
//     let mobileno = req.params.mobileno;
//     let complaint_text = req.params.complaint_text;
//     let categoryid = req.params.categoryid;
//     let mediaid = req.params.mediaid;
//     let location = req.params['0'];
//     console.log({ location });
//     let tmplocation = location.split('www.google.com/maps/place/');
//     tmplocation = tmplocation[1].split(',');
//     let latitude = tmplocation[0];
//     let longitude = tmplocation[1];

//     console.log({ complaint_text });
//     console.log({ categoryid });
//     console.log({ latitude });
//     console.log({ longitude });
//     console.log({ mobileno });

//     let circleId = 0;

//     for (let j = 0; j < circleData.length; j++) {
//         if (circleData[j].circleName.toString().toLowerCase() == circleName.toString().toLowerCase()) {
//             circleId = circleData[j].circleId;
//         }
//     }
//     console.log({ circleId });

//     let query = "SELECT mediaurl FROM ezb_flowbuilder_attributes WHERE session_mobile = ? AND mediaid = ?";
//     let values = [wanumber, mediaid];
//     let s = dbpool.query(query, values, (err, result) => {
//         if (err) {
//             res.send({
//                 code: 100,
//                 status: 'failed',
//                 data: 'Something went wrong'
//             });
//         } else {
//             let tmpFileName = mediaid != 0 ? /[^/]*$/.exec(result[0].mediaurl)[0] : null;
//             console.log(tmpFileName);
//             let tmpFilePath = mediaid != 0 ? './public/images/' + tmpFileName : './public/images/patna_default.jpeg';
//             console.log(tmpFilePath);
//             const file = fs.createWriteStream(tmpFilePath);

//             if (mediaid != 0) {
//                 const request = http.get(result[0].mediaurl, function (response) {
//                     response.pipe(file);

//                     // after download completed close filestream
//                     file.on("finish", () => {
//                         file.close();
//                         console.log("Download Completed");

//                         let data = new FormData();
//                         // data.append('Input', '{"Complaint": ' + complaint_text + ',"CategoryId": ' + categoryid + ',"Lat": ' + latitude + ',"Lng": ' + longitude + ',"ContactNo": ' + mobileno + ',"UHouseId": ""}');
//                         data.append('Input', '{"Name":"","ContactNo":"' + mobileno + '","CCategoryId":"' + categoryid + '","CircleId":"' + circleId + '","WardId":"' + wardId + '","Address":"","Landmark":"","Description":"' + complaint_text + '","ComplaintSource":"Chatbot","CreatedBy":"swachh_user","Lat":"' + latitude + '","Lng":"' + longitude + '"}');
//                         data.append('image', fs.createReadStream(tmpFilePath));

//                         let config = {
//                             method: 'post',
//                             url: 'http://api.patnaswm.in/api/OComplaint/AddNewOComplaint',
//                             headers: {
//                                 'Authorization': 'Basic cGF0bmE6cGF0bmEjMjAyMA==',
//                                 ...data.getHeaders()
//                             },
//                             data: data
//                         };

//                         axios(config)
//                             .then(function (response) {
//                                 console.log(JSON.stringify(response.data));
//                                 res.send({
//                                     code: 200,
//                                     status: 'success',
//                                     type: 'text',
//                                     data: response.data.Msg
//                                 });
//                             })
//                             .catch(function (error) {
//                                 console.log(error);
//                                 res.send({
//                                     code: 100,
//                                     status: 'failed',
//                                     data: 'Something went wrong'
//                                 });
//                             });
//                     });
//                 });
//             }
//             else {
//                 let data = new FormData();
//                 // data.append('Input', '{"Complaint": ' + complaint_text + ',"CategoryId": ' + categoryid + ',"Lat": ' + latitude + ',"Lng": ' + longitude + ',"ContactNo": ' + mobileno + ',"UHouseId": ""}');
//                 data.append('Input', '{"Name":"","ContactNo":"' + mobileno + '","CCategoryId":"' + categoryid + '","CircleId":"' + circleId + '","WardId":"' + wardId + '","Address":"","Landmark":"","Description":"' + complaint_text + '","ComplaintSource":"Chatbot","CreatedBy":"swachh_user","Lat":"' + latitude + '","Lng":"' + longitude + '"}');
//                 data.append('image', fs.createReadStream(tmpFilePath));

//                 let config = {
//                     method: 'post',
//                     url: 'http://api.patnaswm.in/api/OComplaint/AddNewOComplaint',
//                     headers: {
//                         'Authorization': 'Basic cGF0bmE6cGF0bmEjMjAyMA==',
//                         ...data.getHeaders()
//                     },
//                     data: data
//                 };

//                 axios(config)
//                     .then(function (response) {
//                         console.log(JSON.stringify(response.data));
//                         res.send({
//                             code: 200,
//                             status: 'success',
//                             type: 'text',
//                             data: response.data.Msg
//                         });
//                     })
//                     .catch(function (error) {
//                         console.log(error);
//                         res.send({
//                             code: 100,
//                             status: 'failed',
//                             data: 'Something went wrong'
//                         });
//                     });
//             }
//         }
//     });
// });

router.post('/addComplaint_2/:circleName/:wardId/:wanumber/:mobileno/:complaint_text/:categoryid/:mediaid/*', async (req, res) => {
    let circleData = [
        {
            "circleName": "PATLIPUTRA", "circleId": "1"
        },
        {
            "circleName": "NCC", "circleId": "2"
        },
        {
            "circleName": "KANKARBAGH", "circleId": "3"
        },
        {
            "circleName": "BANKIPUR", "circleId": "4"
        },
        {
            "circleName": "AZIMABAD", "circleId": "5"
        },
        {
            "circleName": "PATNA CITY", "circleId": "6"
        },
        {
            "circleName": "RAMCHAK-BAIRIA", "circleId": "7"
        },
        {
            "circleName": "HO", "circleId": "8"
        },
        {
            "circleName": "ELECTRIC DIVISION", "circleId": "10"
        },
        {
            "circleName": "OTHERS", "circleId": "12"
        }
    ];

    let categoryData = [
        {
            "categoryTitle": "Garbage dump", "categoryId": "3"
        },
        {
            "categoryTitle": "Garbage vehicle Issue", "categoryId": "4"
        },
        {
            "categoryTitle": "Sweeping not done", "categoryId": "5"
        },
        {
            "categoryTitle": "Street Light Not Working", "categoryId": "6"
        },
        {
            "categoryTitle": "Leakage in Water Supply", "categoryId": "7"
        },
        {
            "categoryTitle": "Open Manholes Or Drains", "categoryId": "10"
        },
        {
            "categoryTitle": "Water Overflow", "categoryId": "11"
        },
        {
            "categoryTitle": "Stagnant Water Issue", "categoryId": "12"
        },
        {
            "categoryTitle": "Debris Issue", "categoryId": "14"
        }
    ];

    console.log(req.params);
    let circleName = req.params.circleName;
    let wardId = req.params.wardId;
    let wanumber = req.params.wanumber;
    let mobileno = req.params.mobileno;
    let complaint_text = req.params.complaint_text;
    let categoryName = req.params.categoryid;
    let mediaid = req.params.mediaid;
    let location = req.params['0'];
    console.log({ location });
    let tmplocation = location.split('www.google.com/maps/place/');
    tmplocation = tmplocation[1].split(',');
    let latitude = tmplocation[0];
    let longitude = tmplocation[1];

    console.log({ complaint_text });
    console.log({ latitude });
    console.log({ longitude });
    console.log({ mobileno });

    let circleId = 0;

    for (let j = 0; j < circleData.length; j++) {
        if (circleData[j].circleName.toString().toLowerCase() == circleName.toString().toLowerCase()) {
            circleId = circleData[j].circleId;
        }
    }
    console.log({ circleId });

    let categoryid = 0;
    for (let k = 0; k < categoryData.length; k++) {
        if (categoryData[k].categoryTitle.toString().toLowerCase() == categoryName.toString().toLowerCase()) {
            categoryid = categoryData[k].categoryId;
        }
    }
    console.log({ categoryid });

    let query = "SELECT mediaurl FROM ezb_flowbuilder_attributes WHERE session_mobile = ? AND mediaid = ?";
    let values = [wanumber, mediaid];
    let s = dbpool.query(query, values, (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: 'failed',
                data: 'Something went wrong'
            });
        } else {
            let tmpFileName = result[0] != undefined && mediaid != 0 ? /[^/]*$/.exec(result[0].mediaurl)[0] : null;
            console.log(tmpFileName);
            let tmpFilePath = mediaid != 0 ? './public/images/' + tmpFileName : './public/images/patna_default.jpeg';
            console.log(tmpFilePath);
            const file = fs.createWriteStream(tmpFilePath);

            if (mediaid != 0) {
                const request = http.get(result[0].mediaurl, function (response) {
                    response.pipe(file);

                    // after download completed close filestream
                    file.on("finish", () => {
                        file.close();
                        console.log("Download Completed");

                        let data = new FormData();
                        // data.append('Input', '{"Complaint": ' + complaint_text + ',"CategoryId": ' + categoryid + ',"Lat": ' + latitude + ',"Lng": ' + longitude + ',"ContactNo": ' + mobileno + ',"UHouseId": ""}');
                        data.append('Input', '{"Name":"","ContactNo":"' + mobileno + '","CCategoryId":"' + categoryid + '","CircleId":"' + circleId + '","WardId":"' + wardId + '","Address":"","Landmark":"","Description":"' + complaint_text + '","ComplaintSource":"Chatbot","CreatedBy":"swachh_user","Lat":"' + latitude + '","Lng":"' + longitude + '"}');
                        data.append('Image1', fs.createReadStream(tmpFilePath));

                        let config = {
                            method: 'post',
                            url: 'http://api.patnaswm.in/api/OComplaint/AddNewOComplaint',
                            headers: {
                                'Authorization': 'Basic cGF0bmE6cGF0bmEjMjAyMA==',
                                ...data.getHeaders()
                            },
                            data: data
                        };

                        axios(config)
                            .then(function (response) {
                                console.log(JSON.stringify(response.data));
                                res.send({
                                    code: 200,
                                    status: 'success',
                                    type: 'text',
                                    data: response.data.Msg
                                });
                            })
                            .catch(function (error) {
                                console.log(error);
                                res.send({
                                    code: 100,
                                    status: 'failed',
                                    data: 'Something went wrong'
                                });
                            });
                    });
                });
            }
            else {
                let data = new FormData();
                // data.append('Input', '{"Complaint": ' + complaint_text + ',"CategoryId": ' + categoryid + ',"Lat": ' + latitude + ',"Lng": ' + longitude + ',"ContactNo": ' + mobileno + ',"UHouseId": ""}');
                data.append('Input', '{"Name":"","ContactNo":"' + mobileno + '","CCategoryId":"' + categoryid + '","CircleId":"' + circleId + '","WardId":"' + wardId + '","Address":"","Landmark":"","Description":"' + complaint_text + '","ComplaintSource":"Chatbot","CreatedBy":"swachh_user","Lat":"' + latitude + '","Lng":"' + longitude + '"}');
                data.append('Image1', fs.createReadStream(tmpFilePath));

                let config = {
                    method: 'post',
                    url: 'http://api.patnaswm.in/api/OComplaint/AddNewOComplaint',
                    headers: {
                        'Authorization': 'Basic cGF0bmE6cGF0bmEjMjAyMA==',
                        ...data.getHeaders()
                    },
                    data: data
                };

                axios(config)
                    .then(function (response) {
                        console.log(JSON.stringify(response.data));
                        res.send({
                            code: 200,
                            status: 'success',
                            type: 'text',
                            data: response.data.Msg
                        });
                    })
                    .catch(function (error) {
                        console.log(error);
                        res.send({
                            code: 100,
                            status: 'failed',
                            data: 'Something went wrong'
                        });
                    });
            }
        }
    });
});

router.post('/getPMCWard/:circleName/:language', (req, res) => {
    let circleName = req.params.circleName;
    let language = req.params.language;

    let query = "SELECT wardno FROM pmcdb.tbl_pmc_master WHERE LOWER(circlename) = LOWER(?) AND language = ?";
    let values = [circleName, language];
    let s = dbpool_1.query(query, values, (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: 'failed',
                data: 'Something went wrong'
            });
        } else {
            console.log({ result });
            if (language == 0) {
                let tempResult = 'Please select ward for ' + req.params.circleName + ' circle\n';
                for (let i = 0; i < result.length; i++) {
                    tempResult += '\nType *' + result[i].wardno + '* for Ward No.' + result[i].wardno;
                }

                res.send({
                    code: 200,
                    status: 'success',
                    type: 'text',
                    data: tempResult
                });
            } else {
                let tempResult = 'कृपया ' + req.params.circleName + ' सर्कल के लिए वार्ड का चयन करें\n';
                for (let i = 0; i < result.length; i++) {
                    tempResult += '\nवार्ड नंबर *' + result[i].wardno + '* के लिए ' + result[i].wardno + ' टाइप करें';
                }

                res.send({
                    code: 200,
                    status: 'success',
                    type: 'text',
                    data: tempResult
                });
            }
        }
    });
});

router.post('/getDriverDetails_Eng/:circleName/:wardNo/:mobileno', (req, res) => {
    let circleName = req.params.circleName;
    let wardNo = req.params.wardNo;
    let mobileno = req.params.mobileno;

    let siName = null;
    let siContactNo = null;

    let circleData = [
        {
            "circleName": "PATLIPUTRA", "circleId": "1"
        },
        {
            "circleName": "NCC", "circleId": "2"
        },
        {
            "circleName": "KANKARBAGH", "circleId": "3"
        },
        {
            "circleName": "BANKIPUR", "circleId": "4"
        },
        {
            "circleName": "AZIMABAD", "circleId": "5"
        },
        {
            "circleName": "PATNA CITY", "circleId": "6"
        },
        {
            "circleName": "RAMCHAK-BAIRIA", "circleId": "7"
        },
        {
            "circleName": "HO", "circleId": "8"
        },
        {
            "circleName": "ELECTRIC DIVISION", "circleId": "10"
        },
        {
            "circleName": "OTHERS", "circleId": "12"
        }
    ];

    let circleId = 0;

    for (let j = 0; j < circleData.length; j++) {
        if (circleData[j].circleName.toString().toLowerCase() == circleName.toString().toLowerCase()) {
            circleId = circleData[j].circleId;
        }
    }
    console.log({ circleId });

    let query = "SELECT siname, sino FROM pmcdb.tbl_pmc_master WHERE wardno = ? AND language = ?";
    let values = [wardNo, 0];
    let s = dbpool_1.query(query, values, (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: 'failed',
                data: 'Something went wrong'
            });
        } else {
            console.log({ result });
            var data = JSON.stringify({
                "from": "919264447449",
                "to": mobileno,
                "type": "template",
                "message": {
                    "templateid": "43613",
                    "placeholders": [
                        wardNo,
                        circleName,
                        result[0].siname,
                        result[0].sino
                    ],
                    "buttons": [
                        {
                            "index": 0,
                            "type": "visit_website",
                            "placeholder": "map?c=" + circleId + "&w=" + wardNo
                        }
                    ]
                }
            });

            var config = {
                method: 'post',
                url: 'https://api.pinbot.ai/v1/wamessage/send',
                headers: {
                    'apikey': '6a7bb36b-987a-11ed-a7c7-9606c7e32d76',
                    'Content-Type': 'application/json'
                },
                data: data
            };

            axios(config)
                .then(function (response) {
                    res.send({
                        code: 200,
                        status: 'success',
                        type: 'text',
                        data: ''
                    });
                })
                .catch(function (error) {
                    res.send({
                        code: 100,
                        status: 'failed',
                        data: 'Something went wrong'
                    });
                });
        }
    });
});

router.post('/getDriverDetails_Hin/:circleName/:wardNo/:mobileno', (req, res) => {
    let circleName = req.params.circleName;
    let wardNo = req.params.wardNo;
    let mobileno = req.params.mobileno;

    let siName = null;
    let siContactNo = null;

    let circleData = [
        {
            "circleName": "पाटलिपुत्र", "circleId": "1"
        },
        {
            "circleName": "नूतन राजधनी अंचल", "circleId": "2"
        },
        {
            "circleName": "कंकड़बाग", "circleId": "3"
        },
        {
            "circleName": "बाँकीपुर", "circleId": "4"
        },
        {
            "circleName": "अज़ीमाबाद", "circleId": "5"
        },
        {
            "circleName": "पटना सिटी", "circleId": "6"
        },
        {
            "circleName": "RAMCHAK-BAIRIA", "circleId": "7"
        },
        {
            "circleName": "HO", "circleId": "8"
        },
        {
            "circleName": "ELECTRIC DIVISION", "circleId": "10"
        },
        {
            "circleName": "OTHERS", "circleId": "12"
        }
    ];

    let circleId = 0;

    for (let j = 0; j < circleData.length; j++) {
        if (circleData[j].circleName.toString().toLowerCase() == circleName.toString().toLowerCase()) {
            circleId = circleData[j].circleId;
        }
    }
    console.log({ circleId });

    let query = "SELECT siname, sino FROM pmcdb.tbl_pmc_master WHERE wardno = ? AND language = ?";
    let values = [wardNo, 1];
    let s = dbpool_1.query(query, values, (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: 'failed',
                data: 'Something went wrong'
            });
        } else {
            console.log({ result });
            var data = JSON.stringify({
                "from": "919264447449",
                "to": mobileno,
                "type": "template",
                "message": {
                    "templateid": "43735",
                    "placeholders": [
                        circleName,
                        wardNo,
                        result[0].siname,
                        result[0].sino
                    ],
                    "buttons": [
                        {
                            "index": 0,
                            "type": "visit_website",
                            "placeholder": "map?c=" + circleId + "&w=" + wardNo
                        }
                    ]
                }
            });

            var config = {
                method: 'post',
                url: 'https://api.pinbot.ai/v1/wamessage/send',
                headers: {
                    'apikey': '6a7bb36b-987a-11ed-a7c7-9606c7e32d76',
                    'Content-Type': 'application/json'
                },
                data: data
            };

            axios(config)
                .then(function (response) {
                    res.send({
                        code: 200,
                        status: 'success',
                        type: 'text',
                        data: ''
                    });
                })
                .catch(function (error) {
                    res.send({
                        code: 100,
                        status: 'failed',
                        data: 'Something went wrong'
                    });
                });
        }
    });
});


router.post('/getmediaurl', (req, res) => {

    let wanumber = req.body.wanumber;
    let mediaid = req.body.mediaid;
    console.log({ wanumber, mediaid });

    let query = "SELECT mediaurl FROM ezb_flowbuilder_attributes WHERE session_mobile = ? AND mediaid = ?";
    let values = [wanumber, mediaid];
    let s = dbpool.query(query, values, (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: 'failed',
                data: 'Something went wrong'
            });
        } else {
            res.send({
                code: 200,
                status: 'success',
                type: 'text',
                data: result[0].mediaurl
            });
        }
    })

    // res.send(getmediaurl);
});

module.exports = router;
