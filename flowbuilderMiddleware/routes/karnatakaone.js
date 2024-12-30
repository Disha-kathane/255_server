let express = require('express');
let router = express.Router();
let axios = require('axios');

var mysql = require('mysql');

let db_config = {
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'edcsdb',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};

let dbpool = mysql.createPool(db_config);




// // ---------------------------------------------------------------------> WITH CHANGES 


// // Karnataka One External Payment ------------------------> ELECTRICITY BILL
// router.post('/ESCOM/GetBillDetails/:EscomType/:SearchValue/:wanumber', async (req, res) => {
//     let externalPaymentUrl = 'https://koneportal.cmsuat.co.in:1443/WhatsAppPayment/';
//     let escomType = req.params.EscomType;
//     console.log(escomType);
//     let searchValue = req.params.SearchValue;
//     console.log(searchValue);
//     let wanumber = req.params.wanumber;
//     console.log({ wanumber });
//     let data = JSON.stringify({
//         EscomType: escomType,
//         SearchValue: searchValue
//     });

//     var config = {
//         method: 'post',
//         url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/api/ESCOM/FetchBillDetails?EscomType=' + escomType + '&SearchValue=' + searchValue,
//         headers: {
//             'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
//         },
//         data: data
//     };

//     // console.log({ url });
//     let tempText = null;

//     axios(config)
//         .then(async function (response) {
//             // console.log({ response });
//             console.log(JSON.stringify(response.data));
//             let productRetailerid = response.data.data[0].AccountNumber;
//             let productName = response.data.data[0].SearchedType;
//             let productAmount = response.data.data[0].BillAmount;
//             let productQuantity = 1;
//             let productRequestId = response.data.data[0].RequestId;
//             let productImageUrl = response.data.data[0].ImageURL;

//             let reason = response.data.data[0].Reason;
//             console.log({ reason });
//             if (response.data.code === '100') {
//                 tempText = reason;
//                 let response1 = {
//                     code: '100',
//                     status: 'failed',
//                     type: 'text',
//                     data: tempText
//                 };
//                 res.json(response1);
//             } else {

//                 if (wanumber.length == 10) {
//                     wanumber = '91' + wanumber;
//                     console.log({ wanumber });
//                 }
//                 console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });

//                 let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid, mobileno) VALUES (?,?,?,?,?,?,?)';
//                 let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, wanumber];
//                 let s = dbpool.query(query, values, (err, result) => {
//                     if (err) {
//                         console.log(err);
//                     } else {
//                         console.log(result);
//                     }
//                 });

//                 tempText = 'Dear User,\nYour electricity bill of Rs.' + response.data.data[0].BillAmount + ' is generated.\n';
//                 // tempText += 'To pay it, click on below link \n\n';
//                 // tempText += externalPaymentUrl + response.data.data[0].RequestId + '/' + wanumber;
//                 let response1 = {
//                     code: '200',
//                     status: 'success',
//                     type: 'text',
//                     data: tempText
//                 };
//                 res.json(response1);
//             }
//         })
//         .catch(function (err) {

//             let errRes = {
//                 code: '100',
//                 status: 'Failed',
//                 data: 'Something went wrong'
//             };
//             res.json(errRes);
//             console.log(err);
//         });
// });

// // Electricity Bill Payment
// router.post('/ESCOM/FetchBillDetails/:wanumber', (req, res) => {


//     let wanumber = req.params.wanumber;

//     if (wanumber.length == 10) {
//         wanumber = '91' + wanumber;
//         console.log({ wanumber });
//     }


//     let query = 'SELECT * FROM edcsdb.tbl_edcs_master where mobileno = ?';
//     let values = [wanumber];
//     let s = dbpool.query(query, values, (err, result) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log({ result });
//             console.log(result[0].accountnumber);
//             let productRetailerid = result[0].accountnumber;
//             let productName = result[0].searchtype;
//             let productAmount = result[0].billamount;
//             let productQuantity = 1;
//             let productRequestId = result[0].requestid;
//             let productImageUrl = result[0].imageurl;
//             let orderIdInDB = result[0].orderid;

//             console.log({ orderIdInDB, productRequestId });

//             if (orderIdInDB === null) {
//                 var config = {
//                     method: 'post',
//                     url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/Api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
//                     headers: {
//                         'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
//                     }
//                 };

//                 // console.log({ url });

//                 axios(config)
//                     .then(function (response) {
//                         // console.log({ response });
//                         console.log(JSON.stringify(response.data));
//                         let orderId = response.data.data[0].OrderId;
//                         let reason = response.data.data[0].Reason;
//                         console.log({ orderId, reason });


//                         let query1 = 'UPDATE edcsdb.tbl_edcs_master SET orderid = ? WHERE requestid = ?';
//                         let values1 = [orderId, productRequestId];
//                         let s1 = dbpool.query(query1, values1, (err, result1) => {
//                             if (err) {
//                                 console.log(err);
//                             } else {
//                                 console.log(result1);
//                             }
//                         });


//                         let result = {
//                             productretailerid: productRetailerid,
//                             productname: productName,
//                             productamount: parseInt(productAmount),
//                             productquantity: productQuantity,
//                             productorderid: orderId,
//                             productimageurl: productImageUrl

//                         };
//                         console.log({ result });

//                         let response1 = {
//                             code: '200',
//                             status: 'success',
//                             type: 'non-catalog',
//                             data: result
//                         };
//                         res.json(response1);
//                     })
//                     .catch(function (err) {
//                         let errRes = {
//                             code: '100',
//                             status: 'Failed',
//                             data: 'Something went wrong'
//                         };
//                         res.json(errRes);
//                         console.log(err);
//                     });
//             }
//             else if (orderIdInDB !== null) {
//                 console.log({ orderIdInDB });
//                 let result3 = {
//                     productretailerid: productRetailerid,
//                     productname: productName,
//                     productamount: parseInt(productAmount),
//                     productquantity: productQuantity,
//                     productorderid: orderIdInDB,
//                     productimageurl: productImageUrl

//                 };
//                 console.log({ result });

//                 let response4 = {
//                     code: '200',
//                     status: 'success',
//                     type: 'non-catalog',
//                     data: result3
//                 };
//                 res.json(response4);
//             }
//         }
//     });
// });


// // Template Message ----------------------------> Electricity Bill
// router.post('/edcswapp/:wanumber/:templateid', async (req, res) => {

//     let wanumber = req.params.wanumber;
//     let templateid = req.params.templateid;

//     if (wanumber.length == 10) {
//         wanumber = '91' + wanumber;
//         console.log({ wanumber });
//     }

//     let query = 'SELECT * FROM edcsdb.tbl_edcs_master where mobileno = ?';
//     let values = [wanumber];
//     let s = dbpool.query(query, values, async (err, result) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log({ result });
//             console.log(result[0].accountnumber);
//             let productRetailerid = result[0].accountnumber;
//             let productName = result[0].searchtype;
//             let productAmount = result[0].billamount;
//             let productQuantity = 1;
//             let productRequestId = result[0].requestid;
//             let productImageUrl = result[0].imageurl;
//             let orderIdInDB = result[0].orderid;

//             console.log({ orderIdInDB, productRequestId });

//             if (orderIdInDB === null) {
//                 var config3 = {
//                     method: 'post',
//                     url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/Api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
//                     headers: {
//                         'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
//                     }
//                 };

//                 axios(config3)
//                     .then(async function (response3) {
//                         console.log(JSON.stringify(response3.data));
//                         let orderId = response3.data.data[0].OrderId;
//                         let reason = response3.data.data[0].Reason;
//                         console.log({ orderId, reason });

//                         let query1 = 'UPDATE edcsdb.tbl_edcs_master SET orderid = ? WHERE requestid = ?';
//                         let values1 = [orderId, productRequestId];
//                         let s1 = dbpool.query(query1, values1, (err, result1) => {
//                             if (err) {
//                                 console.log(err);
//                             } else {
//                                 console.log(result1);
//                             }
//                         });

//                         var data1 = JSON.stringify({
//                             "from": "919148502277",
//                             "to": wanumber,
//                             "type": "template",
//                             "message": {
//                                 "templateid": templateid,
//                                 "placeholders": [],
//                                 "buttons": [
//                                     {
//                                         "index": 0,
//                                         "type": "visit_website",
//                                         "placeholder": orderId
//                                     }
//                                 ]
//                             }
//                         });

//                         var config1 = {
//                             method: 'post',
//                             url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
//                             headers: {
//                                 'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
//                                 'Content-Type': 'application/json'
//                             },
//                             data: data1
//                         };
//                         try {
//                             const response1 = await axios(config1);
//                             let response2 = {
//                                 code: '200',
//                                 status: 'success',
//                                 type: 'text',
//                                 data: orderId
//                             };
//                             res.json(response2);
//                         } catch {
//                             console.log(err);
//                             let errRes = {
//                                 code: '100',
//                                 status: 'Failed',
//                                 data: 'Something went wrong'
//                             };
//                             res.json(errRes);
//                         }
//                     })
//                     .catch(function (error) {
//                         console.log(error);
//                         let errRes = {
//                             code: '100',
//                             status: 'Failed',
//                             data: 'Something went wrong'
//                         };
//                         res.json(errRes);
//                     });
//             }
//             else if (orderIdInDB !== null) {
//                 console.log({ orderIdInDB });

//                 var data1 = JSON.stringify({
//                     "from": "919148502277",
//                     "to": wanumber,
//                     "type": "template",
//                     "message": {
//                         "templateid": templateid,
//                         "placeholders": [],
//                         "buttons": [
//                             {
//                                 "index": 0,
//                                 "type": "visit_website",
//                                 "placeholder": orderIdInDB
//                             }
//                         ]
//                     }
//                 });

//                 var config1 = {
//                     method: 'post',
//                     url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
//                     headers: {
//                         'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
//                         'Content-Type': 'application/json'
//                     },
//                     data: data1
//                 };
//                 try {
//                     const response1 = await axios(config1);
//                     let response2 = {
//                         code: '200',
//                         status: 'success',
//                         type: 'text',
//                         data: orderIdInDB
//                     };
//                     res.json(response2);
//                 } catch {
//                     console.log(err);
//                     let errRes = {
//                         code: '100',
//                         status: 'Failed',
//                         data: 'Something went wrong'
//                     };
//                     res.json(errRes);
//                 }


//             }
//         }
//     });
// });



// // Karnataka One External Payment ------------------------> WATER BILL
// router.post('/BWSSB/GetBillDetails/:RRNO/:wanumber', (req, res) => {
//     let externalPaymentUrl = 'https://koneportal.cmsuat.co.in:1443/WhatsAppPayment/';
//     let rrno = req.params.RRNO;
//     console.log(rrno);
//     let wanumber = req.params.wanumber;
//     console.log({ wanumber });
//     let data = JSON.stringify({
//         RRNO: rrno
//     });

//     var config = {
//         method: 'post',
//         url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/Api//BWSSB/FetchBillDetails?RRNO=' + rrno,
//         headers: {
//             'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
//         },
//         data: data
//     };

//     let tempText = null;
//     axios(config)
//         .then(function (response) {
//             // console.log(JSON.stringify(response.data));
//             let productRetailerid = response.data.data[0].AccountNumber;
//             let productName = response.data.data[0].SearchedType;
//             let productAmount = response.data.data[0].BillAmount;
//             let productQuantity = 1;
//             let productRequestId = response.data.data[0].RequestId;
//             let productImageUrl = response.data.data[0].ImageURL;
//             let reason = response.data.data[0].Reason;
//             console.log({ reason });

//             if (response.data.code === '100') {
//                 tempText = reason;
//                 let response1 = {
//                     code: '100',
//                     status: 'failed',
//                     type: 'text',
//                     data: tempText
//                 };
//                 res.json(response1);
//             }
//             else {

//                 if (wanumber.length == 10) {
//                     wanumber = '91' + wanumber;
//                     console.log({ wanumber });
//                 }

//                 let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid, mobileno) VALUES (?,?,?,?,?,?,?)';
//                 let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, wanumber];
//                 let s = dbpool.query(query, values, (err, result) => {
//                     if (err) {
//                         console.log(err);
//                     } else {
//                         console.log(result);
//                     }
//                 });

//                 tempText = 'Dear User,\nYour Water bill of Rs.' + response.data.data[0].BillAmount + ' is generated.\n';
//                 // tempText += 'To pay it, click on below link \n\n';
//                 // tempText += externalPaymentUrl + response.data.data[0].RequestId + '/' + wanumber;

//                 let response1 = {
//                     code: '200',
//                     status: 'success',
//                     type: 'non-catalog',
//                     data: tempText
//                 };
//                 res.json(response1);
//             }



//         })
//         .catch(function (err) {
//             let errRes = {
//                 code: '100',
//                 status: 'Failed',
//                 data: 'Something went wrong'
//             };
//             res.json(errRes);
//             console.log(err);
//         });
// });

// // Water Bill Payment
// router.post('/BWSSB/FetchBillDetails/:wanumber', (req, res) => {



//     let wanumber = req.params.wanumber;

//     if (wanumber.length == 10) {
//         wanumber = '91' + wanumber;
//         console.log({ wanumber });
//     }


//     let query = 'SELECT * FROM edcsdb.tbl_edcs_master where mobileno = ?';
//     let values = [wanumber];
//     let s = dbpool.query(query, values, (err, result) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log({ result });
//             console.log(result[0].accountnumber);
//             let productRetailerid = result[0].accountnumber;
//             let productName = result[0].searchtype !== null ? result[0].searchtype : "Water Bill";
//             let productAmount = result[0].billamount;
//             let productQuantity = 1;
//             let productRequestId = result[0].requestid;
//             let productImageUrl = result[0].imageurl;
//             let orderIdInDB = result[0].orderid;

//             console.log({ orderIdInDB, productRequestId });

