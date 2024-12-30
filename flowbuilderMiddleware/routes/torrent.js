const express = require('express');
const router = express.Router();
const async = require('async');
let mysql = require('mysql');


//DB Connection
let dbpool;
let db_config = {
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'torrent_gas',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};
dbpool = mysql.createPool(db_config);

//Send pdf for CNG pincodes
router.post('/checkpincode2/:pincode', (req, res) => {
    let Upincode = req.params.pincode;
    let firstdigit = Upincode.charAt(0);
    if (Upincode > 0 && Upincode.length == 6) {
        if (firstdigit == 0) {
            let response = {
                code: 100,
                status: "Invalid Pincode"
            }
            res.status(200).json(response);
        }
        else {
            let fetchValue = (callback) => {
                let query = 'SELECT Pdf FROM `pincode_pdf_master` where Pincode =?';
                let value = [Upincode]
                let s = dbpool.query(query, value, (err, result) => {
                    if (err) {
                        console.log("error==================", err);
                        callback(err);
                    }
                    if (result.length > 0 && result != undefined) {
                        let pdf = result[0].Pdf;
                        callback(null, pdf.replace(/\r/g, ''))
                    } else {
                        callback("No Record Found")
                    }
                });
                console.log(s.sql);
            }

            async.waterfall([fetchValue], (err, result) => {
                if (err) {
                    res.send({
                        code: 100,
                        status: 'No Record Found'

                    });
                } else {
                    let response = {
                        code: 200,
                        status: "SUCCESS",
                        type: "document",
                        url: result,
                        data: "To Go Back to main menu, please enter *B*."
                    };
                    res.status(200).json(response);
                }
            });
        }
    } else {
        let response = {
            code: 100,
            status: "Invalid Pincode"
        }
        res.status(200).json(response);
    }
});

//Send pdf for RFC pincodes 
router.post('/checkRfcpincode2/:pincode', (req, res) => {
    let Upincode = req.params.pincode;
    let firstdigit = Upincode.charAt(0);
    if (Upincode > 0 && Upincode.length == 6) {
        if (firstdigit == 0) {
            let response = {
                code: 100,
                status: "Invalid Pincode"
            }
            res.status(200).json(response);
        }
        else {
            let fetchValue = (callback) => {
                let query = 'SELECT Pdf FROM `District_RFC_master` where Pincode =?';
                let value = [Upincode]
                let s = dbpool.query(query, value, (err, result) => {
                    if (err) {
                        console.log("error==================", err);
                        callback(err);
                    }
                    if (result.length > 0 && result != undefined) {
                        let pdf = result[0].Pdf;
                        callback(null, pdf.replace(/\r/g, ''))
                    } else {
                        callback("No Record Found")
                    }
                });
                console.log(s.sql);
            }

            async.waterfall([fetchValue], (err, result) => {
                if (err) {
                    res.send({
                        code: 100,
                        status: 'No Record Found'

                    });
                } else {
                    let response = {
                        code: 200,
                        status: "SUCCESS",
                        type: "document",
                        url: result,
                        data: "To Go Back to main menu, please enter *B*."
                    };
                    res.status(200).json(response);
                }
            });
        }
    } else {
        let response = {
            code: 100,
            status: "Invalid Pincode"
        }
        res.status(200).json(response);
    }
});

//check districts for CNG 
router.post('/checkDistrict/:district', (req, res) => {
    let District = req.params.district;
    // console.log(District)
    let dis1 = District.replace(/ /g, '');
    let sas = dis1.substring(0, 5);
    let fetchvalue = (callback) => {
        let query = 'SELECT DISTINCT District,Pdf FROM `pincode_pdf_master` WHERE LOWER(District) Like LOWER(?)'
        let value = [sas + "%"]
        let s = dbpool.query(query, value, (err, result) => {
            console.log('District result--------------->' + JSON.stringify(result));
            if (err) {
                callback(err)
                console.log(err)

            }
            if (result.length > 1) {
                let districtResult = 'Please select your exact city\n\n';

                for (let i = 0; i < result.length; i++) {
                    let tempDistrict = result[i].District;
                    districtResult += "*" + tempDistrict + "*\n";
                    if (i == (result.length) - 1) {
                        let response = {
                            code: 200,
                            status: "success",
                            type: "text",
                            data: districtResult


                        };
                        callback(null, response);
                    }

                }

            } else if (result.length == 1) {
                let pdf = result[0].Pdf.replace(/\r/g, '');

                let response = {
                    code: 300,
                    status: "success",
                    type: "document",
                    url: pdf,
                    data: "To Go Back to main menu, please enter *B*"

                };
                callback(null, response);
            }
            else {
                callback({
                    code: 100,
                    status: "Invalid District"
                });
            }

        });
        console.log(s.sql)
    }
    async.waterfall([fetchvalue], (err, result) => {

        if (err) {
            res.send(err);
        } else {
            res.status(200).json(result);
        }
    });

});

