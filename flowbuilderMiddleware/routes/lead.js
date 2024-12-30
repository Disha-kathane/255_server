let express = require('express');
let router = express.Router();
let async = require('async');
let axios = require('axios');
let mysql = require('mysql');
const cheerio = require('cheerio');


let db_config = {
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'ezeebot',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};


let dbpool = mysql.createPool(db_config);

/* GET home page. */
router.post('/leadSquare', async (req, res, next) => {
    try {
        let messageId = req.body.messageid;
        let mobileNo = req.body.mobileno;
        let query = 'SELECT CAST(wabapayload AS CHAR) string_field FROM ezb_message_sent_master WHERE messageid = ? AND mobileno= ?';
        let values = [messageId, mobileNo];
        // console.log(query, values)
        dbpool.query(query, values, (err, result) => {
            let payload = result[0].string_field;
            res.send({
                code: 200,
                status: "sucess",
                data: payload

            });
        })
    } catch (error) {

        res.send({
            code: 100,
            status: "FAILED",
            data: "Something went wrong."

        });
    }

});

module.exports = router;