//             if (orderIdInDB === null) {
//                 var config = {
//                     method: 'post',
//                     url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/Api/Payment/GetPaymentDetails?RequestId=' + result[0].requestid + '&WhatsappMobNo=' + wanumber,
//                     headers: {
//                         'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
//                     }
//                 };
//                 // console.log({ url });

//                 axios(config)
//                     .then(function (response) {
//                         console.log({ response });

//                         let orderId = response.data.data[0].OrderId;
//                         let reason = response.data.data[0].Reason;
//                         console.log({ orderId, reason });

//                         let query1 = 'UPDATE edcsdb.tbl_edcs_master SET orderid = ? WHERE requestid = ?';
//                         let values1 = [orderId, productRequestId];
//                         let s1 = dbpool.query(query1, values1, (err, result1) => {
//                             if (err) {
//                                 console.log(err);
//                             } else {
//                                 console.log(result1);
//                             }
//                         });


//                         let result = {
//                             productretailerid: productRetailerid,
//                             productname: productName,
//                             productamount: parseInt(productAmount),
//                             productquantity: productQuantity,
//                             productorderid: orderId,
//                             productimageurl: productImageUrl

//                         };
//                         console.log({ result });

//                         let response1 = {
//                             code: '200',
//                             status: 'success',
//                             type: 'non-catalog',
//                             data: result
//                         };
//                         res.json(response1);
//                     })
//                     .catch(function (err) {
//                         let errRes = {
//                             code: '100',
//                             status: 'Failed',
//                             data: 'Something went wrong'
//                         };
//                         res.json(errRes);
//                         console.log(err);
//                     });

//             }
//             else if (orderIdInDB !== null) {
//                 console.log({ orderIdInDB });
//                 let result3 = {
//                     productretailerid: productRetailerid,
//                     productname: productName,
//                     productamount: parseInt(productAmount),
//                     productquantity: productQuantity,
//                     productorderid: orderIdInDB,
//                     productimageurl: productImageUrl

//                 };
//                 console.log({ result });

//                 let response4 = {
//                     code: '200',
//                     status: 'success',
//                     type: 'non-catalog',
//                     data: result3
//                 };
//                 res.json(response4);
//             }
//         }
//     });
// });


// // Template Message ----------------------------> Water Bill
// router.post('/edcswapp/:wanumber/:templateid', async (req, res) => {
//     let wanumber = req.params.wanumber;
//     let templateid = req.params.templateid;

//     if (wanumber.length == 10) {
//         wanumber = '91' + wanumber;
//         console.log({ wanumber });
//     }




//     let query = 'SELECT * FROM edcsdb.tbl_edcs_master where mobileno = ?';
//     let values = [wanumber];
//     let s = dbpool.query(query, values, async (err, result) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log({ result });
//             console.log(result[0].accountnumber);
//             let productRetailerid = result[0].accountnumber;
//             let productName = result[0].searchtype;
//             let productAmount = result[0].billamount;
//             let productQuantity = 1;
//             let productRequestId = result[0].requestid;
//             let productImageUrl = result[0].imageurl;

//             let orderIdInDB = result[0].orderid;

//             console.log({ orderIdInDB, productRequestId });

//             if (orderIdInDB === null) {
//                 var config3 = {
//                     method: 'post',
//                     url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/Api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
//                     headers: {
//                         'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
//                     }
//                 };

//                 axios(config3)
//                     .then(async function (response3) {
//                         console.log(JSON.stringify(response3.data));
//                         let orderId = response3.data.data[0].OrderId;
//                         let reason = response3.data.data[0].Reason;
//                         console.log({ orderId, reason });

//                         let query1 = 'UPDATE edcsdb.tbl_edcs_master SET orderid = ? WHERE requestid = ?';
//                         let values1 = [orderId, productRequestId];
//                         let s1 = dbpool.query(query1, values1, (err, result1) => {
//                             if (err) {
//                                 console.log(err);
//                             } else {
//                                 console.log(result1);
//                             }
//                         });
//                         var data1 = JSON.stringify({
//                             "from": "919148502277",
//                             "to": wanumber,
//                             "type": "template",
//                             "message": {
//                                 "templateid": templateid,
//                                 "placeholders": [],
//                                 "buttons": [
//                                     {
//                                         "index": 0,
//                                         "type": "visit_website",
//                                         "placeholder": orderId
//                                     }
//                                 ]
//                             }
//                         });

//                         var config1 = {
//                             method: 'post',
//                             url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
//                             headers: {
//                                 'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
//                                 'Content-Type': 'application/json'
//                             },
//                             data: data1
//                         };
//                         try {
//                             const response1 = await axios(config1);
//                             let response2 = {
//                                 code: '200',
//                                 status: 'success',
//                                 type: 'text',
//                                 data: orderId
//                             };
//                             res.json(response2);
//                         } catch {
//                             console.log(err);
//                             let errRes = {
//                                 code: '100',
//                                 status: 'Failed',
//                                 data: 'Something went wrong'
//                             };
//                             res.json(errRes);
//                         }
//                     })
//                     .catch(function (error) {
//                         console.log(error);
//                         let errRes = {
//                             code: '100',
//                             status: 'Failed',
//                             data: 'Something went wrong'
//                         };
//                         res.json(errRes);
//                     });
//             }
//             else if (orderIdInDB !== null) {
//                 console.log({ orderIdInDB });

//                 var data1 = JSON.stringify({
//                     "from": "919148502277",
//                     "to": wanumber,
//                     "type": "template",
//                     "message": {
//                         "templateid": templateid,
//                         "placeholders": [],
//                         "buttons": [
//                             {
//                                 "index": 0,
//                                 "type": "visit_website",
//                                 "placeholder": orderIdInDB
//                             }
//                         ]
//                     }
//                 });

//                 var config1 = {
//                     method: 'post',
//                     url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
//                     headers: {
//                         'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
//                         'Content-Type': 'application/json'
//                     },
//                     data: data1
//                 };
//                 try {
//                     const response1 = await axios(config1);
//                     let response2 = {
//                         code: '200',
//                         status: 'success',
//                         type: 'text',
//                         data: orderIdInDB
//                     };
//                     res.json(response2);
//                 } catch {
//                     console.log(err);
//                     let errRes = {
//                         code: '100',
//                         status: 'Failed',
//                         data: 'Something went wrong'
//                     };
//                     res.json(errRes);
//                 }
//             }


//         }
//     });
// });




// // <-----------------------------------------------------------------------------------------------> 


// // Karnataka One External Payment ------------------------> ELECTRICITY BILL
// router.post('/ESCOM/GetBillDetails/:EscomType/:SearchValue/:wanumber/:templateid', async (req, res) => {
//     let externalPaymentUrl = 'https://koneportal.cmsuat.co.in:1443/WhatsAppPayment/';
//     let escomType = req.params.EscomType;
//     // console.log(escomType);
//     let searchValue = req.params.SearchValue;
//     // console.log(searchValue);
//     let wanumber = req.params.wanumber;
//     // console.log({ wanumber });
//     let data = JSON.stringify({
//         EscomType: escomType,
//         SearchValue: searchValue
//     });

//     let templateid = req.params.templateid;

//     var config = {
//         method: 'post',
//         url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/api/ESCOM/FetchBillDetails?EscomType=' + escomType + '&SearchValue=' + searchValue,
//         headers: {
//             'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
//         },
//         data: data
//     };

//     // console.log({ url });
//     let tempText = null;

//     axios(config)
//         .then(async function (response) {
//             // console.log({ response });
//             console.log(JSON.stringify(response.data));
//             let productRetailerid = response.data.data[0].AccountNumber;
//             let productName = response.data.data[0].SearchedType;
//             let productAmount = response.data.data[0].BillAmount;
//             let productQuantity = 1;
//             let productRequestId = response.data.data[0].RequestId;
//             let productImageUrl = response.data.data[0].ImageURL;

//             let reason = response.data.data[0].Reason;
//             console.log({ reason });
//             if (response.data.code === '100') {
//                 tempText = reason;
//                 let response1 = {
//                     code: '100',
//                     status: 'failed',
//                     type: 'text',
//                     data: reason
//                 };
//                 res.json(response1);
//             } else {

//                 if (wanumber.length == 10) {
//                     wanumber = '91' + wanumber;
//                     // console.log({ wanumber });
//                 }
//                 // console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });


//                 var config3 = {
//                     method: 'post',
//                     url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/Api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
//                     headers: {
//                         'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
//                     }
//                 };

//                 axios(config3)
//                     .then(async function (response3) {
//                         console.log(JSON.stringify(response3.data));
//                         let orderId = response3.data.data[0].OrderId;
//                         let reason = response3.data.data[0].Reason;
//                         // console.log({ orderId, reason });


//                         var data1 = JSON.stringify({
//                             "from": "919148502277",
//                             "to": wanumber,
//                             "type": "template",
//                             "message": {
//                                 "templateid": templateid,
//                                 "placeholders": [
//                                     "electricity bill",
//                                     productAmount
//                                 ],
//                                 "buttons": [
//                                     {
//                                         "index": 0,
//                                         "type": "visit_website",
//                                         "placeholder": orderId
//                                     }
//                                 ]
//                             }
//                         });

//                         var config1 = {
//                             method: 'post',
//                             url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
//                             headers: {
//                                 'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
//                                 'Content-Type': 'application/json'
//                             },
//                             data: data1
//                         };
//                         try {
//                             const response1 = await axios(config1);
//                             let response2 = {
//                                 code: '200',
//                                 status: 'success',
//                                 type: 'text',
//                                 data: orderId
//                             };
//                             res.json(response2);
//                         } catch {
//                             console.log(err);
//                             let errRes = {
//                                 code: '100',
//                                 status: 'Failed',
//                                 data: 'Something went wrong'
//                             };
//                             res.json(errRes);
//                         }
//                     })
//                     .catch(function (error) {
//                         console.log(error);
//                         let errRes = {
//                             code: '100',
//                             status: 'Failed',
//                             data: 'Something went wrong'
//                         };
//                         res.json(errRes);
//                     });


//             }
//         })
//         .catch(function (err) {

//             let errRes = {
//                 code: '100',
//                 status: 'Failed',
//                 data: 'Something went wrong'
//             };
//             res.json(errRes);
//             console.log(err);
//         });
// });



// // Karnataka One External Payment ------------------------> WATER BILL
// router.post('/BWSSB/GetBillDetails/:RRNO/:wanumber/:templateid', (req, res) => {
//     let externalPaymentUrl = 'https://koneportal.cmsuat.co.in:1443/WhatsAppPayment/';
//     let rrno = req.params.RRNO;
//     // console.log(rrno);
//     let wanumber = req.params.wanumber;
//     // console.log({ wanumber });
//     let data = JSON.stringify({
//         RRNO: rrno
//     });

//     let templateid = req.params.templateid;


//     var config = {
//         method: 'post',
//         url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/Api//BWSSB/FetchBillDetails?RRNO=' + rrno,
//         headers: {
//             'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
//         },
//         data: data
//     };

//     let tempText = null;
//     axios(config)
//         .then(function (response) {
//             console.log(JSON.stringify(response.data));
//             let productRetailerid = response.data.data[0].AccountNumber;
//             let productName = response.data.data[0].SearchedType;
//             let productAmount = response.data.data[0].BillAmount;
//             let productQuantity = 1;
//             let productRequestId = response.data.data[0].RequestId;
//             let productImageUrl = response.data.data[0].ImageURL;
//             let reason = response.data.data[0].Reason;
//             // console.log({ reason });

//             if (response.data.code === '100') {
//                 tempText = reason;
//                 let response1 = {
//                     code: '100',
//                     status: 'failed',
//                     type: 'text',
//                     data: reason
//                 };
//                 res.json(response1);
//             }
//             else {

//                 if (wanumber.length == 10) {
//                     wanumber = '91' + wanumber;
//                     // console.log({ wanumber });
//                 }



//                 var config3 = {
//                     method: 'post',
//                     url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/Api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
//                     headers: {
//                         'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
//                     }
//                 };

//                 axios(config3)
//                     .then(async function (response3) {
//                         console.log(JSON.stringify(response3.data));
//                         let orderId = response3.data.data[0].OrderId;
//                         let reason = response3.data.data[0].Reason;
//                         // console.log({ orderId, reason });


//                         var data1 = JSON.stringify({
//                             "from": "919148502277",
//                             "to": wanumber,
//                             "type": "template",
//                             "message": {
//                                 "templateid": templateid,
//                                 "placeholders": [
//                                     "water bill",
//                                     productAmount
//                                 ],
//                                 "buttons": [
//                                     {
//                                         "index": 0,
//                                         "type": "visit_website",
//                                         "placeholder": orderId
//                                     }
//                                 ]
//                             }
//                         });

//                         var config1 = {
//                             method: 'post',
//                             url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
//                             headers: {
//                                 'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
//                                 'Content-Type': 'application/json'
//                             },
//                             data: data1
//                         };
//                         try {
//                             const response1 = await axios(config1);
//                             let response2 = {
//                                 code: '200',
//                                 status: 'success',
//                                 type: 'text',
//                                 data: orderId
//                             };
//                             res.json(response2);
//                         } catch {
//                             console.log(err);
//                             let errRes = {
//                                 code: '100',
//                                 status: 'Failed',
//                                 data: 'Something went wrong'
//                             };
//                             res.json(errRes);
//                         }
//                     })
//                     .catch(function (error) {
//                         console.log(error);
//                         let errRes = {
//                             code: '100',
//                             status: 'Failed',
//                             data: 'Something went wrong'
//                         };
//                         res.json(errRes);
//                     });
//             }



//         })
//         .catch(function (err) {
//             let errRes = {
//                 code: '100',
//                 status: 'Failed',
//                 data: 'Something went wrong'
//             };
//             res.json(errRes);
//             console.log(err);
//         });
// });


