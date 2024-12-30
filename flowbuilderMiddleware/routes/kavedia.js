let express = require('express');
let router = express.Router();
let async = require('async');
let mysql = require('mysql2');
var axios = require('axios');
const config = require('/home/config');


let db_config = {
    host: '10.139.244.212',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'ezeebot',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};

let db = mysql.createPool(db_config).promise();


let database = {
    host: config.PROD_DB2_HOST,
    port: config.PROD_DB2_PORT,
    user: config.PROD_DB2_USER,
    password: config.PROD_DB2_PSWD,
    database: 'Kavedia',
    multipleStatements: true,
    charset: 'utf8mb4_unicode_ci'
};

let mydb = mysql.createPool(database).promise();


let db_config1 = {
    host: config.PROD_DB2_HOST,
    port: config.PROD_DB2_PORT,
    user: config.PROD_DB2_USER,
    password: config.PROD_DB2_PSWD,
    database: config.PROD_DB2_NAME,
    multipleStatements: true,
    charset: 'utf8mb4_unicode_ci'
};
let dbpool1 = mysql.createPool(db_config1).promise();

// Function to fetch parameters from the 'body' type
function getBodyParameters(data) {
    if (data.template && Array.isArray(data.template.components)) {
        const bodyComponent = data.template.components.find(component => component.type === "body");
        return bodyComponent ? bodyComponent.parameters : null;
    }
    return null; // Return null if no body component or parameters are found
}

router.post('/msg/:wanumber/:contextid', async (req, res) => {

    try {
        let wanumber = req.params.wanumber;
        let context_id = req.params.contextid;
        console.log("Kavedia------------------------->" + wanumber, context_id);

        let query = "Select wabapayload from ezb_message_sent_master where messageid = ?";
        let messageresult = await dbpool1.query(query, [context_id]);
        let payload = JSON.parse(messageresult[0][0].wabapayload);
        console.log("Kavedia------------------------->" + JSON.stringify(payload), "-------------------------******************************************************************************************----------------------------------------------------", JSON.stringify(payload.template.components[1]));

        // let invoiceid_1 = payload.template.components[1].parameters[1]["text"];
        // let invoiceid_2 = payload.template.components[1].parameters[2]["text"];
        // let executive_name = payload.template.components[1].parameters[3]["text"];

        const bodyParameters = getBodyParameters(payload);

        if (bodyParameters) {
            console.log("Kavedia------------------------->" + JSON.stringify(bodyParameters));

            let invoiceid_1 = bodyParameters[1]["text"];
            let invoiceid_2 = bodyParameters[2]["text"];
            let executive_name = bodyParameters[3]["text"];

            let invoice_id = invoiceid_1 + invoiceid_2;
            console.log("Kavedia------------------------->" + invoice_id, invoiceid_1, invoiceid_2, executive_name, wanumber, context_id);


            let query1 = "Replace into request_table(wanumber,context_id,executive_name,invoice_num,date)" +
                "Values(?,?,?,?,NOW())";
            let insrequest = await mydb.query(query1, [wanumber, context_id, executive_name, invoice_id]);
            console.log("Kavedia------------------------->" + insrequest, wanumber);

            res.send({
                code: 200,
                status: "success",
                type: 'text',
                data: "Event Recived"
            });

        } else {
            console.log("No body parameters found.");
            res.send({
                code: 100,
                status: "failed",
                data: "No body parameters found."
            });
        }
    } catch (error) {
        console.log(error);
        res.send({
            code: 100,
            status: "failed",
            data: "Event not Recived"
        });
    }
});


router.post('/details/:wanumber/:rating', async (req, res) => {

    let wanumber = req.params.wanumber;
    let rating = req.params.rating

    let query = "Select * from request_table where wanumber = ?";
    let reqdetails = await mydb.query(query, [wanumber]);
    let result = JSON.stringify(reqdetails[0][0]);
    let invoice_id = reqdetails[0][0].invoice_num;
    console.log("Kavedia------------------------->" + JSON.stringify(result));
    console.log("Kavedia------------------------->" + JSON.stringify(invoice_id));


    var config = {
        method: 'post',
        url: encodeURI('https://kavedia.acmepadm.com:8443/acme-document-web//doc/updateRatingInSalesBill/rating/' + invoice_id + '/' + rating + '?sProgramKey=25438546789662975&authorization=jdO4jCFnTnOPA5VnQHOmgLhnTnONZeZcRnO3.jdO4EB9mgsWIg6WqNotcQHOmhMGIg6WqNotcQHOog65bV63pEXN0RXbniCSqhpSaELZnToNeSelxNrcaE4SaELZnToNcSIJ4QHOoiCOdEB94Zr3xEZSaELZnTol7QHO4hrKOEHN0NnNxNrEuhr5LfB9EEBKdXBVnToS3.K6DEEy_exTn3b1G3U6a3-K8nIaGA2PZX7_y93I6-dR8MCFd7foFUwGUFQ0E25Q0l2aOKJVBxNYBOABXcWEqaPF&X-key=zVhY2RjNGFormBoWI4LWE3YmYtZmY2MzVh'),
        headers: {}
    };

    await axios(config)
        .then(function (response) {
            console.log("Kavedia------------------------->" + JSON.stringify(response.data.data));
            if (response.data.code == 100) {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: response.data.data
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


module.exports = router;
