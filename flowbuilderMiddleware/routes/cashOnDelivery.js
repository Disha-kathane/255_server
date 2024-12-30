let express = require('express');
let router = express.Router();
const { v4: uuidv4 } = require('uuid');
let axios = require('axios');

var mysql = require('mysql2');


let db_config = {
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'ezeebot',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8'
};

let dbpool = mysql.createPool(db_config).promise();


const generateUniqueId = require('generate-unique-id');


var pincodeDirectory = require('india-pincode-lookup');


router.post('/cityVerification/:city/:wabanumber', async (req, res) => {
    try {
        let query = null;
        let rows = null;
        let pincodeCount = null;
        let city = req.params.city;
        let wabaNumber = req.params.wabanumber;

        query1 = "SELECT COUNT(1) AS C FROM  ezb_catalogue_pincode_master WHERE LOWER(city_name) = LOWER(?)  AND wabanumber = ?";
        rows1 = await dbpool.query(query1, [city, '+' + wabaNumber]);
        // console.log(JSON.stringify(rows1[0]));
        cityCount = rows1[0][0].C;

        console.log({ cityCount });


        if (cityCount > 0) {
            tempText = 'Orders are available here';
            let response1 = {
                code: '200',
                status: 'Success',
                type: 'text',
                data: tempText
            };
            return res.json(response1);
        }
        else {
            tempText = 'Services are not available in this area at the moment.';
            let response1 = {
                code: '100',
                status: 'failed',
                type: 'text',
                data: tempText
            };
            return res.json(response1);
        }


    }
    catch (err) {
        console.log("Pincode err ==================================> " + err);
        tempText = 'Something went wrong. Please try again later.';
        let response1 = {
            code: '100',
            status: 'failed',
            type: 'text',
            data: tempText
        };
        return res.json(response1);

    }
});


router.post('/verification/:pincode/:mobileno/:wabanumber', async (req, res) => {
    try {
        let query = null;
        let rows = null;
        let pincodeCount = null;
        let pincode = req.params.pincode;
        let mobileNumber = req.params.mobileno;
        let wabaNumber = req.params.wabanumber;
        let city = null;


        if (pincode.length !== 6) {
            tempText = 'Please enter valid pincode.';
            let response1 = {
                code: '100',
                status: 'failed',
                type: 'text',
                data: tempText
            };
            return res.json(response1);
        }
        else {
            const resp = pincodeDirectory.lookup(pincode);
            console.log({ resp });

            query8 = "SELECT id FROM  ezb_flowbuilder_session WHERE  mobileno = ? AND is_session_end = ? ORDER BY id desc LIMIT 1";
            rows8 = await dbpool.query(query8, [mobileNumber, 0]);

            if (rows8.length > 0) {
                flowId = rows8[0][0].id;
                // console.log(flowId);
                console.log(flowId);


                query9 = "SELECT attrkey, attrvalue FROM ezb_flowbuilder_attributes WHERE session_mobile = ? AND flowid = ?  AND attrkey LIKE 'SHIPPING_CITY%' ORDER BY id DESC LIMIT 1";
                rows9 = await dbpool.query(query9, [mobileNumber, flowId]);
                console.log(JSON.stringify(rows9[0]));

                if (rows9.length > 0 && rows9 !== undefined) {
                    city = rows9[0][0].attrvalue.toString();
                    console.log('city ==================> ' + city);
                }


                if (resp.length > 0 && city !== undefined) {
                    for (let i = 0; i < resp.length; i++) {
                        if (resp[i].districtName.toLowerCase() === city.toLowerCase()) {
                            console.log(resp[i].districtName);
                            console.log('matched');

                            query1 = "SELECT COUNT(1) AS C FROM  ezb_catalogue_pincode_master WHERE pincode  = ? AND LOWER(city_name) = LOWER(?) AND wabanumber = ?";
                            rows1 = await dbpool.query(query1, [pincode, city, '+' + wabaNumber]);
                            // console.log(JSON.stringify(rows1[0]));
                            count = rows1[0][0].C;

                            console.log({ count });


                            if (count > 0) {
                                tempText = 'Orders are available here';
                                let response1 = {
                                    code: '200',
                                    status: 'Success',
                                    type: 'text',
                                    data: tempText
                                };
                                return res.json(response1);
                            }
                            else {
                                tempText = 'Services are not available in this area at the moment.';
                                let response1 = {
                                    code: '300',
                                    status: 'failed',
                                    type: 'text',
                                    data: tempText
                                };
                                return res.json(response1);
                            }
                        }
                        else {
                            console.log('enter valid pincode');
                            tempText = 'Please enter valid pincode.';
                            let response1 = {
                                code: '100',
                                status: 'failed',
                                type: 'text',
                                data: tempText
                            };
                            return res.json(response1);
                        }
                    }

                }
            }
            else {
                tempText = 'Something went wrong. Please try again later.';
                let response1 = {
                    code: '100',
                    status: 'failed',
                    type: 'text',
                    data: tempText
                };
                return res.json(response1);
            }


        }



    }
    catch (err) {
        console.log(" err ==================================> " + err);
        tempText = 'Something went wrong. Please try again later.';
        let response1 = {
            code: '100',
            status: 'failed',
            type: 'text',
            data: tempText
        };
        return res.json(response1);

    }
});