// // BBMP Khata Payment
// router.post('/khata/:gscno/:wanumber/:templateid', async (req, res) => {
//     let externalPaymentUrl = 'https://koneportal.cmsuat.co.in:1443/WhatsAppPayment/';

//     let gscno = req.params.gscno;
//     // console.log({ gscno });

//     let data = JSON.stringify({
//         GSCNO: gscno,
//     });

//     let wanumber = req.params.wanumber;
//     // console.log({ wanumber });

//     let templateid = req.params.templateid;


//     var config = {
//         method: 'post',
//         url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/api/BBMPKhatha/FetchBBMPKhataPayment?GSCNO=' + gscno,
//         headers: {
//             'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
//         },
//         data: data
//     };

//     // console.log({ url });
//     let tempText = null;

//     axios(config)
//         .then(async function (response) {
//             // console.log({ response });
//             console.log(JSON.stringify(response.data));
//             let productRetailerid = response.data.data[0].AccountNumber;
//             let productName = response.data.data[0].SearchedType;
//             let productAmount = response.data.data[0].BillAmount;
//             let productQuantity = 1;
//             let productRequestId = response.data.data[0].RequestId;
//             let productImageUrl = response.data.data[0].ImageURL;

//             let reason = response.data.data[0].Reason;
//             // console.log({ reason });
//             if (response.data.code === '100') {
//                 tempText = reason;
//                 let response1 = {
//                     code: '100',
//                     status: 'failed',
//                     type: 'text',
//                     data: tempText
//                 };
//                 res.json(response1);
//             } else {

//                 if (wanumber.length == 10) {
//                     wanumber = '91' + wanumber;
//                     // console.log({ wanumber });
//                 }
//                 // console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });


//                 var config3 = {
//                     method: 'post',
//                     url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/Api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
//                     headers: {
//                         'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
//                     }
//                 };

//                 axios(config3)
//                     .then(async function (response3) {
//                         console.log(JSON.stringify(response3.data));
//                         let orderId = response3.data.data[0].OrderId;
//                         let reason = response3.data.data[0].Reason;
//                         // console.log({ orderId, reason });



//                         var data1 = JSON.stringify({
//                             "from": "919148502277",
//                             "to": wanumber,
//                             "type": "template",
//                             "message": {
//                                 "templateid": templateid,
//                                 "placeholders": [
//                                     "Khata transfer Bill",
//                                     productAmount
//                                 ],
//                                 "buttons": [
//                                     {
//                                         "index": 0,
//                                         "type": "visit_website",
//                                         "placeholder": orderId
//                                     }
//                                 ]
//                             }
//                         });

//                         var config1 = {
//                             method: 'post',
//                             url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
//                             headers: {
//                                 'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
//                                 'Content-Type': 'application/json'
//                             },
//                             data: data1
//                         };
//                         try {
//                             const response1 = await axios(config1);
//                             let response2 = {
//                                 code: '200',
//                                 status: 'success',
//                                 type: 'text',
//                                 data: orderId
//                             };
//                             res.json(response2);
//                         } catch {
//                             console.log(err);
//                             let errRes = {
//                                 code: '100',
//                                 status: 'Failed',
//                                 data: 'Something went wrong'
//                             };
//                             res.json(errRes);
//                         }
//                     })
//                     .catch(function (error) {
//                         console.log(error);
//                         let errRes = {
//                             code: '100',
//                             status: 'Failed',
//                             data: 'Something went wrong'
//                         };
//                         res.json(errRes);
//                     });
//             }
//         })
//         .catch(function (err) {

//             let errRes = {
//                 code: '100',
//                 status: 'Failed',
//                 data: 'Something went wrong'
//             };
//             res.json(errRes);
//             console.log(err);
//         });
// });


// // RC Extract
// router.post('/rcextract/:regno/:wanumber/:templateid', async (req, res) => {
//     let externalPaymentUrl = 'https://koneportal.cmsuat.co.in:1443/WhatsAppPayment/';

//     let regno = req.params.regno;
//     // console.log({ regno });

//     let wanumber = req.params.wanumber;
//     // console.log({ wanumber });

//     let data = JSON.stringify({
//         REGNO: regno,
//     });

//     let templateid = req.params.templateid;

//     var config = {
//         method: 'post',
//         url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/api/RCExtract/FetchRCExtract?RegNo=' + regno,
//         headers: {
//             'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
//         },
//         data: data
//     };

//     // console.log({ url });
//     let tempText = null;

//     axios(config)
//         .then(async function (response) {
//             // console.log({ response });
//             console.log(JSON.stringify(response.data));
//             let productRetailerid = response.data.data[0].AccountNumber;
//             let productName = response.data.data[0].SearchedType;
//             let productAmount = response.data.data[0].BillAmount;
//             let productQuantity = 1;
//             let productRequestId = response.data.data[0].RequestId;
//             let productImageUrl = response.data.data[0].ImageURL;

//             let reason = response.data.data[0].Reason;
//             console.log({ reason });
//             if (response.data.code === '100') {
//                 tempText = reason;
//                 let response1 = {
//                     code: '100',
//                     status: 'failed',
//                     type: 'text',
//                     data: tempText
//                 };
//                 res.json(response1);
//             } else {

//                 if (wanumber.length == 10) {
//                     wanumber = '91' + wanumber;
//                     // console.log({ wanumber });
//                 }
//                 // console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });



//                 var config3 = {
//                     method: 'post',
//                     url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/Api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
//                     headers: {
//                         'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
//                     }
//                 };

//                 axios(config3)
//                     .then(async function (response3) {
//                         console.log(JSON.stringify(response3.data));
//                         let orderId = response3.data.data[0].OrderId;
//                         let reason = response3.data.data[0].Reason;
//                         // console.log({ orderId, reason });


//                         var data1 = JSON.stringify({
//                             "from": "919148502277",
//                             "to": wanumber,
//                             "type": "template",
//                             "message": {
//                                 "templateid": templateid,
//                                 "placeholders": [
//                                     "RC Extract Bill",
//                                     productAmount
//                                 ],
//                                 "buttons": [
//                                     {
//                                         "index": 0,
//                                         "type": "visit_website",
//                                         "placeholder": orderId
//                                     }
//                                 ]
//                             }
//                         });

//                         var config1 = {
//                             method: 'post',
//                             url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
//                             headers: {
//                                 'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
//                                 'Content-Type': 'application/json'
//                             },
//                             data: data1
//                         };
//                         try {
//                             const response1 = await axios(config1);
//                             let response2 = {
//                                 code: '200',
//                                 status: 'success',
//                                 type: 'text',
//                                 data: orderId
//                             };
//                             res.json(response2);
//                         } catch {
//                             console.log(err);
//                             let errRes = {
//                                 code: '100',
//                                 status: 'Failed',
//                                 data: 'Something went wrong'
//                             };
//                             res.json(errRes);
//                         }
//                     })
//                     .catch(function (error) {
//                         console.log(error);
//                         let errRes = {
//                             code: '100',
//                             status: 'Failed',
//                             data: 'Something went wrong'
//                         };
//                         res.json(errRes);
//                     });



//             }
//         })
//         .catch(function (err) {

//             let errRes = {
//                 code: '100',
//                 status: 'Failed',
//                 data: 'Something went wrong'
//             };
//             res.json(errRes);
//             console.log(err);
//         });
// });





//<--------------------------------------------------------------------------------------------------> FINAL 

// Karnataka One External Payment ------------------------> ELECTRICITY BILL
router.post('/ESCOM/GetBillDetails/:EscomType/:SearchValue/:wanumber', async (req, res) => {
    let externalPaymentUrl = 'https://koneportal.cmsuat.co.in:1443/WhatsAppPayment/';
    let escomType = req.params.EscomType;
    console.log(escomType);
    let searchValue = req.params.SearchValue;
    console.log(searchValue);
    let wanumber = req.params.wanumber;
    console.log({ wanumber });
    let data = JSON.stringify({
        EscomType: escomType,
        SearchValue: searchValue
    });

    var config = {
        method: 'post',
        url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/ESCOM/FetchBillDetails?EscomType=' + escomType + '&SearchValue=' + searchValue,
        headers: {
            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
        },
        data: data
    };

    // console.log({ url });
    let tempText = null;

    try {
        const response = await axios(config);
        console.log({ response });
        console.log(JSON.stringify(response.data));
        let productRetailerid = response.data.data[0].AccountNumber;
        let productName = response.data.data[0].SearchedType;
        let productAmount = response.data.data[0].BillAmount;
        let productQuantity = 1;
        let productRequestId = response.data.data[0].RequestId;
        let productImageUrl = response.data.data[0].ImageURL;

        let reason = response.data.data[0].Reason;
        console.log({ reason });
        if (response.data.code === '100') {
            tempText = reason;
            let response1 = {
                code: '100',
                status: 'failed',
                type: 'text',
                data: tempText
            };
            res.json(response1);
        } else {


            if (wanumber.length == 10) {
                wanumber = '91' + wanumber;
                console.log({ wanumber });
            }
            console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });


            if (productName === null) {
                productName = searchValue;
                console.log({ productName });
            }



            let query = 'REPLACE INTO tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid,wapay_orderid, mobileno) VALUES (?,?,?,?,?,?,?,?)';
            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
            let s = await dbpool.query(query, values, async (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                }
            });

            tempText = 'Dear User,\nYour electricity bill of Rs.' + response.data.data[0].BillAmount + ' is generated.\n';
            // tempText += 'To pay it, click on below link \n\n';
            // tempText += externalPaymentUrl + response.data.data[0].RequestId + '/' + wanumber;
            let response1 = {
                code: '200',
                status: 'success',
                type: 'text',
                data: tempText
            };
            res.json(response1);
        }
    } catch (err) {
        let errRes = {
            code: '100',
            status: 'Failed',
            data: 'Something went wrong'
        };
        res.json(errRes);
        console.log(err);
    }
});


// Electricity Bill Payment----------------------------> Razorpay Integration for WAPAY
router.post('/ESCOM/FetchBillDetails/:EscomType/:SearchValue/:wanumber', async (req, res) => {
    let wanumber = req.params.wanumber;
    console.log({ wanumber });


    if (wanumber.length == 10) {
        wanumber = '91' + wanumber;
        console.log({ wanumber });
    }

    let query = 'SELECT * FROM edcsdb.tbl_edcs_master where mobileno = ?';
    let values = [wanumber];
    let s = await dbpool.query(query, values, async (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log({ result });
            console.log(result[0].accountnumber);
            let productRetailerid = result[0].accountnumber;
            let productName = result[0].searchtype;
            let productAmount = result[0].billamount;
            let productQuantity = 1;
            let productRequestId = result[0].requestid;
            let productImageUrl = result[0].imageurl;
            // let orderIdInDB = result[0].wapay_orderid;

            // console.log({ orderIdInDB, productRequestId });
            console.log({ productRequestId });


            var config = {
                method: 'post',
                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetWhatsappPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                headers: {
                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                }
            };

            try {
                const response = await axios(config);
                // console.log({ response });
                console.log(response.data);


                if (response.data.code === '100') {

                    let escomType = req.params.EscomType;
                    console.log(escomType);
                    let searchValue = req.params.SearchValue;
                    console.log(searchValue);

                    let data = JSON.stringify({
                        EscomType: escomType,
                        SearchValue: searchValue
                    });

                    var config = {
                        method: 'post',
                        url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/ESCOM/FetchBillDetails?EscomType=' + escomType + '&SearchValue=' + searchValue,
                        headers: {
                            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                        },
                        data: data
                    };

                    // console.log({ url });
                    let tempText = null;

                    try {
                        const response = await axios(config);
                        // console.log({ response });
                        console.log(JSON.stringify(response.data));
                        let productRetailerid = response.data.data[0].AccountNumber;
                        let productName = response.data.data[0].SearchedType;
                        let productAmount = response.data.data[0].BillAmount;
                        let productQuantity = 1;
                        let productRequestId = response.data.data[0].RequestId;
                        let productImageUrl = response.data.data[0].ImageURL;

                        let reason = response.data.data[0].Reason;
                        console.log({ reason });
                        if (response.data.code === '100') {
                            tempText = reason;
                            let response1 = {
                                code: '100',
                                status: 'failed',
                                type: 'text',
                                data: tempText
                            };
                            res.json(response1);
                        } else {

                            if (wanumber.length == 10) {
                                wanumber = '91' + wanumber;
                                console.log({ wanumber });
                            }
                            console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });


                            if (productName === null) {
                                productName = searchValue;
                                console.log({ productName });
                            }

                            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid,wapay_orderid, mobileno) VALUES (?,?,?,?,?,?,?,?)';
                            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
                            let s = await dbpool.query(query, values, (err, result) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            });

                            var config = {
                                method: 'post',
                                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetWhatsappPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                                headers: {
                                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                                }
                            };

                            try {
                                const response = await axios(config);
                                console.log(JSON.stringify(response.data));
                                let orderId = response.data.data[0].tr;
                                let reason = response.data.data[0].Reason;
                                console.log({ orderId, reason });


                                let query1 = 'UPDATE edcsdb.tbl_edcs_master SET wapay_orderid = ? WHERE requestid = ?';
                                let values1 = [orderId, productRequestId];
                                let s1 = await dbpool.query(query1, values1, (err, result1) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(result1);
                                    }
                                });


                                let result = {
                                    productretailerid: productRetailerid,
                                    productname: productName,
                                    productamount: parseInt(productAmount),
                                    productquantity: productQuantity,
                                    productorderid: orderId,
                                    productimageurl: productImageUrl

                                };
                                console.log({ result });

                                let response1 = {
                                    code: '200',
                                    status: 'success',
                                    type: 'non-catalog',
                                    data: result
                                };
                                res.json(response1);
                            }
                            catch (err) {
                                console.log(err);
                            }

                        }
                    } catch (err) {
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                        console.log(err);
                    }
                }
                else if (response.data.code === '200') {
                    console.log(JSON.stringify(response.data));
                    let orderId = response.data.data[0].tr;
                    let reason = response.data.data[0].Reason;
                    console.log({ orderId, reason });


                    let query1 = 'UPDATE edcsdb.tbl_edcs_master SET wapay_orderid = ? WHERE requestid = ?';
                    let values1 = [orderId, productRequestId];
                    let s1 = await dbpool.query(query1, values1, (err, result1) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(result1);
                        }
                    });


                    let result = {
                        productretailerid: productRetailerid,
                        productname: productName,
                        productamount: parseInt(productAmount),
                        productquantity: productQuantity,
                        productorderid: orderId,
                        productimageurl: productImageUrl

                    };
                    console.log({ result });

                    let response1 = {
                        code: '200',
                        status: 'success',
                        type: 'non-catalog',
                        data: result
                    };
                    res.json(response1);
                }
            }
            catch (err) {
                console.log(err);
                let errRes = {
                    code: '100',
                    status: 'Failed',
                    data: 'Something went wrong'
                };
                res.json(errRes);
                console.log(err);
            }

        }
    });
});



