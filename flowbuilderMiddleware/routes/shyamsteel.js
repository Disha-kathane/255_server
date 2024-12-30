const express = require('express');
const router = express.Router();
// const dbpool = require('../DbFiles/ezeebotdb');
const axios = require('axios');
const FormData = require('form-data');
let mysql = require('mysql2');
const config = require('/home/config');

let db_config = {
    host: config.PROD_DB1_HOST,
    port: config.PROD_DB1_PORT,
    user: config.PROD_DB1_USER,
    password: config.PROD_DB1_PSWD,
    database: config.PROD_DB1_NAME,
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};

let db_config1 = {
    host: config.PROD_DB2_HOST,
    port: config.PROD_DB2_PORT,
    user: config.PROD_DB2_USER,
    password: config.PROD_DB2_PSWD,
    database: config.PROD_DB2_NAME,
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};

let dbpool = mysql.createPool(db_config).promise();
let dbpool1 = mysql.createPool(db_config1).promise();


router.post('/dealer/:contextid/:wanumber', async (req, res) => {
    let contextid = req.params.contextid;
    let tempMobileNo;
    let mobileno = req.params.wanumber;
    let fetchPayloadResult = await fetchPayload(contextid);
    let payload = fetchPayloadResult[0].wabapayload;
    let payloaddata = JSON.parse(payload);
    let leadId = null;
    console.log("data==================================", payloaddata.template.components[0].parameters);
    if (payloaddata.template.components[0].parameters[1].text !== undefined) {
        leadId = payloaddata.template.components[0].parameters[1].text;
    } else {
        console.log("No Text Found");
    }

    if (mobileno.length >= 12 && mobileno.startsWith("91")) {
        tempMobileNo = mobileno.substring(2);
    } else {
        tempMobileNo = mobileno;
    }
    // if (mobileno.startsWith("91")) {
    //     tempMobileNo = mobileno.substring(2);
    // }
    // console.log(tempMobileNo);
    // const leadIdBase64 = Buffer.from(leadId).toString('base64');
    // const mobilenoBase64 = Buffer.from(mobileno).toString('base64');
    // console.log({ leadId, mobileno })
    let data = new FormData();
    data.append('mobno', tempMobileNo);
    data.append('leadID', leadId);

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://retail.shyamsteel.in/apnagharapi/api/dealerdata',
        // url: 'https://qassml.shyamsteel.in/apnagharapi/index.php/api/dealerdata',
        headers: {
            ...data.getHeaders()
        },
        data: data
    };

    axios.request(config)
        .then((response) => {
            // console.log("response.data------------------>  ", response.data);
            if (response.data.status === 0) {
                return res.status(200).json({ code: 100, status: "failed", data: "No Record Found" });
            } else {
                let Supplier_Name = response.data.details.supplier_name;
                let form_link = response.data.details.form_link;
                let bid_submission_time = response.data.details.bid_submission_time;
                console.log(Supplier_Name, form_link, bid_submission_time);
                return res.status(200).json({
                    code: 200, status: "success", type: "text", data: `::::: *Give Your Price* :::::\nDear *${Supplier_Name}*,\n\n*Click the below link to give your price:-* ${form_link} \n\n*Bid Submission Deadline:* ${bid_submission_time}`
                });

                // return res.status(200).json({ code: 200, status: "success", type: "text", data: `::::: *Give Your Price* :::::\nDear *${Supplier_Name}*,\n\nThank you for showing your interest.\nPlease share your price & remarks in the bid form.\nClick here to fill the bid form.\n*Click the below link to give your price:-* ${form_link} \n\n*Bid Submission Deadline:* ${bid_submission_time}` });
            }
        })
        .catch((error) => {
            return res.status(200).json({ code: 100, status: "failed", data: "Something went wrong" });
        });
});


let fetchPayload = async (contextid) => {
    let query = "SELECT wabapayload FROM `ezb_message_sent_master` WHERE messageid = ?";
    let values = [contextid];
    let [result] = await dbpool1.query(query, values);
    return result;
};

module.exports = router;