router.post('/userdetail/:mobileno', async (req, res) => {

    try {

        let mobileNumber = req.params.mobileno;
        let customerDetails = null;

        let query = null;
        let rows = null;
        let catalogueId = null;
        let userDetails = [];
        let shippingName = null;
        let shippingPincode = null;
        let shippingCity = null;
        let shippingAddress = null;

        try {

            query1 = "SELECT id FROM  ezb_flowbuilder_session WHERE mobileno = ? AND is_session_end = ? ORDER BY id desc LIMIT 1";
            rows1 = await dbpool.query(query1, [mobileNumber, 0]);
            // console.log(JSON.stringify(rows1[0]));
            flowId = rows1[0][0] !== undefined ? rows1[0][0].id : null;
            // console.log(flowId);
            console.log(flowId);

            query = "SELECT customer_details FROM ezb_non_catalog_purchase_master WHERE mobileno = ? AND catalog_type = ? ORDER BY id DESC LIMIT 1";
            rows = await dbpool.query(query, [mobileNumber, 1]);
            console.log(JSON.stringify(rows[0]));

            if (rows.length > 0 && rows[0][0] !== undefined) {


                customerDetails = rows[0][0].customer_details;

                customerDetails = JSON.parse(customerDetails);



                console.log({ customerDetails });

                query6 = "SELECT attrkey, attrvalue FROM ezb_flowbuilder_attributes WHERE flowid = ? AND attrkey LIKE 'SHIPPING%'";
                rows6 = await dbpool.query(query6, [flowId]);
                // console.log(JSON.stringify(rows6[0]));
                let userData = rows6[0];
                console.log({ userData });

                console.log(JSON.stringify(userData));


                for (let i = 0; i < userData.length; i++) {

                    if (userData[i].attrkey === 'SHIPPING_NAME') {
                        console.log(userData[i].attrkey, userData[i].attrvalue.toString());
                        shippingName = userData[i].attrvalue.toString();

                    }

                }



                if (customerDetails !== null && customerDetails !== '') {


                    for (let i = 0; i < customerDetails.length; i++) {

                        // shippingName = customerDetails[i].shipping_name;

                        shippingPincode = customerDetails[i].shipping_pincode;

                        shippingCity = customerDetails[i].shipping_city;

                        shippingAddress = customerDetails[i].shipping_address;

                    }

                    userDetails.push({
                        "shipping_name": shippingName,
                        "shipping_pincode": shippingPincode,
                        "shipping_city": shippingCity,
                        "shipping_address": shippingAddress,
                        "shipping_contactno": mobileNumber,
                    });

                    console.log({ userDetails });



                    // query4 = 'UPDATE ezb_non_catalog_purchase_master SET customer_details = ? ORDER BY ID DESC LIMIT 1';
                    // rows4 = await dbpool.query(query4, [JSON.stringify(userDetails)]);

                    tempText = "Thanks *" + userDetails[0].shipping_name + "* for providing the details!\nWe have noted your address as: \n*" + userDetails[0].shipping_address + ",*\n*" + userDetails[0].shipping_city + "* - *" + userDetails[0].shipping_pincode + "*\n\nWould you like to move ahead with online payment for the order ? ";

                    // console.log(JSON.stringify(rows4[0]));
                    let response1 = {
                        code: '200',
                        status: 'success',
                        type: 'text',
                        data: tempText
                    };
                    return res.json(response1);
                }
                else if (customerDetails === null) {
                    console.log("UserDetails not found");
                    let response2 = {
                        code: '100',
                        status: 'success',
                        type: 'text',
                        data: "UserDetails not found"
                    };
                    res.json(response2);
                }

            }
            else {
                console.log("UserDetails not found");
                let response2 = {
                    code: '100',
                    status: 'success',
                    type: 'text',
                    data: "UserDetails not found"
                };
                res.json(response2);
            }


        }
        catch (err) {
            console.log(err);
            tempText = 'Something went wrong. Please try again';
            let response1 = {
                code: '100',
                status: 'failed',
                type: 'text',
                data: tempText
            };
            return res.json(response1);
        }

    } catch (err) {
        console.log(err);
        tempText = 'Something went wrong. Please try again';
        let response1 = {
            code: '100',
            status: 'failed',
            type: 'text',
            data: tempText
        };
        return res.json(response1);

    }
});