// Template Message ----------------------------> Electricity Bill
router.post('/ESCOM/FetchBillDetails/:EscomType/:SearchValue/:wanumber/:templateid/:tempnumber', async (req, res) => {

    let wanumber = req.params.wanumber;
    let templateid = req.params.templateid;
    let tempnumber = req.params.tempnumber;

    if (wanumber.length == 10) {
        wanumber = '91' + wanumber;
        console.log({ wanumber });
    }

    if (tempnumber.length == 10) {
        wanumber = '91' + tempnumber;
        console.log({ tempnumber });
    }

    let query = 'SELECT * FROM edcsdb.tbl_edcs_master where mobileno = ?';
    let values = [wanumber];
    let s = await dbpool.query(query, values, async (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log({ result });
            console.log(result[0].accountnumber);
            let productRetailerid = result[0].accountnumber;
            let productName = result[0].searchtype;
            let productAmount = result[0].billamount;
            let productQuantity = 1;
            let productRequestId = result[0].requestid;
            let productImageUrl = result[0].imageurl;
            // let orderIdInDB = result[0].orderid;

            // console.log({ orderIdInDB, productRequestId });
            console.log({ productRequestId });


            var config3 = {
                method: 'post',
                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                headers: {
                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                }
            };

            try {
                const response3 = await axios(config3);

                console.log(JSON.stringify(response3.data));


                if (response3.data.code === '100') {

                    let escomType = req.params.EscomType;
                    console.log(escomType);
                    let searchValue = req.params.SearchValue;
                    console.log(searchValue);

                    let data = JSON.stringify({
                        EscomType: escomType,
                        SearchValue: searchValue
                    });

                    var config = {
                        method: 'post',
                        url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/ESCOM/FetchBillDetails?EscomType=' + escomType + '&SearchValue=' + searchValue,
                        headers: {
                            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                        },
                        data: data
                    };

                    // console.log({ url });
                    let tempText = null;

                    try {
                        const response = await axios(config);
                        // console.log({ response });
                        console.log(JSON.stringify(response.data));
                        let productRetailerid = response.data.data[0].AccountNumber;
                        let productName = response.data.data[0].SearchedType;
                        let productAmount = response.data.data[0].BillAmount;
                        let productQuantity = 1;
                        let productRequestId = response.data.data[0].RequestId;
                        let productImageUrl = response.data.data[0].ImageURL;

                        let reason = response.data.data[0].Reason;
                        console.log({ reason });
                        if (response.data.code === '100') {
                            tempText = reason;
                            let response1 = {
                                code: '100',
                                status: 'failed',
                                type: 'text',
                                data: tempText
                            };
                            res.json(response1);
                        } else {

                            if (wanumber.length == 10) {
                                wanumber = '91' + wanumber;
                                console.log({ wanumber });
                            }
                            console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });

                            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid,wapay_orderid, mobileno) VALUES (?,?,?,?,?,?,?,?)';
                            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
                            let s = await dbpool.query(query, values, (err, result) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            });

                            var config = {
                                method: 'post',
                                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                                headers: {
                                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                                }
                            };

                            try {
                                const response = await axios(config);
                                console.log(JSON.stringify(response.data));
                                let orderId = response.data.data[0].OrderId;
                                let reason = response.data.data[0].Reason;
                                console.log({ orderId, reason });

                                let query1 = 'UPDATE edcsdb.tbl_edcs_master SET orderid = ? WHERE requestid = ?';
                                let values1 = [orderId, productRequestId];
                                let s1 = await dbpool.query(query1, values1, (err, result1) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(result1);
                                    }
                                });

                                var data1 = JSON.stringify({
                                    "from": tempnumber,
                                    "to": wanumber,
                                    "type": "template",
                                    "message": {
                                        "templateid": templateid,
                                        "placeholders": [
                                            "electricty bill",
                                            productAmount
                                        ],
                                        "buttons": [
                                            {
                                                "index": 0,
                                                "type": "visit_website",
                                                "placeholder": orderId
                                            }
                                        ]
                                    }
                                });

                                var config1 = {
                                    method: 'post',
                                    url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
                                    headers: {
                                        'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
                                        'Content-Type': 'application/json'
                                    },
                                    data: data1
                                };
                                try {
                                    const response1 = await axios(config1);
                                    let response2 = {
                                        code: '200',
                                        status: 'success',
                                        type: 'text',
                                        data: orderId
                                    };
                                    res.json(response2);
                                } catch {
                                    console.log(err);
                                    let errRes = {
                                        code: '100',
                                        status: 'Failed',
                                        data: 'Something went wrong'
                                    };
                                    res.json(errRes);
                                }
                            }
                            catch (err) {
                                console.log(err);
                            }

                        }
                    } catch (err) {
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                        console.log(err);
                    }

                }
                else if (response3.data.code === '200') {
                    let orderId = response3.data.data[0].OrderId;
                    let reason = response3.data.data[0].Reason;
                    console.log({ orderId, reason });

                    let query1 = 'UPDATE edcsdb.tbl_edcs_master SET orderid = ? WHERE requestid = ?';
                    let values1 = [orderId, productRequestId];
                    let s1 = await dbpool.query(query1, values1, (err, result1) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(result1);
                        }
                    });

                    var data1 = JSON.stringify({
                        "from": tempnumber,
                        "to": wanumber,
                        "type": "template",
                        "message": {
                            "templateid": templateid,
                            "placeholders": [
                                "electricty bill",
                                productAmount
                            ],
                            "buttons": [
                                {
                                    "index": 0,
                                    "type": "visit_website",
                                    "placeholder": orderId
                                }
                            ]
                        }
                    });

                    var config1 = {
                        method: 'post',
                        url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
                        headers: {
                            'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
                            'Content-Type': 'application/json'
                        },
                        data: data1
                    };
                    try {
                        const response1 = await axios(config1);
                        let response2 = {
                            code: '200',
                            status: 'success',
                            type: 'text',
                            data: orderId
                        };
                        res.json(response2);
                    } catch {
                        console.log(err);
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                    }
                }
            }
            catch (err) {
                console.log(err);
                let errRes = {
                    code: '100',
                    status: 'Failed',
                    data: 'Something went wrong'
                };
                res.json(errRes);
            }


        }
    });
});



// Karnataka One External Payment ------------------------> WATER BILL
router.post('/WB/GetBillDetails/:WB/:RRNO/:wanumber', async (req, res) => {
    let externalPaymentUrl = 'https://koneportal.cmsuat.co.in:1443/WhatsAppPayment/';
    let wb = req.params.WB;
    console.log(wb);
    let rrno = req.params.RRNO;
    console.log(rrno);
    let wanumber = req.params.wanumber;
    console.log({ wanumber });
    let data = JSON.stringify({
        RRNO: rrno
    });

    var config = {
        method: 'post',
        url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/' + wb + '/FetchBillDetails?RRNO=' + rrno,
        headers: {
            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
        },
        data: data
    };

    // console.log({ url });
    let tempText = null;

    try {
        const response = await axios(config);
        // console.log({ response });
        console.log(JSON.stringify(response.data));
        let productRetailerid = response.data.data[0].AccountNumber;
        let productName = response.data.data[0].SearchedType;
        let productAmount = response.data.data[0].BillAmount;
        let productQuantity = 1;
        let productRequestId = response.data.data[0].RequestId;
        let productImageUrl = response.data.data[0].ImageURL;

        let reason = response.data.data[0].Reason;
        console.log({ reason });
        if (response.data.code === '100') {
            tempText = reason;
            let response1 = {
                code: '100',
                status: 'failed',
                type: 'text',
                data: tempText
            };
            res.json(response1);
        } else {

            if (wanumber.length == 10) {
                wanumber = '91' + wanumber;
                console.log({ wanumber });
            }
            console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });


            if (productName === null) {
                productName = wb;
                console.log({ productName });
            }

            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid,wapay_orderid, mobileno) VALUES (?,?,?,?,?,?,?,?)';
            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
            let s = await dbpool.query(query, values, async (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                }
            });

            tempText = 'Dear User,\nYour water bill of Rs.' + response.data.data[0].BillAmount + ' is generated.\n';
            // tempText += 'To pay it, click on below link \n\n';
            // tempText += externalPaymentUrl + response.data.data[0].RequestId + '/' + wanumber;
            let response1 = {
                code: '200',
                status: 'success',
                type: 'text',
                data: tempText
            };
            res.json(response1);
        }
    } catch (err) {
        let errRes = {
            code: '100',
            status: 'Failed',
            data: 'Something went wrong'
        };
        res.json(errRes);
        console.log(err);
    }
});


// Water Bill Payment----------------------------> Razorpay Integration for WAPAY
router.post('/WB/FetchBillDetails/:WB/:RRNO/:wanumber', async (req, res) => {

    let wanumber = req.params.wanumber;

    if (wanumber.length == 10) {
        wanumber = '91' + wanumber;
        console.log({ wanumber });
    }


    let query = 'SELECT * FROM edcsdb.tbl_edcs_master where mobileno = ?';
    let values = [wanumber];
    let s = await dbpool.query(query, values, async (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log({ result });
            console.log(result[0].accountnumber);
            let productRetailerid = result[0].accountnumber;
            let productName = result[0].searchtype;
            let productAmount = result[0].billamount;
            let productQuantity = 1;
            let productRequestId = result[0].requestid;
            let productImageUrl = result[0].imageurl;
            // let orderIdInDB = result[0].wapay_orderid;


            console.log({ productRequestId });
            // console.log({ orderIdInDB, productRequestId });



            var config = {
                method: 'post',
                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetWhatsappPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                headers: {
                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                }
            };


            try {
                const response = await axios(config);
                // console.log({ response });
                console.log(JSON.stringify(response.data));

                if (response.data.code === '100') {
                    let wb = req.params.WB;
                    console.log(wb);
                    let rrno = req.params.RRNO;
                    console.log(rrno);
                    let wanumber = req.params.wanumber;
                    console.log({ wanumber });
                    let data = JSON.stringify({
                        RRNO: rrno
                    });

                    var config = {
                        method: 'post',
                        url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/' + wb + '/FetchBillDetails?RRNO=' + rrno,
                        headers: {
                            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                        },
                        data: data
                    };

                    // console.log({ url });
                    let tempText = null;

                    try {
                        const response = await axios(config);
                        // console.log({ response });
                        console.log(JSON.stringify(response.data));
                        let productRetailerid = response.data.data[0].AccountNumber;
                        let productName = response.data.data[0].SearchedType;
                        let productAmount = response.data.data[0].BillAmount;
                        let productQuantity = 1;
                        let productRequestId = response.data.data[0].RequestId;
                        let productImageUrl = response.data.data[0].ImageURL;

                        let reason = response.data.data[0].Reason;
                        console.log({ reason });
                        if (response.data.code === '100') {
                            tempText = reason;
                            let response1 = {
                                code: '100',
                                status: 'failed',
                                type: 'text',
                                data: tempText
                            };
                            res.json(response1);
                        } else {

                            if (wanumber.length == 10) {
                                wanumber = '91' + wanumber;
                                console.log({ wanumber });
                            }
                            console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });


                            if (productName === null) {
                                productName = wb;
                                console.log({ productName });
                            }

                            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid,wapay_orderid, mobileno) VALUES (?,?,?,?,?,?,?,?)';
                            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
                            let s = await dbpool.query(query, values, (err, result) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            });

                            var config = {
                                method: 'post',
                                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetWhatsappPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                                headers: {
                                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                                }
                            };

                            try {
                                const response = await axios(config);
                                console.log(JSON.stringify(response.data));
                                let orderId = response.data.data[0].tr;
                                let reason = response.data.data[0].Reason;
                                console.log({ orderId, reason });


                                let query1 = 'UPDATE edcsdb.tbl_edcs_master SET wapay_orderid = ? WHERE requestid = ?';
                                let values1 = [orderId, productRequestId];
                                let s1 = await dbpool.query(query1, values1, (err, result1) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(result1);
                                    }
                                });


                                let result = {
                                    productretailerid: productRetailerid,
                                    productname: productName,
                                    productamount: parseInt(productAmount),
                                    productquantity: productQuantity,
                                    productorderid: orderId,
                                    productimageurl: productImageUrl

                                };
                                console.log({ result });

                                let response1 = {
                                    code: '200',
                                    status: 'success',
                                    type: 'non-catalog',
                                    data: result
                                };
                                res.json(response1);
                            }
                            catch (err) {
                                console.log(err);
                            }


                        }
                    } catch (err) {
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                        console.log(err);
                    }
                }
                else if (response.data.code === '200') {

                    let orderId = response.data.data[0].tr;
                    let reason = response.data.data[0].Reason;
                    console.log({ orderId, reason });


                    let query1 = 'UPDATE edcsdb.tbl_edcs_master SET wapay_orderid = ? WHERE requestid = ?';
                    let values1 = [orderId, productRequestId];
                    let s1 = await dbpool.query(query1, values1, (err, result1) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(result1);
                        }
                    });


                    let result = {
                        productretailerid: productRetailerid,
                        productname: productName,
                        productamount: parseInt(productAmount),
                        productquantity: productQuantity,
                        productorderid: orderId,
                        productimageurl: productImageUrl

                    };
                    console.log({ result });

                    let response1 = {
                        code: '200',
                        status: 'success',
                        type: 'non-catalog',
                        data: result
                    };
                    res.json(response1);
                }

            }
            catch (err) {
                console.log(err);
                let errRes = {
                    code: '100',
                    status: 'Failed',
                    data: 'Something went wrong'
                };
                res.json(errRes);
                console.log(err);
            }


        }
    });
});


