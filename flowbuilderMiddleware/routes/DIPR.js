let express = require('express');
let router = express.Router();
let mysql = require('mysql');
let axios = require('axios');
let async = require('async');

let db_config = {
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'dipr_subscription',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};

let dbpool = mysql.createPool(db_config);


router.post('/CheckSubscription/:wanumber', (req, res) => {
    try {

        let Wanumber = (typeof req.params.wanumber != undefined) ? req.params.wanumber + '' : '';
        let subscription_flag = false;
        //Count is used to check weather the wanumber is exist in the table or not
        query = 'SELECT COUNT(*) as a FROM `subscription_master` WHERE mobileno = ?';
        value = [Wanumber];
        let s = dbpool.query(query, value, (err, result) => {
            if (err) {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong in a query"
                });
            } else {
                if (result[0].a == '0') {
                    return res.send({
                        code: 100,
                        status: 'FAILED',
                        data: "NO Record Found"
                    })
                } else {
                    query = "SELECT subscription_flag,keynum FROM `subscription_master` WHERE mobileno = ?";
                    value = [Wanumber];
                    let s1 = dbpool.query(query, value, (err, result) => {

                        if (result[0].subscription_flag == '1' && result[0].keynum == '1') {      //Keyum one is used for English flow
                            res.send({
                                code: 200,
                                status: "success",
                                type: "text",
                                data: "You have already subscribed to the newsletter. Anytime  if you wish to unsubscribe please select *UNSUBSCRIBE* keyword"
                            })

                        } else if (result[0].subscription_flag == '1' && result[0].keynum == '2') { //keynum two is used for Hindi flow
                            res.send({
                                code: 300,
                                status: "success",
                                type: "text",
                                data: "You have already subscribed to the newsletter. Anytime  if you wish to unsubscribe please select *UNSUBSCRIBE* keyword"
                            })
                        } else {
                            
                            res.send({
                                code: 100,
                                status: 'FAILED',
                                data: "NO Record Found"
                            })
                        }

                    })
                    console.log(s1.sql)
                }
            }

        });
        console.log(s.sql);

    } catch (error) {
        res.send({
            code: 100,
            status: 'FAILED',
            data: "Something Went Wrong"
        });

    };
});



router.post('/InsertYes/:wanumber/:keynum', (req, res) => {
    try {

        let Wanumber = (typeof req.params.wanumber != undefined) ? req.params.wanumber + '' : '';
        let Keynum = (typeof req.params.keynum != undefined) ? req.params.keynum + '' : '';
        let subscription_flag = true;

        let query = "REPLACE INTO subscription_master (mobileno,subscription_flag,Keynum) VALUES(?,?,?)";
        let value = [Wanumber, subscription_flag, Keynum];
        let s = dbpool.query(query, value, (err, result) => {
            if (err) {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong in a query"
                });
            } else {
                console.log({ result })
                res.send({
                    code: 200,
                    status: "success",
                    type: "multi",
                    data: "Data Inserted"
                });
            };

        });
        console.log(s.sql)


    } catch (error) {
        res.send({
            code: 100,
            status: 'FAILED',
            data: "Something Went Wrong"
        });

    };

});








router.post('/Unsubscribe/:wanumber', (req, res) => {
    try {
        let Wanumber = (typeof req.params.wanumber != undefined) ? req.params.wanumber + '' : '';
        let query = "DELETE FROM subscription_master WHERE mobileno= ?";
        let value = [Wanumber];
        let s = dbpool.query(query, value, (err, result) => {
            if (err) {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong in a query"
                });
            } else {
                console.log({ result })
                res.send({
                    code: 200,
                    status: "success",
                    type: "text",
                    data: "Record Deleted"
                });
            };
        });

    } catch (err) {
        res.send({
            code: 100,
            status: 'FAILED',
            data: "Something Went Wrong"
        });

    };

});



router.post('/checkpin/:pincode', (req, res) => {
    let Upincode = req.params.pincode;
    let firstdigit = Upincode.charAt(0);
    if (Upincode > 0 && Upincode.length == 6) {
        if (firstdigit == 0) {
            let response = {
                code: 100,
                status: "FAILED",
                type: "text",
                data: "You have entered invalid pincode."
            }
            res.status(200).json(response);
        } else {

            let response = {
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: "Validated Successfully."
            };
            res.status(200).json(response);
        }
    } else {
        let response = {
            code: 100,
            status: "FAILED",
            type: "text",
            data: "You have entered invalid pincode."
        }
        res.status(200).json(response);
    }
});









module.exports = router;
