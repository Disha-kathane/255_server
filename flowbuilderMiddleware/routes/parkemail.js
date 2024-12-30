let express = require('express');
let router = express.Router();
let async = require('async');
let mysql = require('mysql');
var Buffer = require('buffer/').Buffer;

let db;

let db_config = {
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'ezeebot',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};


db = mysql.createPool(db_config);

router.post('/forparkhospitalemail/:wanumber', (req, res) => {

    Wanumber = req.params.wanumber;

    async.waterfall([
        (done) => {
            let query = "SELECT mediaurl,id FROM ezb_flowbuilder_attributes " +
                " WHERE id = (SELECT MAX(a.id) FROM ezb_flowbuilder_attributes AS a, ezb_flowbuilder_session AS b " +
                " WHERE a.message_type IN ('text') AND a.session_mobile = ? AND b.id = a.flowid AND b.userid = 1192 AND a.mediatype = 'document' AND a.isprocessed = 0);"
            let s = db.query(query, [Wanumber], (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Result_My====================================>'+JSON.stringify(result));
                }
                done(err, result);

            })
            console.log(s.sql);

        },
        (result, done) => {
            if (result.length > 0) {
                let query = "Update ezb_flowbuilder_attributes set isprocessed = ? where id = ?"
                db.query(query, [1, result[0].id], (err, result1) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(result1);
                    }
                    done(err, result);
                })
            }
            else {
                done(null, result);
            }

        },
    ], (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: 'FAILED',
                data: "Something went wrong"
            });
        } else {
            let response = {
                code: 200,
                status: "success",
                type: "text",
                data: result
            };
            res.status(200).json(response);
        }
    });
})


module.exports = router;