// Template Message ----------------------------> Water Bill
router.post('/WB/FetchBillDetails/:WB/:RRNO/:wanumber/:templateid/:tempnumber', async (req, res) => {

    let wanumber = req.params.wanumber;
    let templateid = req.params.templateid;
    let tempnumber = req.params.tempnumber;

    if (wanumber.length == 10) {
        wanumber = '91' + wanumber;
        console.log({ wanumber });
    }
    if (tempnumber.length == 10) {
        tempnumber = '91' + tempnumber;
        console.log({ tempnumber });
    }

    let query = 'SELECT * FROM edcsdb.tbl_edcs_master where mobileno = ?';
    let values = [wanumber];
    let s = await dbpool.query(query, values, async (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log({ result });
            console.log(result[0].accountnumber);
            let productRetailerid = result[0].accountnumber;
            let productName = result[0].searchtype;
            let productAmount = result[0].billamount;
            let productQuantity = 1;
            let productRequestId = result[0].requestid;
            let productImageUrl = result[0].imageurl;
            // let orderIdInDB = result[0].orderid;

            // console.log({ orderIdInDB, productRequestId });
            console.log({ productRequestId });


            var config3 = {
                method: 'post',
                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                headers: {
                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                }
            };

            try {
                const response3 = await axios(config3);

                console.log(JSON.stringify(response3.data));


                if (response3.data.code === '100') {

                    let wb = req.params.WB;
                    console.log(wb);
                    let rrno = req.params.RRNO;
                    console.log(rrno);

                    let data = JSON.stringify({
                        RRNO: rrno
                    });
                    var config = {
                        method: 'post',
                        url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/' + wb + '/FetchBillDetails?RRNO=' + rrno,
                        headers: {
                            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                        },
                        data: data
                    };

                    // console.log({ url });
                    let tempText = null;

                    try {
                        const response = await axios(config);
                        // console.log({ response });
                        console.log(JSON.stringify(response.data));
                        let productRetailerid = response.data.data[0].AccountNumber;
                        let productName = response.data.data[0].SearchedType;
                        let productAmount = response.data.data[0].BillAmount;
                        let productQuantity = 1;
                        let productRequestId = response.data.data[0].RequestId;
                        let productImageUrl = response.data.data[0].ImageURL;

                        let reason = response.data.data[0].Reason;
                        console.log({ reason });
                        if (response.data.code === '100') {
                            tempText = reason;
                            let response1 = {
                                code: '100',
                                status: 'failed',
                                type: 'text',
                                data: tempText
                            };
                            res.json(response1);
                        } else {

                            if (wanumber.length == 10) {
                                wanumber = '91' + wanumber;
                                console.log({ wanumber });
                            }
                            console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });

                            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid,wapay_orderid, mobileno) VALUES (?,?,?,?,?,?,?,?)';
                            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
                            let s = await dbpool.query(query, values, (err, result) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            });

                            var config = {
                                method: 'post',
                                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                                headers: {
                                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                                }
                            };

                            try {
                                const response = await axios(config);
                                console.log(JSON.stringify(response.data));
                                let orderId = response.data.data[0].OrderId;
                                let reason = response.data.data[0].Reason;
                                console.log({ orderId, reason });

                                let query1 = 'UPDATE edcsdb.tbl_edcs_master SET orderid = ? WHERE requestid = ?';
                                let values1 = [orderId, productRequestId];
                                let s1 = await dbpool.query(query1, values1, (err, result1) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(result1);
                                    }
                                });

                                var data1 = JSON.stringify({
                                    "from": tempnumber,
                                    "to": wanumber,
                                    "type": "template",
                                    "message": {
                                        "templateid": templateid,
                                        "placeholders": [
                                            "water bill",
                                            productAmount
                                        ],
                                        "buttons": [
                                            {
                                                "index": 0,
                                                "type": "visit_website",
                                                "placeholder": orderId
                                            }
                                        ]
                                    }
                                });

                                var config1 = {
                                    method: 'post',
                                    url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
                                    headers: {
                                        'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
                                        'Content-Type': 'application/json'
                                    },
                                    data: data1
                                };
                                try {
                                    const response1 = await axios(config1);
                                    let response2 = {
                                        code: '200',
                                        status: 'success',
                                        type: 'text',
                                        data: orderId
                                    };
                                    res.json(response2);
                                } catch {
                                    console.log(err);
                                    let errRes = {
                                        code: '100',
                                        status: 'Failed',
                                        data: 'Something went wrong'
                                    };
                                    res.json(errRes);
                                }
                            }
                            catch (err) {
                                console.log(err);
                            }

                        }
                    } catch (err) {
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                        console.log(err);
                    }

                }
                else if (response3.data.code === '200') {
                    let orderId = response3.data.data[0].OrderId;
                    let reason = response3.data.data[0].Reason;
                    console.log({ orderId, reason });

                    let query1 = 'UPDATE edcsdb.tbl_edcs_master SET orderid = ? WHERE requestid = ?';
                    let values1 = [orderId, productRequestId];
                    let s1 = await dbpool.query(query1, values1, (err, result1) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(result1);
                        }
                    });

                    var data1 = JSON.stringify({
                        "from": tempnumber,
                        "to": wanumber,
                        "type": "template",
                        "message": {
                            "templateid": templateid,
                            "placeholders": [
                                "water bill",
                                productAmount
                            ],
                            "buttons": [
                                {
                                    "index": 0,
                                    "type": "visit_website",
                                    "placeholder": orderId
                                }
                            ]
                        }
                    });

                    var config1 = {
                        method: 'post',
                        url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
                        headers: {
                            'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
                            'Content-Type': 'application/json'
                        },
                        data: data1
                    };
                    try {
                        const response1 = await axios(config1);
                        let response2 = {
                            code: '200',
                            status: 'success',
                            type: 'text',
                            data: orderId
                        };
                        res.json(response2);
                    } catch {
                        console.log(err);
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                    }
                }
            }
            catch (err) {
                console.log(err);
                let errRes = {
                    code: '100',
                    status: 'Failed',
                    data: 'Something went wrong'
                };
                res.json(errRes);
            }


        }
    });
});


// BBMP Khata Payment
router.post('/khata/GetBillDetails/:gscno/:wanumber', async (req, res) => {
    let externalPaymentUrl = 'https://koneportal.cmsuat.co.in:1443/WhatsAppPayment/';

    let gscno = req.params.gscno;
    console.log({ gscno });

    let data = JSON.stringify({
        GSCNO: gscno,
    });

    let wanumber = req.params.wanumber;
    console.log({ wanumber });


    var config = {
        method: 'post',
        url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/BBMPKhatha/FetchBBMPKhataPayment?GSCNO=' + gscno,
        headers: {
            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
        },
        data: data
    };

    // console.log({ url });
    let tempText = null;


    try {
        const response = await axios(config);
        // console.log({ response });
        console.log(JSON.stringify(response.data));
        let productRetailerid = response.data.data[0].AccountNumber;
        let productName = response.data.data[0].SearchedType;
        let productAmount = response.data.data[0].BillAmount;
        let productQuantity = 1;
        let productRequestId = response.data.data[0].RequestId;
        let productImageUrl = response.data.data[0].ImageURL;

        let reason = response.data.data[0].Reason;
        console.log({ reason });
        if (response.data.code === '100') {
            tempText = reason;
            let response1 = {
                code: '100',
                status: 'failed',
                type: 'text',
                data: tempText
            };
            res.json(response1);
        } else {

            if (wanumber.length == 10) {
                wanumber = '91' + wanumber;
                console.log({ wanumber });
            }
            console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });


            if (productName === null) {
                productName = "Khata Transfer";
                console.log({ productName });
            }

            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid,wapay_orderid, mobileno) VALUES (?,?,?,?,?,?,?,?)';
            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
            let s = await dbpool.query(query, values, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                }
            });

            tempText = 'Dear User,\nYour Khata Transfer bill of Rs.' + response.data.data[0].BillAmount + ' is generated.\n';
            // tempText += 'To pay it, click on below link \n\n';
            // tempText += externalPaymentUrl + response.data.data[0].RequestId + '/' + wanumber;
            let response1 = {
                code: '200',
                status: 'success',
                type: 'text',
                data: tempText
            };
            res.json(response1);
        }
    }
    catch (err) {
        console.log(err);
        let errRes = {
            code: '100',
            status: 'Failed',
            data: 'Something went wrong'
        };
        res.json(errRes);
    }

});

// BBMP Khata  Payment ----------------------------> Razorpay Integration for WAPAY
router.post('/khata/FetchBillDetails/:gscno/:wanumber', async (req, res) => {

    let wanumber = req.params.wanumber;

    if (wanumber.length == 10) {
        wanumber = '91' + wanumber;
        console.log({ wanumber });
    }


    let query = 'SELECT * FROM edcsdb.tbl_edcs_master where mobileno = ?';
    let values = [wanumber];
    let s = await dbpool.query(query, values, async (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log({ result });
            console.log(result[0].accountnumber);
            let productRetailerid = result[0].accountnumber;
            let productName = result[0].searchtype;
            let productAmount = result[0].billamount;
            let productQuantity = 1;
            let productRequestId = result[0].requestid;
            let productImageUrl = result[0].imageurl;
            let orderIdInDB = result[0].wapay_orderid;

            console.log({ orderIdInDB, productRequestId });


            var config = {
                method: 'post',
                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetWhatsappPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                headers: {
                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                }
            };


            try {
                const response = await axios(config);
                // console.log({ response });
                console.log(JSON.stringify(response.data));


                if (response.data.code === '100') {

                    let gscno = req.params.gscno;
                    console.log({ gscno });

                    let data = JSON.stringify({
                        GSCNO: gscno,
                    });


                    var config = {
                        method: 'post',
                        url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/BBMPKhatha/FetchBBMPKhataPayment?GSCNO=' + gscno,
                        headers: {
                            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                        },
                        data: data
                    };

                    // console.log({ url });
                    let tempText = null;

                    try {
                        const response = await axios(config);
                        // console.log({ response });
                        console.log(JSON.stringify(response.data));
                        let productRetailerid = response.data.data[0].AccountNumber;
                        let productName = response.data.data[0].SearchedType;
                        let productAmount = response.data.data[0].BillAmount;
                        let productQuantity = 1;
                        let productRequestId = response.data.data[0].RequestId;
                        let productImageUrl = response.data.data[0].ImageURL;

                        let reason = response.data.data[0].Reason;
                        console.log({ reason });
                        if (response.data.code === '100') {
                            tempText = reason;
                            let response1 = {
                                code: '100',
                                status: 'failed',
                                type: 'text',
                                data: tempText
                            };
                            res.json(response1);
                        } else {

                            if (wanumber.length == 10) {
                                wanumber = '91' + wanumber;
                                console.log({ wanumber });
                            }
                            console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });


                            if (productName === null) {
                                productName = "Khata Transfer";;
                                console.log({ productName });
                            }

                            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid,wapay_orderid, mobileno) VALUES (?,?,?,?,?,?,?,?)';
                            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
                            let s = await dbpool.query(query, values, (err, result) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            });

                            var config = {
                                method: 'post',
                                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetWhatsappPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                                headers: {
                                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                                }
                            };

                            try {
                                const response = await axios(config);
                                console.log(JSON.stringify(response.data));
                                let orderId = response.data.data[0].tr;
                                let reason = response.data.data[0].Reason;
                                console.log({ orderId, reason });


                                let query1 = 'UPDATE edcsdb.tbl_edcs_master SET wapay_orderid = ? WHERE requestid = ?';
                                let values1 = [orderId, productRequestId];
                                let s1 = await dbpool.query(query1, values1, (err, result1) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(result1);
                                    }
                                });


                                let result = {
                                    productretailerid: productRetailerid,
                                    productname: productName,
                                    productamount: parseInt(productAmount),
                                    productquantity: productQuantity,
                                    productorderid: orderId,
                                    productimageurl: productImageUrl

                                };
                                console.log({ result });

                                let response1 = {
                                    code: '200',
                                    status: 'success',
                                    type: 'non-catalog',
                                    data: result
                                };
                                res.json(response1);
                            }
                            catch (err) {
                                console.log(err);
                            }
                        }
                    }
                    catch (err) {
                        console.log(err);
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                    }

                }
                else if (response.data.code === '200') {
                    let orderId = response.data.data[0].tr;
                    let reason = response.data.data[0].Reason;
                    console.log({ orderId, reason });


                    let query1 = 'UPDATE edcsdb.tbl_edcs_master SET wapay_orderid = ? WHERE requestid = ?';
                    let values1 = [orderId, productRequestId];
                    let s1 = await dbpool.query(query1, values1, (err, result1) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(result1);
                        }
                    });


                    let result = {
                        productretailerid: productRetailerid,
                        productname: productName,
                        productamount: parseInt(productAmount),
                        productquantity: productQuantity,
                        productorderid: orderId,
                        productimageurl: productImageUrl

                    };
                    console.log({ result });

                    let response1 = {
                        code: '200',
                        status: 'success',
                        type: 'non-catalog',
                        data: result
                    };
                    res.json(response1);
                }

            }
            catch (err) {
                console.log(err);
                let errRes = {
                    code: '100',
                    status: 'Failed',
                    data: 'Something went wrong'
                };
                res.json(errRes);
                console.log(err);
            }


        }
    });
});