//send pdf for CNG districts
router.post('/checkDistrict2/:district', (req, res) => {
    let District = req.params.district;
    let sas = District.substring(0, 5);
    let fetchvalue = (callback) => {
        let query = 'SELECT DISTINCT Pdf FROM `pincode_pdf_master` where LOWER(District) = LOWER(?)'
        let value = [District]
        console.log(value)
        let s = dbpool.query(query, value, (err, result) => {
            if (err) {
                callback(err)
                console.log(err)

            }
            else {
                if (result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        let pdf = result[0].Pdf;
                        callback(null, pdf.replace(/\r/g, ''));
                    }

                } else {
                    callback("No record Found");
                }
            }
        });
        console.log(s.sql)
    }
    async.waterfall([fetchvalue], (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: "Invalid District"
            });
        } else {
            let response = {
                code: 200,
                status: "success",
                type: "document",
                url: result,
                data: "To Go Back to main menu, please enter *B*"


            };
            res.status(200).json(response);
        }
    });

});

//Check districts for RFC
router.post('/checkRfcDistrict/:district', (req, res) => {
    let District = req.params.district;
    // console.log(District)
    let dis1 = District.replace(/ /g, '');
    // console.log(dis1)
    let sas = dis1.substring(0, 5);
    let fetchvalue = (callback) => {
        let query = 'SELECT DISTINCT District,Pdf FROM `District_RFC_master` WHERE LOWER(District) Like LOWER(?)'
        let value = [sas + "%"]
        let s = dbpool.query(query, value, (err, result) => {
            // console.log('District result--------------->' + JSON.stringify(result));
            if (err) {
                callback(err)
                console.log(err)

            }
            if (result.length > 1) {
                let districtResult = 'Please select your city\n\n';

                for (let i = 0; i < result.length; i++) {
                    let tempDistrict = result[i].District;
                    console.log(tempDistrict);

                    districtResult += "*" + tempDistrict + "*\n";
                    if (i == (result.length) - 1) {
                        let response = {
                            code: 200,
                            status: "success",
                            type: "text",
                            data: districtResult


                        };
                        callback(null, response);
                    }
                }
            } else if (result.length == 1) {
                let pdf = result[0].Pdf.replace(/\r/g, '');

                let response = {
                    code: 300,
                    status: "success",
                    type: "document",
                    url: pdf,
                    data: "To Go Back to main menu, please enter *B*"

                };
                callback(null, response);


            } else {
                callback({
                    code: 100,
                    status: "Invalid District"
                });
            }

        });
        console.log(s.sql)
    }
    async.waterfall([fetchvalue], (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.status(200).json(result);
        }
    });

});

//Send pdf for RFC districts
router.post('/checkRfcDistrict2/:district', (req, res) => {
    let District = req.params.district;
    let sas = District.substring(0, 5);
    let fetchvalue = (callback) => {
        let query = 'SELECT DISTINCT Pdf FROM `District_RFC_master` where LOWER(District) = LOWER(?)'
        let value = [District]
        console.log(value)
        let s = dbpool.query(query, value, (err, result) => {
            if (err) {
                callback(err)
                console.log(err)

            }
            else {
                if (result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        let pdf = result[0].Pdf;
                        callback(null, pdf);
                    }

                } else {
                    callback("No record Found");
                }
            }
        });
        console.log(s.sql)
    }
    async.waterfall([fetchvalue], (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: "Invalid District"

            });
        } else {
            let response = {
                code: 200,
                status: "success",
                type: "document",
                url: result,
                data: "To Go Back to main menu, please enter *B*"
            };
            res.status(200).json(response);
        }
    });

});

module.exports = router;
