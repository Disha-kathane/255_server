let express = require('express');
let router = express.Router();
let async = require('async');
let mysql = require('mysql');
// let axios = require('axios');
// let dbpool = require('../DbFiles/torrentDB');

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

//-------------------------------------------------------------CNG---------------------------------------------------------------------------------------------

router.post('/checkDistrict/:district', (req, res) => {
    let District = req.params.district;
    // let sas = District.substring(0, 5);
    let fetchvalue = (callback) => {
        let query = 'SELECT DISTINCT Pdf FROM `pincode_pdf_master` where LOWER(District) = LOWER(?)'
        let value = [District]
        let s = dbpool.query(query, value, (err, result) => {
            if (err) {
                callback(err)
                // console.log(err)

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
                status: "FAILED",
                data: "Please enter the exact name of district  *OR* enter *B* to go back to Main Menu."

            });
        } else {
            let response = {
                code: 200,
                status: "success",
                type: "document",
                url: result,
                data: "Thank you for providing opportunity to serve you. Please find below requested details for the District *"+District+"*. Type Y to continue for more search."
            };
            res.status(200).json(response);
        }
    });

});

router.post('/checkCNG/:value', (req, res) => {
    let Value = req.params.value;
    let Val1 = Value.replace(/ /g, '')
    function isNum(Val1) {
        return !isNaN(Val1)
    }
    let checkval = isNum(Val1)
    let fetchValue = (callback) => {
        if (checkval == true) {
            let firstdigit = Val1.charAt(0);
            if (Val1 > 0 && Val1.length == 6) {
                if (firstdigit == 0) {
                    let response = {
                        code: 100,
                        status: "FAILED",
                        data: "Please enter Pin code (6 digits) OR first 3 letters of the district name you are looking for, enter *B* to go back to Main Menu."
                    }
                    res.status(200).json(response);
                } else {
                    let query = 'SELECT Pdf,District FROM `pincode_pdf_master` where Pincode =?';
                    let value = [Val1]
                    console.log("===========================>"+value);
                    let s = dbpool.query(query, value, (err, result) => {
                        if (err) {
                            callback(err);
                        }
                        if (result.length > 0 && result != undefined) {
                            let pdf = result[0].Pdf;
                            let district = result[0].District;
                            console.log("===========================>"+district);
                            let response = {
                                code: 300,
                                status: "success",
                                type: "document",
                                url: pdf.replace(/\r/g, ''),
                                data: "Thank you for providing opportunity to serve you. Please find below requested details for the District *"+district+"*. Type Y to continue for more search."
                            };
                            res.status(200).json(response);
                        } else {
                            callback({
                                code: 100,
                                status: "FAILED",
                                data: "Torrent Gas is not present in the pin code entered by you.\nYou can continue with your search for other locations.Please enter Pin code (6 digits) OR first 3 letters of the district name you are looking for. \n Enter *B* to go back to Main Menu."
                            })
                        }
                    });
                    console.log(s.sql);
                }
            } else {

                let response = {
                    code: 100,
                    status: "FAILED",
                    data: "Torrent Gas is not present in the pin code indicated by you.\nYou can continue with your search for other locations,\nPlease enter Pin code *(6 digits)* OR first *3* letters of the district name you are looking for.\n Enter *B* to go back to Main Menu."
                }
                res.status(200).json(response);
            }
        } else {
            let DistrictLength = Val1.length;

            if (DistrictLength < 3) {
                // tempDistrict == districtResult;
                let response = {
                    code: 100,
                    status: "FAILED",
                    data: "Torrent Gas is not present in the district indicated by you. You can continue with your search for other locations. Please entre pin code (6 digits) or first 3 letters of the district name to be display enter *B* to go back to Main Menu."
                }
                res.status(200).json(response);
            }
            else {
                // console.log("you have entered ", Val1)
                let query1 = 'SELECT DISTINCT District,Pdf FROM `pincode_pdf_master` WHERE LOWER(District) Like LOWER(?)';
                let value1 = [Val1 + "%"]
                let s1 = dbpool.query(query1, value1, (err, result) => {
                    if (err) {
                        callback(err);
                    }
                    if (result.length > 1) {
                        // console.log(result)
                        let districtResult = 'Multiple district names are available against your search. \nPlease enter exact district name out of below options.\n\n';
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

                                res.status(200).json(response);
                            }
                        }
                    }
                    else if (result.length == 1) {
                        console.log(result);
                        console.log("==============================>"+Value);
                        let district = result[0].District;
                        let pdf = result[0].Pdf.replace(/\r/g, '');
                        // let tempDistrict = result[i].District;
                        let response = {
                            code: 300,
                            status: "success",
                            type: "document",
                            url: pdf,
                            data: "Thank you for providing opportunity to serve you. Please find below requested details for the District *"+district+"*. Type Y to continue for more search."
                        };
                        res.status(200).json(response);


                    } else {
                        callback({
                            code: 100,
                            status: "FAILED",
                            data: "Torrent Gas is not present in the district indicated by you.\nYou can continue with your search for other locations,\nPlease enter Pin code *(6 digits)* OR first *3* letters of the district name you are looking for.\n Enter *B* to go back to Main Menu."
                        });
                    }

                });
                console.log(s1.sql);
            }
        }
    }
    async.waterfall([fetchValue], (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.status(200).json(result);
        }
    });


})
//--------------------------------------------------------------------------------------------------RFC------------------------------------------------------------------
router.post('/checkRFCDistrict/:district', (req, res) => {
    let District = req.params.district;
    // let sas = District.substring(0, 5);
    let fetchvalue = (callback) => {
        let query = 'SELECT DISTINCT Pdf FROM `District_RFC_master` where LOWER(District) = LOWER(?)'
        let value = [District]
        let s = dbpool.query(query, value, (err, result) => {
            if (err) {
                callback(err)
                // console.log(err)

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
                status: "FAILED",
                data: "Please enter the exact name of district *OR* enter  *B* to go back to Main Menu."

            });
        } else {
            let response = {
                code: 200,
                status: "success",
                type: "document",
                url: result,
                data: "Thank you for providing opportunity to serve you. Please find below requested details for the District *"+District+"*. Type Y to continue for more search."
            };
            res.status(200).json(response);
        }
    });

});
//-------------------------------------------------------------------------combine------------------------------------------------------------------
//--------------------------------------------------------------------------RFC-----------------------------------------------------------------------
router.post('/checkRFC/:value', (req, res) => {
    let Value = req.params.value;
    let Val1 = Value.replace(/ /g, '')
    function isNum(Val1) {
        return !isNaN(Val1)
    }
    let checkval = isNum(Val1)
    let fetchValue = (callback) => {
        if (checkval == true) {
            let firstdigit = Val1.charAt(0);
            if (Val1 > 0 && Val1.length == 6) {
                if (firstdigit == 0) {
                    let response = {
                        code: 100,
                        status: "FAILED",
                        data: "Please enter Pin code *(6 digits)* OR first *3* letters of the district name you are looking for, enter *B* to go back to Main Menu."
                    }
                    res.status(200).json(response);
                } else {
                    let query = 'SELECT Pdf,District FROM `District_RFC_master` where Pincode =?';
                    let value = [Val1]
                    let s = dbpool.query(query, value, (err, result) => {
                        if (err) {
                            callback(err);
                        }
                        if (result.length > 0 && result != undefined) {
                            let pdf = result[0].Pdf;
                            let district = result[0].District;
                            let response = {
                                code: 300,
                                status: "success",
                                type: "document",
                                url: pdf.replace(/\r/g, ''),
                                data: "Thank you for providing opportunity to serve you. Please find below requested details for the District *"+district+"*. Type Y to continue for more search."
                            };
                            res.status(200).json(response);
                        } else {
                            callback({
                                code: 100,
                                status: "FAILED",
                                data: "Torrent Gas is not present in the pin code entered by you.\nYou can continue with your search for other locations.Please enter Pin code *(6 digits)* OR first 3 letters of the district name you are looking for. \n Enter *B* to go back to Main Menu."
                            })
                        }
                    });
                    console.log(s.sql);
                }
            } else {

                let response = {
                    code: 100,
                    status: "FAILED",
                    data: "Torrent Gas is not present in the Pincode indicated by you.\nYou can continue with your search for other locations,\nPlease enter Pin code *(6 digits)* OR first *3* letters of the district name you are looking for.\n Enter *B* to go back to Main Menu."
                }
                res.status(200).json(response);
            }
        } else {
            let DistrictLength = Val1.length;

            if (DistrictLength < 3) {
                // tempDistrict == districtResult;
                let response = {
                    code: 100,
                    status: "FAILED",
                    data: "Torrent Gas is not present in the district indicated by you. You can continue with your search for other locations. Please entre pin code *(6 digits)* or first 3 letters of the district name to be display enter *B* to go back to Main Menu."
                }
                res.status(200).json(response);
            }
            else {
                // console.log("you have entered ", Val1)
                let query1 = 'SELECT DISTINCT District,Pdf FROM `District_RFC_master` WHERE LOWER(District) Like LOWER(?)';
                let value1 = [Val1 + "%"]
                let s1 = dbpool.query(query1, value1, (err, result) => {
                    if (err) {
                        callback(err);
                    }
                    if (result.length > 1) {
                        // console.log(result)
                        let districtResult = 'Multiple district names are available against your search. \nPlease enter exact district name out of below options.\n\n';
                        for (let i = 0; i < result.length; i++) {
                            let tempDistrict = result[i].District;
                            // districtResult += "*" + tempDistrict + "*\n";
                            districtResult += "*" + tempDistrict + "*\n";
                            if (i == (result.length) - 1) {
                                let response = {
                                    code: 200,
                                    status: "success",
                                    type: "text",
                                    data: districtResult
                                };

                                res.status(200).json(response);
                            }
                        }
                    }
                    else if (result.length == 1) {
                        console.log(result);
                        let pdf = result[0].Pdf.replace(/\r/g, '');
                        let district = result[0].District;
                        let response = {
                            code: 300,
                            status: "success",
                            type: "document",
                            url: pdf,
                            data: "Thank you for providing opportunity to serve you. Please find below requested details for the District *"+district+"*. Type Y to continue for more search."
                        };
                        res.status(200).json(response);


                    } else {
                        callback({
                            code: 100,
                            status: "FAILED",
                            data: "Torrent Gas is not present in the district indicated by you.\nYou can continue with your search for other locations,\nPlease enter Pin code *(6 digits)* OR first *3* letters of the district name you are looking for.\n Enter *B* to go back to Main Menu."
                        });
                    }

                });
                console.log(s1.sql);
            }
        }
    }
    async.waterfall([fetchValue], (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.status(200).json(result);
        }
    });
});
router.post('/checkOPTDistrict/:district', (req, res) => {
    let District = req.params.district;
    // let sas = District.substring(0, 5);
    let fetchvalue = (callback) => {
        let query = 'SELECT DISTINCT Pdf FROM `Schemas_p_d_master` where LOWER(District) = LOWER(?)'
        let value = [District]
        let s = dbpool.query(query, value, (err, result) => {
            if (err) {
                callback(err)
                // console.log(err)

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
                status: "FAILED",
                data: "Please enter the exact name of district *OR* enter  *B* to go back to Main Menu."

            });
        } else {
            let response = {
                code: 200,
                status: "success",
                type: "document",
                url: result,
                data: "Thank you for providing opportunity to serve you. Please find below requested details for the District *"+District+"*. Type Y to continue for more search."
            };
            res.status(200).json(response);
        }
    });

});
//--------------------------------------------------------------------------OPT-----------------------------------------------------------------------
router.post('/checkOPT/:value', (req, res) => {
    let Value = req.params.value;
    let Val1 = Value.replace(/ /g, '')
    function isNum(Val1) {
        return !isNaN(Val1)
    }
    let checkval = isNum(Val1)
    let fetchValue = (callback) => {
        if (checkval == true) {
            let firstdigit = Val1.charAt(0);
            if (Val1 > 0 && Val1.length == 6) {
                if (firstdigit == 0) {
                    let response = {
                        code: 100,
                        status: "FAILED",
                        data: "Please enter Pin code *(6 digits)* OR first *3* letters of the district name you are looking for, enter *B* to go back to Main Menu."
                    }
                    res.status(200).json(response);
                } else {
                    let query = 'SELECT Pdf,District FROM `Schemas_p_d_master` where Pincode =?';
                    let value = [Val1]
                    let s = dbpool.query(query, value, (err, result) => {
                        if (err) {
                            callback(err);
                        }
                        if (result.length > 0 && result != undefined) {
                            let pdf = result[0].Pdf;
                            let district = result[0].District;
                            let response = {
                                code: 300,
                                status: "success",
                                type: "document",
                                url: pdf.replace(/\r/g, ''),
                                data: "Thank you for providing opportunity to serve you. Please find below requested details for the District *"+district+"*. Type Y to continue for more search."
                            };
                            res.status(200).json(response);
                        } else {
                            callback({
                                code: 100,
                                status: "FAILED",
                                data: "Torrent Gas is not present in the pin code entered by you.\nYou can continue with your search for other locations.Please enter Pin code *(6 digits)* OR first 3 letters of the district name you are looking for. \n Enter *B* to go back to Main Menu."
                            })
                        }
                    });
                    console.log(s.sql);
                }
            } else {

                let response = {
                    code: 100,
                    status: "FAILED",
                    data: "Torrent Gas is not present in the Pincode indicated by you.\nYou can continue with your search for other locations,\nPlease enter Pin code *(6 digits)* OR first *3* letters of the district name you are looking for.\n Enter *B* to go back to Main Menu."
                }
                res.status(200).json(response);
            }
        } else {
            let DistrictLength = Val1.length;

            if (DistrictLength < 3) {
                // tempDistrict == districtResult;
                let response = {
                    code: 100,
                    status: "FAILED",
                    data: "Torrent Gas is not present in the district indicated by you. You can continue with your search for other locations. Please entre pin code *(6 digits)* or first 3 letters of the district name to be display enter *B* to go back to Main Menu."
                }
                res.status(200).json(response);
            }
            else {
                // console.log("you have entered ", Val1)
                let query1 = 'SELECT DISTINCT District,Pdf FROM `Schemas_p_d_master` WHERE LOWER(District) Like LOWER(?)';
                let value1 = [Val1 + "%"]
                let s1 = dbpool.query(query1, value1, (err, result) => {
                    if (err) {
                        callback(err);
                    }
                    if (result.length > 1) {
                        // console.log(result)
                        let districtResult = 'Multiple district names are available against your search. \nPlease enter exact district name out of below options.\n\n';
                        for (let i = 0; i < result.length; i++) {
                            let tempDistrict = result[i].District;
                            // districtResult += "*" + tempDistrict + "*\n";
                            districtResult += "*" + tempDistrict + "*\n";
                            if (i == (result.length) - 1) {
                                let response = {
                                    code: 200,
                                    status: "success",
                                    type: "text",
                                    data: districtResult
                                };

                                res.status(200).json(response);
                            }
                        }
                    }
                    else if (result.length == 1) {
                        console.log(result);
                        let pdf = result[0].Pdf.replace(/\r/g, '');
                        let district = result[0].District;
                        let response = {
                            code: 300,
                            status: "success",
                            type: "document",
                            url: pdf,
                            data: "Thank you for providing opportunity to serve you. Please find below requested details for the District *"+district+"*. Type Y to continue for more search."
                        };
                        res.status(200).json(response);


                    } else {
                        callback({
                            code: 100,
                            status: "FAILED",
                            data: "Torrent Gas is not present in the district indicated by you.\nYou can continue with your search for other locations,\nPlease enter Pin code *(6 digits)* OR first *3* letters of the district name you are looking for.\n Enter *B* to go back to Main Menu."
                        });
                    }

                });
                console.log(s1.sql);
            }
        }
    }
    async.waterfall([fetchValue], (err, result) => {
        if (err) {
            res.send(err);
        } else {
            res.status(200).json(result);
        }
    });
})
module.exports = router;