// Template Message ----------------------------> Khata Bill
router.post('/khata/FetchBillDetails/:gscno/:wanumber/:templateid/:tempnumber', async (req, res) => {

    let wanumber = req.params.wanumber;
    let templateid = req.params.templateid;
    let tempnumber = req.params.tempnumber;

    if (wanumber.length == 10) {
        wanumber = '91' + wanumber;
        console.log({ wanumber });
    }
    if (tempnumber.length == 10) {
        tempnumber = '91' + tempnumber;
        console.log({ tempnumber });
    }

    let query = 'SELECT * FROM edcsdb.tbl_edcs_master where mobileno = ?';
    let values = [wanumber];
    let s = await dbpool.query(query, values, async (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log({ result });
            console.log(result[0].accountnumber);
            let productRetailerid = result[0].accountnumber;
            let productName = result[0].searchtype;
            let productAmount = result[0].billamount;
            let productQuantity = 1;
            let productRequestId = result[0].requestid;
            let productImageUrl = result[0].imageurl;
            // let orderIdInDB = result[0].orderid;

            // console.log({ orderIdInDB, productRequestId });
            console.log({ productRequestId });


            var config3 = {
                method: 'post',
                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                headers: {
                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                }
            };

            try {
                const response3 = await axios(config3);

                console.log(JSON.stringify(response3.data));


                if (response3.data.code === '100') {

                    let gscno = req.params.gscno;
                    console.log({ gscno });

                    let data = JSON.stringify({
                        GSCNO: gscno,
                    });


                    var config = {
                        method: 'post',
                        url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/BBMPKhatha/FetchBBMPKhataPayment?GSCNO=' + gscno,
                        headers: {
                            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                        },
                        data: data
                    };

                    // console.log({ url });
                    let tempText = null;

                    try {
                        const response = await axios(config);
                        // console.log({ response });
                        console.log(JSON.stringify(response.data));
                        let productRetailerid = response.data.data[0].AccountNumber;
                        let productName = response.data.data[0].SearchedType;
                        let productAmount = response.data.data[0].BillAmount;
                        let productQuantity = 1;
                        let productRequestId = response.data.data[0].RequestId;
                        let productImageUrl = response.data.data[0].ImageURL;

                        let reason = response.data.data[0].Reason;
                        console.log({ reason });
                        if (response.data.code === '100') {
                            tempText = reason;
                            let response1 = {
                                code: '100',
                                status: 'failed',
                                type: 'text',
                                data: tempText
                            };
                            res.json(response1);
                        } else {

                            if (wanumber.length == 10) {
                                wanumber = '91' + wanumber;
                                console.log({ wanumber });
                            }
                            console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });

                            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid,wapay_orderid, mobileno) VALUES (?,?,?,?,?,?,?,?)';
                            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
                            let s = await dbpool.query(query, values, (err, result) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            });

                            var config = {
                                method: 'post',
                                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                                headers: {
                                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                                }
                            };

                            try {
                                const response = await axios(config);
                                console.log(JSON.stringify(response.data));
                                let orderId = response.data.data[0].OrderId;
                                let reason = response.data.data[0].Reason;
                                console.log({ orderId, reason });

                                let query1 = 'UPDATE edcsdb.tbl_edcs_master SET orderid = ? WHERE requestid = ?';
                                let values1 = [orderId, productRequestId];
                                let s1 = await dbpool.query(query1, values1, (err, result1) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(result1);
                                    }
                                });

                                var data1 = JSON.stringify({
                                    "from": tempnumber,
                                    "to": wanumber,
                                    "type": "template",
                                    "message": {
                                        "templateid": templateid,
                                        "placeholders": [
                                            "khata transfer bill",
                                            productAmount
                                        ],
                                        "buttons": [
                                            {
                                                "index": 0,
                                                "type": "visit_website",
                                                "placeholder": orderId
                                            }
                                        ]
                                    }
                                });

                                var config1 = {
                                    method: 'post',
                                    url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
                                    headers: {
                                        'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
                                        'Content-Type': 'application/json'
                                    },
                                    data: data1
                                };
                                try {
                                    const response1 = await axios(config1);
                                    let response2 = {
                                        code: '200',
                                        status: 'success',
                                        type: 'text',
                                        data: orderId
                                    };
                                    res.json(response2);
                                } catch {
                                    console.log(err);
                                    let errRes = {
                                        code: '100',
                                        status: 'Failed',
                                        data: 'Something went wrong'
                                    };
                                    res.json(errRes);
                                }
                            }
                            catch (err) {
                                console.log(err);
                            }

                        }
                    } catch (err) {
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                        console.log(err);
                    }

                }
                else if (response3.data.code === '200') {
                    let orderId = response3.data.data[0].OrderId;
                    let reason = response3.data.data[0].Reason;
                    console.log({ orderId, reason });

                    let query1 = 'UPDATE edcsdb.tbl_edcs_master SET orderid = ? WHERE requestid = ?';
                    let values1 = [orderId, productRequestId];
                    let s1 = await dbpool.query(query1, values1, (err, result1) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(result1);
                        }
                    });

                    var data1 = JSON.stringify({
                        "from": tempnumber,
                        "to": wanumber,
                        "type": "template",
                        "message": {
                            "templateid": templateid,
                            "placeholders": [
                                "khata transfer bill",
                                productAmount
                            ],
                            "buttons": [
                                {
                                    "index": 0,
                                    "type": "visit_website",
                                    "placeholder": orderId
                                }
                            ]
                        }
                    });

                    var config1 = {
                        method: 'post',
                        url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
                        headers: {
                            'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
                            'Content-Type': 'application/json'
                        },
                        data: data1
                    };
                    try {
                        const response1 = await axios(config1);
                        let response2 = {
                            code: '200',
                            status: 'success',
                            type: 'text',
                            data: orderId
                        };
                        res.json(response2);
                    } catch {
                        console.log(err);
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                    }
                }
            }
            catch (err) {
                console.log(err);
                let errRes = {
                    code: '100',
                    status: 'Failed',
                    data: 'Something went wrong'
                };
                res.json(errRes);
            }


        }
    });
});



// RC Extract
router.post('/rcextract/GetBillDetails/:regno/:wanumber', async (req, res) => {
    let externalPaymentUrl = 'https://koneportal.cmsuat.co.in:1443/WhatsAppPayment/';

    let regno = req.params.regno;
    console.log({ regno });

    let wanumber = req.params.wanumber;
    console.log({ wanumber });

    let data = JSON.stringify({
        REGNO: regno,
    });

    var config = {
        method: 'post',
        url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/RCExtract/FetchRCExtract?RegNo=' + regno,
        headers: {
            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
        },
        data: data
    };

    // console.log({ url });
    let tempText = null;


    try {
        const response = await axios(config);
        // console.log({ response });
        console.log(JSON.stringify(response.data));
        let productRetailerid = response.data.data[0].AccountNumber;
        let productName = response.data.data[0].SearchedType;
        let productAmount = response.data.data[0].BillAmount;
        let productQuantity = 1;
        let productRequestId = response.data.data[0].RequestId;
        let productImageUrl = response.data.data[0].ImageURL;

        let reason = response.data.data[0].Reason;
        console.log({ reason });
        if (response.data.code === '100') {
            tempText = reason;
            let response1 = {
                code: '100',
                status: 'failed',
                type: 'text',
                data: tempText
            };
            res.json(response1);
        } else {

            if (wanumber.length == 10) {
                wanumber = '91' + wanumber;
                console.log({ wanumber });
            }
            console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });


            if (productName === null) {
                productName = "RC Extract";
                console.log({ productName });
            }

            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid, wapay_orderid,mobileno) VALUES (?,?,?,?,?,?,?,?)';
            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
            let s = await dbpool.query(query, values, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                }
            });

            tempText = 'Dear User,\nYour RC Extract bill of Rs.' + response.data.data[0].BillAmount + ' is generated.\n';
            // tempText += 'To pay it, click on below link \n\n';
            // tempText += externalPaymentUrl + response.data.data[0].RequestId + '/' + wanumber;
            let response1 = {
                code: '200',
                status: 'success',
                type: 'text',
                data: tempText
            };
            res.json(response1);
        }
    }
    catch (err) {
        console.log(err);
        let errRes = {
            code: '100',
            status: 'Failed',
            data: 'Something went wrong'
        };
        res.json(errRes);
    }

});

// RC Extract  Payment ----------------------------> Razorpay Integration for WAPAY
router.post('/rcextract/FetchBillDetails/:regno/:wanumber', async (req, res) => {



    let wanumber = req.params.wanumber;

    if (wanumber.length == 10) {
        wanumber = '91' + wanumber;
        console.log({ wanumber });
    }


    let query = 'SELECT * FROM edcsdb.tbl_edcs_master where mobileno = ?';
    let values = [wanumber];
    let s = await dbpool.query(query, values, async (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log({ result });
            console.log(result[0].accountnumber);
            let productRetailerid = result[0].accountnumber;
            let productName = result[0].searchtype;
            let productAmount = result[0].billamount;
            let productQuantity = 1;
            let productRequestId = result[0].requestid;
            let productImageUrl = result[0].imageurl;
            // let orderIdInDB = result[0].wapay_orderid;

            // console.log({ orderIdInDB, productRequestId });
            console.log({ productRequestId });


            var config = {
                method: 'post',
                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetWhatsappPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                headers: {
                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                }
            };


            try {
                const response = await axios(config);
                // console.log({ response });
                console.log(JSON.stringify(response.data));



                if (response.data.code === '100') {

                    let regno = req.params.regno;
                    console.log({ regno });



                    let data = JSON.stringify({
                        REGNO: regno,
                    });

                    var config = {
                        method: 'post',
                        url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/RCExtract/FetchRCExtract?RegNo=' + regno,
                        headers: {
                            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                        },
                        data: data
                    };

                    // console.log({ url });
                    let tempText = null;


                    try {
                        const response = await axios(config);
                        // console.log({ response });
                        console.log(JSON.stringify(response.data));
                        let productRetailerid = response.data.data[0].AccountNumber;
                        let productName = response.data.data[0].SearchedType;
                        let productAmount = response.data.data[0].BillAmount;
                        let productQuantity = 1;
                        let productRequestId = response.data.data[0].RequestId;
                        let productImageUrl = response.data.data[0].ImageURL;

                        let reason = response.data.data[0].Reason;
                        console.log({ reason });
                        if (response.data.code === '100') {
                            tempText = reason;
                            let response1 = {
                                code: '100',
                                status: 'failed',
                                type: 'text',
                                data: tempText
                            };
                            res.json(response1);
                        } else {

                            if (wanumber.length == 10) {
                                wanumber = '91' + wanumber;
                                console.log({ wanumber });
                            }
                            console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });


                            if (productName === null) {
                                productName = "RC Extract";
                                console.log({ productName });
                            }

                            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid, wapay_orderid,mobileno) VALUES (?,?,?,?,?,?,?,?)';
                            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
                            let s = await dbpool.query(query, values, (err, result) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            });

                            var config = {
                                method: 'post',
                                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetWhatsappPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                                headers: {
                                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                                }
                            };

                            try {
                                const response = await axios(config);
                                console.log(JSON.stringify(response.data));
                                let orderId = response.data.data[0].tr;
                                let reason = response.data.data[0].Reason;
                                console.log({ orderId, reason });


                                let query1 = 'UPDATE edcsdb.tbl_edcs_master SET wapay_orderid = ? WHERE requestid = ?';
                                let values1 = [orderId, productRequestId];
                                let s1 = await dbpool.query(query1, values1, (err, result1) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(result1);
                                    }
                                });


                                let result = {
                                    productretailerid: productRetailerid,
                                    productname: productName,
                                    productamount: parseInt(productAmount),
                                    productquantity: productQuantity,
                                    productorderid: orderId,
                                    productimageurl: productImageUrl

                                };
                                console.log({ result });

                                let response1 = {
                                    code: '200',
                                    status: 'success',
                                    type: 'non-catalog',
                                    data: result
                                };
                                res.json(response1);
                            }
                            catch (err) {
                                console.log(err);
                            }
                        }

                    }
                    catch (err) {
                        console.log(err);
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                    }

                }
                else if (response.data.code === '200') {
                    let orderId = response.data.data[0].tr;
                    let reason = response.data.data[0].Reason;
                    console.log({ orderId, reason });


                    let query1 = 'UPDATE edcsdb.tbl_edcs_master SET wapay_orderid = ? WHERE requestid = ?';
                    let values1 = [orderId, productRequestId];
                    let s1 = await dbpool.query(query1, values1, (err, result1) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(result1);
                        }
                    });


                    let result = {
                        productretailerid: productRetailerid,
                        productname: productName,
                        productamount: parseInt(productAmount),
                        productquantity: productQuantity,
                        productorderid: orderId,
                        productimageurl: productImageUrl

                    };
                    console.log({ result });

                    let response1 = {
                        code: '200',
                        status: 'success',
                        type: 'non-catalog',
                        data: result
                    };
                    res.json(response1);
                }


            }
            catch (err) {
                console.log(err);
                let errRes = {
                    code: '100',
                    status: 'Failed',
                    data: 'Something went wrong'
                };
                res.json(errRes);
                console.log(err);
            }


        }
    });
});