router.post('/cod/:wanumber/:mobileno', async (req, res) => {

    try {
        let orderId = null;
        let contextId = null;

        orderId = generateUniqueId({
            length: 8,
            useLetters: false,
            excludeSymbols: ['@', '#', '|']
        });
        console.log({ orderId });
        let flowId = null;
        let tempProductArr = null;
        var productRetailerIds = [];
        let userDetails = [];

        let mobileNumber = req.params.mobileno;
        let wanumber = req.params.wanumber;

        let query = null;
        let rows = null;
        let catalogueId = null;


        let totalAmount = 0;
        let tax = 0;
        let taxData = 0;
        let subTotal = 0;
        let userId = null;

        let productArr = null;


        try {
            query = "SELECT id FROM  ezb_flowbuilder_session WHERE  mobileno = ? AND is_session_end = ? ORDER BY id desc LIMIT 1";
            rows = await dbpool.query(query, [mobileNumber, 0]);

            if (rows !== undefined && rows.length > 0) {
                flowId = rows[0][0].id;
                // console.log(flowId);
                console.log(flowId);


                if (flowId !== undefined) {
                    console.log({ flowId });
                    query7 = "SELECT * FROM ezb_order_details_master where flowid = ? ";
                    rows7 = await dbpool.query(query7, [flowId]);

                    // console.log(JSON.stringify(rows[0]));

                    if (rows7 !== undefined && rows7.length > 0) {
                        let orderDetailsData = JSON.parse(rows7[0][0].order_details_payload);

                        catalogueId = orderDetailsData.messages[0].order.catalog_id;
                        productArr = orderDetailsData.messages[0].order.product_items;
                        console.log({ catalogueId, productArr });


                        query1 = 'SELECT tax FROM ezb_catlogue_master where catalogid = ?';
                        rows1 = await dbpool.query(query1, [catalogueId]);
                        // console.log(JSON.stringify(rows1[0]));
                        let taxData = rows1[0][0]!=undefined?rows1[0][0].tax:0;
                        console.log({ taxData });

                        for (let i = 0; i < productArr.length; i++) {

                            subTotal = subTotal + parseFloat(productArr[i].item_price * productArr[i].quantity);
                            // console.log({ total });
                        }
                        console.log({ subTotal });

                        tax = subTotal * (taxData / 100);

                        totalAmount = subTotal + tax;

                        console.log({ totalAmount, subTotal, tax });


                        let accessToken = 'EAAaSEd3mKP8BAMQYMZA5MGcTDTOTdlOo0pKlu0BYKdqw9qPrIGZAiI7EpXb9zGLQWaNzI9u28g28i5ZALjx15Nbco7yCldCieXQIjJRYQZAhpZAdvir66q0ZB7nDZCUZAAv7eww7jhtV1K0Y3a8GnbF2hmJVqHbTSwmsFp9gOXOQZAmmAh5d6kZB6TOjwBELYryRehcXfYqlf98AZDZD';
                        // console.log({ accessToken });
                        var config = {
                            method: 'get',
                            url: 'https://graph.facebook.com/v13.0/' + catalogueId + '/products?limit=999999&access_token=' + accessToken + '&fields=["category","name","retailer_id","price","availability","description","country","brand","image_url","size","color"]&summary=true',
                            headers: {}
                        };


                        axios(config)
                            .then(async function (response) {
                                // console.log(JSON.stringify(response.data));
                                tempProductArr = response.data.data;
                                // console.log({ tempProductArr });
                                // console.log('===========>' + tempProductArr.length);
                                for (let j = 0; j < tempProductArr.length; j++) {
                                    for (let i = 0; i < productArr.length; i++) {
                                        // console.log(productArr[i].product_retailer_id);
                                        if (tempProductArr[j].retailer_id === productArr[i].product_retailer_id) {
                                            // console.log('Inside GET CATALOGUE PRODUCT NAME ' + tempProductArr[j].name);

                                            productRetailerIds.push({
                                                "product_retailerid": productArr[i].product_retailer_id,
                                                "product_quantity": productArr[i].quantity,
                                                "product_amount": parseInt(productArr[i].item_price),
                                                "product_name": tempProductArr[j].name,
                                                "product_image_url": tempProductArr[j].image_url

                                            });
                                            // console.log(productRetailerIds);


                                        }
                                    }
                                }

                                query3 = 'SELECT userid FROM ezb_wa_msg_settings WHERE wanumber = ?';
                                rows3 = await dbpool.query(query3, ['+' + wanumber]);
                                // console.log(JSON.stringify(rows3[0]));
                                userId = rows3[0][0].userid;


                                let paymentReferenceId = 0;
                                let transactionId = 0;
                                let transactionType = 1;
                                let nonCatalogueId = 0;
                                let orderStatus = "pending";
                                let orderFlag = 1;
                                let productImage = null;
                                let catalogueType = 1;
                                let currency = 'INR';

                                let shippingName = null;
                                let shippingPincode = null;
                                let shippingCity = null;
                                let shippingAddress = null;
                                let existingUserDetails = null;

                                console.log(productRetailerIds);




                                query8 = "SELECT customer_details from ezb_non_catalog_purchase_master WHERE userid = ? AND mobileno =? ORDER BY id DESC LIMIT 1";
                                rows8 = await dbpool.query(query8, [userId, mobileNumber]);
                                // console.log(JSON.stringify(rows8[0]));

                                if (rows8[0][0] !== undefined && rows8.length > 0) {
                                    existingUserDetails = JSON.parse(rows8[0][0].customer_details);
                                    console.log({ existingUserDetails });
                                }




                                query6 = "SELECT attrkey, attrvalue FROM ezb_flowbuilder_attributes WHERE flowid = ? AND attrkey LIKE 'SHIPPING%'";
                                rows6 = await dbpool.query(query6, [flowId]);
                                // console.log(JSON.stringify(rows6[0]));
                                let userData = rows6[0];
                                console.log({ userData });
                                console.log(JSON.stringify(userData));


                                if (existingUserDetails !== null) {
                                    for (let j = 0; j < existingUserDetails.length; j++) {
                                        if (existingUserDetails[j].shipping_name !== null && existingUserDetails[j].shipping_pincode !== null && existingUserDetails[j].shipping_city !== null && existingUserDetails[j].shipping_address !== null) {

                                            console.log('data already exist');

                                            query6 = "SELECT attrkey, attrvalue FROM ezb_flowbuilder_attributes WHERE flowid = ? AND attrkey LIKE 'SHIPPING_NAME%' ORDER BY id DESC LIMIT 1";
                                            rows6 = await dbpool.query(query6, [flowId]);
                                            // console.log(JSON.stringify(rows6[0]));
                                            let userData = rows6[0];
                                            console.log({ userData });

                                            // console.log(JSON.stringify(userData));


                                            for (let i = 0; i < userData.length; i++) {

                                                console.log(userData[i].attrkey, userData[i].attrvalue);

                                                if (userData[i].attrkey === 'SHIPPING_NAME') {
                                                    console.log(userData[i].attrkey, userData[i].attrvalue.toString());
                                                    shippingName = userData[i].attrvalue.toString();

                                                }


                                                query11 = "SELECT attrkey, attrvalue FROM ezb_flowbuilder_attributes WHERE flowid = ? AND attrkey LIKE 'SHIPPING_PINCODE%' ORDER BY id DESC LIMIT 1";
                                                rows11 = await dbpool.query(query11, [flowId]);
                                                // console.log(JSON.stringify(rows11[0]));
                                                let userData2 = rows11[0];
                                                console.log({ userData2 });

                                                query11 = "SELECT attrkey, attrvalue FROM ezb_flowbuilder_attributes WHERE flowid = ? AND attrkey LIKE 'SHIPPING_CITY%' ORDER BY id DESC LIMIT 1";
                                                rows11 = await dbpool.query(query11, [flowId]);
                                                // console.log(JSON.stringify(rows11[0]));
                                                let userData3 = rows11[0];
                                                console.log({ userData3 });

                                                query11 = "SELECT attrkey, attrvalue FROM ezb_flowbuilder_attributes WHERE flowid = ? AND attrkey LIKE 'SHIPPING_ADDRESS%' ORDER BY id DESC LIMIT 1";
                                                rows11 = await dbpool.query(query11, [flowId]);
                                                // console.log(JSON.stringify(rows11[0]));
                                                let userData4 = rows11[0];
                                                console.log({ userData4 });

                                                if (userData2.length > 0 && userData3.length && userData4.length) {
                                                    console.log('Details Changed');
                                                    if (userData2[i].attrkey === 'SHIPPING_PINCODE') {
                                                        console.log(userData2[i].attrkey, userData2[i].attrvalue.toString());
                                                        shippingPincode = userData2[i].attrvalue.toString();
                                                    }
                                                    if (userData3[i].attrkey === 'SHIPPING_CITY') {
                                                        console.log(userData3[i].attrkey, userData3[i].attrvalue.toString());
                                                        shippingCity = userData3[i].attrvalue.toString();
                                                    }
                                                    if (userData4[i].attrkey === 'SHIPPING_ADDRESS') {
                                                        console.log(userData4[i].attrkey, userData4[i].attrvalue.toString());
                                                        shippingAddress = userData4[i].attrvalue.toString();
                                                    }
                                                }
                                                else {
                                                    console.log('Details not changed');
                                                    shippingPincode = existingUserDetails[0].shipping_pincode;
                                                    shippingCity = existingUserDetails[0].shipping_city;
                                                    shippingAddress = existingUserDetails[0].shipping_address;

                                                }

                                                console.log({ shippingName, shippingCity, shippingAddress, shippingPincode });

                                                userDetails.push({
                                                    "shipping_name": shippingName,
                                                    "shipping_pincode": shippingPincode,
                                                    "shipping_city": shippingCity,
                                                    "shipping_address": shippingAddress,
                                                    "shipping_contactno": mobileNumber,
                                                });

                                                // console.log({ userDetails });

                                            }
                                        }


                                    }
                                }
                                else {
                                    console.log('null data');

                                    for (let i = 0; i < userData.length; i++) {
                                        console.log(userData[i].attrvalue.toString());
                                        // console.log(userData[i].attrvalue.toString());

                                        if (userData[i].attrkey === 'SHIPPING_NAME') {
                                            console.log(userData[i].attrkey, userData[i].attrvalue.toString());
                                            shippingName = userData[i].attrvalue.toString();

                                        }
                                        if (userData[i].attrkey === 'SHIPPING_PINCODE') {
                                            console.log(userData[i].attrkey, userData[i].attrvalue.toString());
                                            shippingPincode = userData[i].attrvalue.toString();
                                        }
                                        if (userData[i].attrkey === 'SHIPPING_CITY') {
                                            console.log(userData[i].attrkey, userData[i].attrvalue.toString());
                                            shippingCity = userData[i].attrvalue.toString();
                                        }
                                        if (userData[i].attrkey === 'SHIPPING_ADDRESS') {
                                            console.log(userData[i].attrkey, userData[i].attrvalue.toString());
                                            shippingAddress = userData[i].attrvalue.toString();
                                        }

                                    }

                                    userDetails.push({
                                        "shipping_name": shippingName,
                                        "shipping_pincode": shippingPincode,
                                        "shipping_city": shippingCity,
                                        "shipping_address": shippingAddress,
                                        "shipping_contactno": mobileNumber,
                                    });


                                    // console.log(userDetails);
                                }


                                // for (let i = 0; i < userData.length; i++) {
                                //     console.log(userData[i].attrvalue.toString());
                                //     // console.log(userData[i].attrvalue.toString());

                                //     if (userData[i].attrkey === 'SHIPPING_NAME') {
                                //         console.log(userData[i].attrkey, userData[i].attrvalue.toString());
                                //         shippingName = userData[i].attrvalue.toString();

                                //     }
                                //     if (userData[i].attrkey === 'SHIPPING_PINCODE') {
                                //         console.log(userData[i].attrkey, userData[i].attrvalue.toString());
                                //         shippingPincode = userData[i].attrvalue.toString();
                                //     }
                                //     if (userData[i].attrkey === 'SHIPPING_CITY') {
                                //         console.log(userData[i].attrkey, userData[i].attrvalue.toString());
                                //         shippingCity = userData[i].attrvalue.toString();
                                //     }
                                //     if (userData[i].attrkey === 'SHIPPING_ADDRESS') {
                                //         console.log(userData[i].attrkey, userData[i].attrvalue.toString());
                                //         shippingAddress = userData[i].attrvalue.toString();
                                //     }

                                // }

                                // userDetails.push({
                                //     "shipping_name": shippingName,
                                //     "shipping_pincode": shippingPincode,
                                //     "shipping_city": shippingCity,
                                //     "shipping_address": shippingAddress,
                                //     "shipping_contactno": mobileNumber,
                                // });



                                console.log({ userDetails });




                                console.log({ mobileNumber });


                                query6 = "SELECT session_id FROM ezb_flowbuilder_attributes WHERE attrvalue = 'COD' AND flowid =  (SELECT MAX(id) FROM  ezb_flowbuilder_session WHERE mobileno = ? AND is_session_end = 0) ORDER BY id DESC LIMIT 1";
                                rows6 = await dbpool.query(query6, [mobileNumber]);
                                // console.log("rows6 =========", JSON.stringify(rows6[0]));
                                contextId = rows6[0][0].session_id;
                                console.log({ contextId });




                                try {

                                    query8 = " SELECT id FROM  ezb_flowbuilder_session WHERE  mobileno = ? AND is_session_end = ? ORDER BY id desc LIMIT 1";
                                    rows8 = await dbpool.query(query8, [mobileNumber, 0]);

                                    if (rows8 !== undefined && rows8.length > 0) {
                                        flowId = rows8[0][0].id;
                                        // console.log(flowId);
                                        console.log(flowId);


                                        query9 = 'SELECT context_message_id FROM ezb_order_details_master WHERE mobileno = ? AND flowid  = ?';
                                        rows9 = await dbpool.query(query9, [mobileNumber, flowId]);


                                        if (rows9 !== undefined && rows9.length > 0) {

                                            contextIdExists = rows9[0][0].context_message_id;
                                            console.log({ contextIdExists });


                                            if (contextIdExists && contextIdExists !== undefined && contextIdExists !== '' && contextIdExists !== null) {
                                                console.log("contextId ==========", contextId, contextIdExists);

                                                console.log("record already exist");
                                                return res.send({
                                                    code: 100,
                                                    type: "text",
                                                    status: 'success',
                                                    data: "You have already selected WAPAY Option."
                                                });


                                            } else {
                                                console.log('contextIdExists in orderDetails');
                                                console.log("contextId ==========", contextId, contextIdExists);


                                                query4 = 'INSERT INTO ezb_non_catalog_purchase_master (userid, mobileno, non_catalog_id, product_retailer_id, orderid,rzp_orderid, order_detail_messageid, referenceid, transactionid, transaction_type, total_amount, currency, timestamp, order_status, order_flag, catalog_type, product_image,customer_details) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?)';
                                                rows4 = await dbpool.query(query4, [userId, mobileNumber, 0, JSON.stringify(productRetailerIds), orderId, 0, 0, paymentReferenceId, transactionId, transactionType, totalAmount, currency, orderStatus, orderFlag, catalogueType, productImage, JSON.stringify(userDetails)]);
                                                // console.log(JSON.stringify(rows4[0]));

                                                console.log(rows4[0].insertId, contextId, mobileNumber, flowId);

                                                query5 = 'UPDATE ezb_order_details_master SET purchase_master_id = ?, context_message_id = ? WHERE mobileno = ? AND flowid= ?';
                                                rows5 = await dbpool.query(query5, [rows4[0].insertId, contextId, mobileNumber, flowId]);
                                                console.log(JSON.stringify(rows5[0]));


                                                tempText = 'Your Order with total amount of Rs.*' + totalAmount + '* has been placed with order-id *' + orderId + '*';
                                                let response1 = {
                                                    code: '200',
                                                    status: 'success',
                                                    type: 'text',
                                                    data: tempText
                                                };




                                                return res.json(response1);

                                            }
                                        }

                                        // }


                                    }
                                }

                                catch (err) {
                                    console.log(err);
                                    tempText = 'Something went wrong. Please try again';
                                    let response1 = {
                                        code: '100',
                                        status: 'failed',
                                        type: 'text',
                                        data: tempText
                                    };
                                    return res.json(response1);
                                }

                                // try {
                                //     query = "SELECT * FROM ezb_flowbuilder_attributes WHERE attrvalue = 'COD' AND flowid =  (SELECT MAX(id) FROM  ezb_flowbuilder_session WHERE  mobileno = ? AND is_session_end = 0)";
                                //     rows = await dbpool.query(query, [mobileNumber]);
                                //     // console.log("rows=========", rows);

                                //     // console.log(rows[0][0].attrvalue);
                                //     let res1 = rows[0][0].attrvalue;
                                //     contextId = rows[0][0].session_id;
                                //     let attrval = res1.toString();
                                //     console.log("attrval=========================>", attrval, contextId);

                                //     query1 = 'SELECT COUNT(1) AS C FROM ezb_order_details_master WHERE context_message_id = ?';
                                //     rows1 = await dbpool.query(query1, [contextId]);
                                //     // console.log("rows=========", JSON.stringify(rows1[0]));
                                //     contextIdCount = rows1[0][0].C;
                                //     console.log({ contextIdCount });


                                //     if (contextIdCount > 0 && contextIdCount !== undefined) {
                                //         console.log("contextIdCount ==========", contextIdCount);

                                //         console.log("record already exist");
                                //         return res.send({
                                //             code: 100,
                                //             type: "text",
                                //             status: 'success',
                                //             data: "Your have already selected WAPAY option."
                                //         });


                                //     } else {

                                //         query = "SELECT id FROM  ezb_flowbuilder_session WHERE  mobileno = 919978572120 AND is_session_end = 0 ORDER BY id desc LIMIT 1;";
                                //         rows = await dbpool.query(query, [mobileNumber, 0]);
                                //         flowId = rows[0][0].id;
                                //         // console.log(flowId);
                                //         console.log(flowId);

                                //         query5 = 'UPDATE ezb_order_details_master SET context_message_id = ? WHERE mobileno = ? AND flowid= ?';
                                //         rows5 = await dbpool.query(query5, [contextId, mobileNumber, flowId]);
                                //         // console.log(JSON.stringify(rows5[0]));


                                //         tempText = 'Your Order has been placed with order-id *' + orderId + '*';
                                //         let response1 = {
                                //             code: '200',
                                //             status: 'success',
                                //             type: 'text',
                                //             data: tempText
                                //         };

                                //         return res.json(response1);
                                //     }
                                // }
                                // catch (err) {
                                //     console.log("Inside catch block=================================", err);
                                // }

                            });
                    }



                }
            }



        }
        catch (err) {
            console.log(err);
            tempText = 'Something went wrong. Please try again';
            let response1 = {
                code: '100',
                status: 'failed',
                type: 'text',
                data: tempText
            };
            return res.json(response1);
        }

    } catch (err) {
        console.log(err);
        tempText = 'Something went wrong. Please try again';
        let response1 = {
            code: '100',
            status: 'failed',
            type: 'text',
            data: tempText
        };
        return res.json(response1);

    }
});