// Template Message ---------------------------->  RC Extract
router.post('/rcextract/FetchBillDetails/:regno/:wanumber/:templateid/:tempnumber', async (req, res) => {

    let wanumber = req.params.wanumber;
    let templateid = req.params.templateid;
    let tempnumber = req.params.tempnumber;

    if (wanumber.length == 10) {
        wanumber = '91' + wanumber;
        console.log({ wanumber });
    }
    if (tempnumber.length == 10) {
        tempnumber = '91' + tempnumber;
        console.log({ tempnumber });
    }

    let query = 'SELECT * FROM edcsdb.tbl_edcs_master where mobileno = ?';
    let values = [wanumber];
    let s = await dbpool.query(query, values, async (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log({ result });
            console.log(result[0].accountnumber);
            let productRetailerid = result[0].accountnumber;
            let productName = result[0].searchtype;
            let productAmount = result[0].billamount;
            let productQuantity = 1;
            let productRequestId = result[0].requestid;
            let productImageUrl = result[0].imageurl;
            // let orderIdInDB = result[0].orderid;

            // console.log({ orderIdInDB, productRequestId });
            console.log({ productRequestId });


            var config3 = {
                method: 'post',
                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                headers: {
                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                }
            };

            try {
                const response3 = await axios(config3);

                console.log(JSON.stringify(response3.data));


                if (response3.data.code === '100') {

                    let regno = req.params.regno;
                    console.log({ regno });



                    let data = JSON.stringify({
                        REGNO: regno,
                    });

                    var config = {
                        method: 'post',
                        url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/RCExtract/FetchRCExtract?RegNo=' + regno,
                        headers: {
                            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                        },
                        data: data
                    };

                    // console.log({ url });
                    let tempText = null;

                    try {
                        const response = await axios(config);
                        // console.log({ response });
                        console.log(JSON.stringify(response.data));
                        let productRetailerid = response.data.data[0].AccountNumber;
                        let productName = response.data.data[0].SearchedType;
                        let productAmount = response.data.data[0].BillAmount;
                        let productQuantity = 1;
                        let productRequestId = response.data.data[0].RequestId;
                        let productImageUrl = response.data.data[0].ImageURL;

                        let reason = response.data.data[0].Reason;
                        console.log({ reason });
                        if (response.data.code === '100') {
                            tempText = reason;
                            let response1 = {
                                code: '100',
                                status: 'failed',
                                type: 'text',
                                data: tempText
                            };
                            res.json(response1);
                        } else {

                            if (wanumber.length == 10) {
                                wanumber = '91' + wanumber;
                                console.log({ wanumber });
                            }
                            console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });

                            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid,wapay_orderid, mobileno) VALUES (?,?,?,?,?,?,?,?)';
                            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
                            let s = await dbpool.query(query, values, (err, result) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            });

                            var config = {
                                method: 'post',
                                url: 'https://k1api.karnatakaone.gov.in/WhatsAppAPI/api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                                headers: {
                                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                                }
                            };

                            try {
                                const response = await axios(config);
                                console.log(JSON.stringify(response.data));
                                let orderId = response.data.data[0].OrderId;
                                let reason = response.data.data[0].Reason;
                                console.log({ orderId, reason });

                                let query1 = 'UPDATE edcsdb.tbl_edcs_master SET orderid = ? WHERE requestid = ?';
                                let values1 = [orderId, productRequestId];
                                let s1 = await dbpool.query(query1, values1, (err, result1) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(result1);
                                    }
                                });

                                var data1 = JSON.stringify({
                                    "from": tempnumber,
                                    "to": wanumber,
                                    "type": "template",
                                    "message": {
                                        "templateid": templateid,
                                        "placeholders": [
                                            "RC Extract bill",
                                            productAmount
                                        ],
                                        "buttons": [
                                            {
                                                "index": 0,
                                                "type": "visit_website",
                                                "placeholder": orderId
                                            }
                                        ]
                                    }
                                });

                                var config1 = {
                                    method: 'post',
                                    url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
                                    headers: {
                                        'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
                                        'Content-Type': 'application/json'
                                    },
                                    data: data1
                                };
                                try {
                                    const response1 = await axios(config1);
                                    let response2 = {
                                        code: '200',
                                        status: 'success',
                                        type: 'text',
                                        data: orderId
                                    };
                                    res.json(response2);
                                } catch {
                                    console.log(err);
                                    let errRes = {
                                        code: '100',
                                        status: 'Failed',
                                        data: 'Something went wrong'
                                    };
                                    res.json(errRes);
                                }
                            }
                            catch (err) {
                                console.log(err);
                            }

                        }
                    } catch (err) {
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                        console.log(err);
                    }

                }
                else if (response3.data.code === '200') {
                    let orderId = response3.data.data[0].OrderId;
                    let reason = response3.data.data[0].Reason;
                    console.log({ orderId, reason });

                    let query1 = 'UPDATE edcsdb.tbl_edcs_master SET orderid = ? WHERE requestid = ?';
                    let values1 = [orderId, productRequestId];
                    let s1 = await dbpool.query(query1, values1, (err, result1) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(result1);
                        }
                    });

                    var data1 = JSON.stringify({
                        "from": tempnumber,
                        "to": wanumber,
                        "type": "template",
                        "message": {
                            "templateid": templateid,
                            "placeholders": [
                                "RC Extract bill",
                                productAmount
                            ],
                            "buttons": [
                                {
                                    "index": 0,
                                    "type": "visit_website",
                                    "placeholder": orderId
                                }
                            ]
                        }
                    });

                    var config1 = {
                        method: 'post',
                        url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
                        headers: {
                            'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
                            'Content-Type': 'application/json'
                        },
                        data: data1
                    };
                    try {
                        const response1 = await axios(config1);
                        let response2 = {
                            code: '200',
                            status: 'success',
                            type: 'text',
                            data: orderId
                        };
                        res.json(response2);
                    } catch {
                        console.log(err);
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                    }
                }
            }
            catch (err) {
                console.log(err);
                let errRes = {
                    code: '100',
                    status: 'Failed',
                    data: 'Something went wrong'
                };
                res.json(errRes);
            }


        }
    });
});



// ==================================================================== EDCS NEW 

// Karnataka One Traffic Violation ------------------------> fetching Traffic Fine payment for both Registration Number and Notice Number
router.post('/Traffic/TrafficViolationDetails/:ServiceType/:SearchType/:referenceNumber/:wanumber', async (req, res) => {
    let ServiceType = req.params.ServiceType;
    let SearchType = req.params.SearchType;
    let wanumber = req.params.wanumber;
    let referenceNumber = req.params.referenceNumber;
    console.log({ wanumber, ServiceType, SearchType, referenceNumber });
    let data = JSON.stringify({
        ServiceType: ServiceType,
        SearchType: SearchType,
        SearchValue: referenceNumber
    });

    var config = {
        method: 'post',

        url: `https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/api/TrafficPoliceFine/FetchBSPPoliceFine?ServiceType=${ServiceType}&SearchType=${SearchType}&SearchValue=${referenceNumber}`,
        headers: {
            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
        },
        data: data
    };

    // console.log({ url });
    let tempText = null;

    try {
        const response = await axios(config);
        console.log(" response-------------------", JSON.stringify(response.data));

        if (response.data.TotalFineAmount < 0) {
            tempText = "No traffic violation found for the vehicle Register number.";
            let response1 = {
                code: '100',
                status: 'failed',
                type: 'text',
                data: tempText
            };
            return res.json(response1);
        }

        let productRetailerid = referenceNumber;
        let productName = SearchType;
        let productAmount = response.data.TotalFineAmount;
        let productQuantity = 1;
        let productRequestId = response.data.RequestId;
        let productImageUrl = response.data.ServiceImage;
        let reason = response.data.data[0][0].Reason;
        console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });

        if (response.data.code === '100') {
            Reason = response.data.data[0].Reason;
            tempText = Reason;
            let response1 = {
                code: '100',
                status: 'failed',
                type: 'text',
                data: tempText
            };
            return res.json(response1);

        } else {
            if (wanumber.length == 10) {
                wanumber = '91' + wanumber;
                console.log({ wanumber });
            }

            let noticeArr = [];

            for (let i = 0; i < response.data.data[0].length; i++) {
                noticeNo = response.data.data[0][i].NoticeNo;
                ImageURL = response.data.data[0][i].ImageURL;
                Amount = response.data.data[0][i].Amount;
                noticeArr.push("\n➡️ notice no.: " + noticeNo + "\n Amount: " + Amount + "\nClick on below link to view image: " + ImageURL + "\n");
            }
            // console.log({ noticeArr });
            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid,wapay_orderid, mobileno) VALUES (?,?,?,?,?,?,?,?)';
            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
            let s = await dbpool.query(query, values, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                }
            });
            tempText = 'Dear User,\nYour Traffic fine of Rs.' + productAmount + '\n is generated for traffic violation 👇' + noticeArr;

            let response1 = {
                code: '200',
                status: 'success',
                type: 'text',
                url: productImageUrl,
                data: tempText
            };
            return res.json(response1);
        }

    } catch (err) {
        console.log(err);
        let errRes = {
            code: '100',
            status: 'Failed',
            data: 'Something went wrong'
        };
        return res.json(errRes);
    }
});

// Karnataka One Traffic Violation ------------------------> fetching Image for both Registration Number and Notice Number
router.post('/Traffic/TrafficViolationImage/:ServiceType/:SearchType/:referenceNumber/:wanumber', async (req, res) => {
    let ServiceType = req.params.ServiceType;
    let SearchType = req.params.SearchType;
    let wanumber = req.params.wanumber;
    let referenceNumber = req.params.referenceNumber;
    console.log({ wanumber, ServiceType, SearchType, referenceNumber });
    let data = JSON.stringify({
        ServiceType: ServiceType,
        SearchType: SearchType,
        SearchValue: referenceNumber
    });

    var config = {
        method: 'post',

        url: `https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/api/TrafficPoliceFine/FetchBSPPoliceFine?ServiceType=${ServiceType}&SearchType=${SearchType}&SearchValue=${referenceNumber}`,
        headers: {
            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
        },
        data: data
    };

    let tempText = null;

    try {
        const response = await axios(config);

        // console.log(" response-------------------", JSON.stringify(response.data));

        if (response.data.TotalFineAmount < 0) {
            tempText = "No traffic violation found for the vehicle Notice number.";
            let response1 = {
                code: '100',
                status: 'failed',
                type: 'text',
                data: tempText
            };
            return res.json(response1);
        }
        let productRetailerid = referenceNumber;
        let productName = SearchType;
        let productAmount = response.data.TotalFineAmount;
        let productQuantity = 1;
        let productRequestId = response.data.RequestId;
        let productImageUrl = response.data.ServiceImage;

        let reason = response.data.data[0][0].Reason;

        console.log({ reason });

        console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });

        if (response.data.code === '100') {

            tempText = Reason;
            let response1 = {
                code: '100',
                status: 'failed',
                type: 'text',
                data: tempText
            };
            return res.json(response1);

        } else {
            if (wanumber.length == 10) {
                wanumber = '91' + wanumber;
                console.log({ wanumber });
            }

            let image = response.data.data[0][0].ImageURL;
            let Amount = response.data.data[0][0].Amount;

            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid,wapay_orderid, mobileno) VALUES (?,?,?,?,?,?,?,?)';
            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
            let s = await dbpool.query(query, values, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                }
            });

            for (let i = 0; i < response.data.data[0].length; i++) {
                if (response.data.data[0][i].NoticeNo === referenceNumber) {
                    // tempText = 'Dear User,\nYour Traffic fine of Rs.' + response.data.data[0][i].Amount + '\nis generated for notice no.: ' + referenceNumber + " for traffic violation. \nClick on below link to view image:👇 " + image + '\n';
                    if (image == '') {
                        tempText = 'Dear User,\nYour Traffic fine of Rs.' + response.data.data[0][i].Amount + '\nis generated for notice no.: ' + referenceNumber + " for traffic violation." + '\n';
                    } else {
                        tempText = 'Dear User,\nYour Traffic fine of Rs.' + response.data.data[0][i].Amount + '\nis generated for notice no.: ' + referenceNumber + " for traffic violation. \nClick on below link to view image:👇 " + image + '\n';
                    }

                    let response1 = {
                        code: 200,
                        status: "success",
                        type: "image",
                        url: productImageUrl,
                        data: tempText
                    };
                    return res.json(response1);
                }
            }



        }

    } catch (err) {
        console.log(err);
        let errRes = {
            code: '100',
            status: 'Failed',
            data: 'Something went wrong'
        };
        return res.json(errRes);
    }
});


// Karnataka One Traffic Violation----------------------------> Razorpay Integration WAPAY for both Registration Number and Notice Number
router.post('/Traffic/TrafficViolationWAPAY/:ServiceType/:SearchType/:referenceNumber/:wanumber', async (req, res) => {
    let wanumber = req.params.wanumber;
    console.log({ wanumber });
    // let tempnumber = req.params.tempnumber;

    let ServiceType = req.params.ServiceType;
    let SearchType = req.params.SearchType;
    let referenceNumber = req.params.referenceNumber;


    if (wanumber.length == 10) {
        wanumber = '91' + wanumber;
        console.log({ wanumber });
    }

    let query = 'SELECT * FROM edcsdb.tbl_edcs_master where mobileno = ? AND searchtype = ?';
    let values = [wanumber, SearchType];
    let s = await dbpool.query(query, values, async (err, result) => {
        if (err) {
            console.log(err);
        } else {
            // console.log({ result });
            // console.log(result[0].accountnumber);
            // let productRetailerid = result[0].accountnumber;
            let productName = result[0].searchtype;
            let productAmount = result[0].billamount;
            let productQuantity = 1;
            let productRequestId = result[0].requestid;
            let productImageUrl = result[0].imageurl;
            // let orderIdInDB = result[0].wapay_orderid;

            // console.log({ orderIdInDB, productRequestId });
            console.log({ productRequestId });


            var config = {
                method: 'post',
                url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/Api/Payment/GetWhatsappPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                headers: {
                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                }
            };

            try {
                const response = await axios(config);
                // console.log({ response });
                console.log(response.data);


                if (response.data.code === '100') {


                    console.log({ wanumber, ServiceType, SearchType, referenceNumber });
                    let data = JSON.stringify({
                        ServiceType: ServiceType,
                        SearchType: SearchType,
                        SearchValue: referenceNumber
                    });

                    var config = {
                        method: 'post',
                        url: `https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/api/TrafficPoliceFine/FetchBSPPoliceFine?ServiceType=${ServiceType}&SearchType=${SearchType}&SearchValue=${referenceNumber}`,
                        headers: {
                            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                        },
                        data: data
                    };

                    // console.log({ url });
                    let tempText = null;

                    try {
                        const response = await axios(config);
                        // console.log({ response });
                        console.log(JSON.stringify(response.data));
                        let productRetailerid = referenceNumber;
                        let productName = SearchType;
                        let productAmount = response.data.TotalFineAmount;
                        let productQuantity = 1;
                        let productRequestId = response.data.RequestId;
                        let productImageUrl = response.data.ServiceImage;

                        let reason = response.data.data[0][0].Reason;
                        console.log({ reason });
                        if (response.data.code === '100') {
                            tempText = reason;
                            let response1 = {
                                code: '100',
                                status: 'failed',
                                type: 'text',
                                data: tempText
                            };
                            res.json(response1);
                        } else {

                            if (wanumber.length == 10) {
                                wanumber = '91' + wanumber;
                                console.log({ wanumber });
                            }
                            console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });


                            if (productName === null) {
                                productName = searchValue;
                                console.log({ productName });
                            }

                            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid,wapay_orderid, mobileno) VALUES (?,?,?,?,?,?,?,?)';
                            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
                            let s = await dbpool.query(query, values, (err, result) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            });

                            var config = {
                                method: 'post',
                                url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/Api/Payment/GetWhatsappPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                                headers: {
                                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                                }
                            };

                            try {
                                const response = await axios(config);
                                console.log(JSON.stringify(response.data));
                                let orderId = response.data.data[0].tr;
                                let reason = response.data.data[0].Reason;
                                console.log({ orderId, reason });


                                let query1 = 'UPDATE edcsdb.tbl_edcs_master SET wapay_orderid = ? WHERE requestid = ?';
                                let values1 = [orderId, productRequestId];
                                let s1 = await dbpool.query(query1, values1, (err, result1) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(result1);
                                    }
                                });


                                let result = {
                                    productretailerid: productRetailerid,
                                    productname: "Traffic Violation",
                                    productamount: parseInt(productAmount),
                                    productquantity: productQuantity,
                                    productorderid: orderId,
                                    productimageurl: productImageUrl

                                };
                                console.log({ result });

                                let response1 = {
                                    code: '200',
                                    status: 'success',
                                    type: 'non-catalog',
                                    data: result
                                };
                                res.json(response1);
                            }
                            catch (err) {
                                console.log(err);
                            }

                        }
                    } catch (err) {
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                        console.log(err);
                    }
                }
                else if (response.data.code === '200') {
                    let productRetailerid = referenceNumber;
                    console.log(JSON.stringify(response.data));
                    let orderId = response.data.data[0].tr;
                    let reason = response.data.data[0].Reason;
                    console.log({ orderId, reason });


                    let query1 = 'UPDATE edcsdb.tbl_edcs_master SET wapay_orderid = ? WHERE requestid = ?';
                    let values1 = [orderId, productRequestId];
                    let s1 = await dbpool.query(query1, values1, (err, result1) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(result1);
                        }
                    });


                    let result = {
                        productretailerid: productRetailerid,
                        productname: "Traffic Violation",
                        productamount: parseInt(productAmount),
                        productquantity: productQuantity,
                        productorderid: orderId,
                        productimageurl: productImageUrl

                    };
                    console.log({ result });

                    let response1 = {
                        code: '200',
                        status: 'success',
                        type: 'non-catalog',
                        data: result
                    };
                    res.json(response1);
                }
            }
            catch (err) {
                console.log(err);
                let errRes = {
                    code: '100',
                    status: 'Failed',
                    data: 'Something went wrong'
                };
                res.json(errRes);
                console.log(err);
            }

        }
    });
});



// Karnataka One Traffic Violation ----------------------------> Traffic Violation Bill External Payment for both Registration Number and Notice Number
router.post('/Traffic/TrafficViolationKarnatakaOne/:ServiceType/:SearchType/:referenceNumber/:wanumber/:templateid/:tempnumber', async (req, res) => {
    let wanumber = req.params.wanumber;
    let templateid = req.params.templateid;
    let tempnumber = req.params.tempnumber;
    let ServiceType = req.params.ServiceType;
    let SearchType = req.params.SearchType;
    let referenceNumber = req.params.referenceNumber;

    if (wanumber.length == 10) {
        wanumber = '91' + wanumber;
        console.log({ wanumber });
    }
    if (tempnumber.length == 10) {
        tempnumber = '91' + tempnumber;
        console.log({ tempnumber });
    }

    let query = 'SELECT * FROM edcsdb.tbl_edcs_master where mobileno = ? AND searchtype = ?';
    let values = [wanumber, SearchType];
    let s = await dbpool.query(query, values, async (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log({ result });
            console.log(result[0].accountnumber);
            let productRetailerid = result[0].accountnumber;
            let productName = result[0].searchtype;
            let productAmount = result[0].billamount;
            let productQuantity = 1;
            let productRequestId = result[0].requestid;
            let productImageUrl = result[0].imageurl;
            // let orderIdInDB = result[0].orderid;

            console.log({ productRequestId });

            var config3 = {
                method: 'post',
                url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/Api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                headers: {
                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                }
            };

            try {
                const response3 = await axios(config3);

                if (response3.data.code === '100') {

                    console.log({ wanumber, ServiceType, SearchType, referenceNumber });
                    let data = JSON.stringify({
                        ServiceType: ServiceType,
                        SearchType: SearchType,
                        SearchValue: referenceNumber
                    });

                    var config = {
                        method: 'post',
                        url: `https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/api/TrafficPoliceFine/FetchBSPPoliceFine?ServiceType=${ServiceType}&SearchType=${SearchType}&SearchValue=${referenceNumber}`,
                        headers: {
                            'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                        },
                        data: data
                    };

                    // console.log({ url });
                    let tempText = null;

                    try {
                        const response = await axios(config);
                        // console.log(JSON.stringify(response.data));
                        let productRetailerid = referenceNumber;
                        let productName = SearchType;
                        let productAmount = response.data.TotalFineAmount;
                        let productQuantity = 1;
                        let productRequestId = response.data.RequestId;
                        let productImageUrl = response.data.ServiceImage;
                        let reason = response.data.data[0][0].Reason;
                        console.log({ reason });
                        if (response.data.code === '100') {
                            tempText = reason;
                            let response1 = {
                                code: '100',
                                status: 'failed',
                                type: 'text',
                                data: tempText
                            };
                            res.json(response1);
                        } else {
                            if (wanumber.length == 10) {
                                wanumber = '91' + wanumber;
                                console.log({ wanumber });
                            }
                            console.log({ productRetailerid, productName, productAmount, productRequestId, productImageUrl, wanumber });

                            let query = 'REPLACE INTO edcsdb.tbl_edcs_master (accountnumber, searchtype, billamount, requestid, imageurl, orderid,wapay_orderid, mobileno) VALUES (?,?,?,?,?,?,?,?)';
                            let values = [productRetailerid, productName, productAmount, productRequestId, productImageUrl, null, null, wanumber];
                            let s = await dbpool.query(query, values, (err, result) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(result);
                                }
                            });

                            var config = {
                                method: 'post',
                                url: 'https://koneapi.cmsuat.co.in:3443/KarnatakaOneMobileAPI/Api/Payment/GetPaymentDetails?RequestId=' + productRequestId + '&WhatsappMobNo=' + wanumber,
                                headers: {
                                    'Authorization': 'Basic a29uZXdoYXRzYXBwOldoQHQkQXBwQEswbmU='
                                }
                            };

                            try {
                                const response = await axios(config);
                                // console.log(JSON.stringify(response.data));
                                let orderId = response.data.data[0].OrderId;
                                let reason = response.data.data[0].Reason;
                                console.log({ orderId, reason });

                                let query1 = 'UPDATE edcsdb.tbl_edcs_master SET orderid = ? WHERE requestid = ?';
                                let values1 = [orderId, productRequestId];
                                let s1 = await dbpool.query(query1, values1, (err, result1) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(result1);
                                    }
                                });

                                var data1 = JSON.stringify({
                                    "from": tempnumber,
                                    "to": wanumber,
                                    "type": "template",
                                    "message": {
                                        "templateid": templateid,
                                        "placeholders": [
                                            "Traffic Violation",
                                            productAmount
                                        ],
                                        "buttons": [
                                            {
                                                "index": 0,
                                                "type": "visit_website",
                                                "placeholder": orderId
                                            }
                                        ]
                                    }
                                });

                                var config1 = {
                                    method: 'post',
                                    url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
                                    // url: 'http://192.168.1.73:6000/v2/wamessage/sendMessage',
                                    headers: {
                                        'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
                                        // 'apikey': '88cf744d-c164-11ed-9155-5cf3fcb1ab21',

                                        'Content-Type': 'application/json'
                                    },
                                    data: data1
                                };
                                try {
                                    const response1 = await axios(config1);
                                    // console.log(response1);
                                    let response2 = {
                                        code: '200',
                                        status: 'success',
                                        type: 'text',
                                        data: orderId
                                    };
                                    res.json(response2);
                                } catch {
                                    console.log(err);
                                    let errRes = {
                                        code: '100',
                                        status: 'Failed',
                                        data: 'Something went wrong'
                                    };
                                    res.json(errRes);
                                }
                            }
                            catch (err) {
                                console.log(err);
                            }

                        }
                    } catch (err) {
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                        console.log(err);
                    }

                }
                else if (response3.data.code === '200') {
                    let orderId = response3.data.data[0].OrderId;
                    let reason = response3.data.data[0].Reason;
                    // console.log({ orderId, reason });

                    let query1 = 'UPDATE edcsdb.tbl_edcs_master SET orderid = ? WHERE requestid = ?';
                    let values1 = [orderId, productRequestId];
                    let s1 = await dbpool.query(query1, values1, (err, result1) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(result1);
                        }
                    });

                    var data1 = JSON.stringify({
                        "from": tempnumber,
                        "to": wanumber,
                        "type": "template",
                        "message": {
                            "templateid": templateid,
                            "placeholders": [
                                "Traffic Violation",
                                productAmount
                            ],
                            "buttons": [
                                {
                                    "index": 0,
                                    "type": "visit_website",
                                    "placeholder": orderId
                                }
                            ]
                        }
                    });

                    var config1 = {
                        method: 'post',
                        url: 'https://api.pinbot.ai/v1/wamessage/sendMessage',
                        // url: 'http://192.168.1.73:6000/v2/wamessage/sendMessage',

                        headers: {
                            'apikey': '1c183273-84e7-11ed-a7c7-9606c7e32d76',
                            // 'apikey': '88cf744d-c164-11ed-9155-5cf3fcb1ab21',

                            'Content-Type': 'application/json'
                        },
                        data: data1
                    };
                    try {
                        const response1 = await axios(config1);
                        let response2 = {
                            code: '200',
                            status: 'success',
                            type: 'text',
                            data: orderId
                        };
                        // console.log("api response-----------------", response1);
                        res.json(response2);
                    } catch {
                        console.log(err);
                        let errRes = {
                            code: '100',
                            status: 'Failed',
                            data: 'Something went wrong'
                        };
                        res.json(errRes);
                    }
                }
            }
            catch (err) {
                console.log(err);
                let errRes = {
                    code: '100',
                    status: 'Failed',
                    data: 'Something went wrong'
                };
                res.json(errRes);
            }


        }
    });
});


module.exports = router;


// Routes

//  http://68.183.90.255:5000/karnatakaOne/ESCOM/GetBillDetails/:EscomType/:SearchValue/:wanumber
//  http://68.183.90.255:5000/karnatakaOne/ESCOM/FetchBillDetails/:EscomType/:SearchValue/:wanumber
//  http://68.183.90.255:5000/karnatakaOne/ESCOM/FetchBillDetails/:EscomType/:SearchValue/:wanumber/:templateid/:tempnumber

//  http://68.183.90.255:5000/karnatakaOne/WB/GetBillDetails/:WB/:RRNO/:wanumber
//  http://68.183.90.255:5000/karnatakaOne/WB/FetchBillDetails/:WB/:RRNO/:wanumber
//  http://68.183.90.255:5000/karnatakaOne/WB/FetchBillDetails/:WB/:RRNO/:wanumber/:templateid/:tempnumber

//  http://68.183.90.255:5000/karnatakaOne/khata/GetBillDetails/:gscno/:wanumber
//  http://68.183.90.255:5000/karnatakaOne/khata/FetchBillDetails/:gscno/:wanumber
//  http://68.183.90.255:5000/karnatakaOne/khata/FetchBillDetails/:gscno/:wanumber/:templateid/:tempnumber

//  http://68.183.90.255:5000/karnatakaOne/rcextract/GetBillDetails/:regno/:wanumber
//  http://68.183.90.255:5000/karnatakaOne/rcextract/FetchBillDetails/:regno/:wanumber
//  http://68.183.90.255:5000/karnatakaOne/rcextract/FetchBillDetails/:regno/:wanumber/:templateid/:tempnumber