router.post("/codContext/:wanumber/:mobileno", async (req, res) => {
    let mobileNumber = req.params.mobileno;
    let wanumber = req.params.wanumber;

    let query = null;

    let rows = null;
    let contextId = null;

    try {

        query8 = " SELECT id FROM  ezb_flowbuilder_session WHERE  mobileno = ? AND is_session_end = ? ORDER BY id desc LIMIT 1";
        rows8 = await dbpool.query(query8, [mobileNumber, 0]);

        if (rows8 !== undefined && rows8.length > 0) {
            flowId = rows8[0][0].id;
            // console.log(flowId);
            console.log(flowId);


            query9 = 'SELECT context_message_id FROM ezb_order_details_master WHERE mobileno  = ? AND  flowid  = ?';
            rows9 = await dbpool.query(query9, [mobileNumber, flowId]);

            if (rows9 !== undefined && rows9.length > 0) {

                console.log('Inside already selected option');

                contextId = rows9[0][0].context_message_id;
                console.log({ contextId });


                if (contextId && contextId !== undefined && contextId !== '' && contextId !== null) {
                    console.log("contextId ==========", contextId);

                    console.log("record already exist");
                    return res.send({
                        code: 100,
                        type: "text",
                        status: 'success',
                        data: "Your order has already been placed."
                    });


                } else {

                    query = "SELECT id FROM  ezb_flowbuilder_session WHERE  mobileno = ? AND is_session_end = 0 ORDER BY id desc LIMIT 1;";
                    rows = await dbpool.query(query, [mobileNumber, 0]);
                    flowId = rows[0][0].id;
                    // console.log(flowId);
                    console.log(flowId);

                    query5 = 'UPDATE ezb_order_details_master SET context_message_id = ? WHERE mobileno = ? AND flowid= ?';
                    rows5 = await dbpool.query(query5, [contextId, mobileNumber, flowId]);
                    // console.log(JSON.stringify(rows5[0]));


                    return res.status(200).send({
                        "code": 200,
                        "status": "SUCCESS",
                        "type": "text",
                        "data": "You have selected WhatsApp Payment Option."
                    });

                }
            }

            // }


        }
    }

    catch (err) {
        console.log(err);
        tempText = 'Something went wrong. Please try again';
        let response1 = {
            code: '100',
            status: 'failed',
            type: 'text',
            data: tempText
        };
        return res.json(response1);
    }

});

module.exports = router;