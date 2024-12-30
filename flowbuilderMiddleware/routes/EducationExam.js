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

router.post('/AptiSetFour/:quesno/:wanumber/:ans', (req, res) => {
    let iscorrect = false;
    let Wanumber = req.params.wanumber;
    let QueNo = req.params.quesno;
    let Ans = req.params.ans;
    console.log("ans======", Ans);

    let getSessionId = (callback) => {
        let query = 'SELECT MAX(id) As id FROM `ezb_flowbuilder_session` WHERE mobileno = ?'
        let values = [Wanumber]
        let s = db.query(query, values, (err, result) => {
            if (err) {
                callback(err)
            }
            if (result.length > 0) {
                let SessionId = result[0].id
                callback(null, SessionId)
            } else {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });
            }

        })

    }
    let fetchValue = (SessionId, callback) => {
        let query = 'SELECT attrvalue FROM ezeebot.ezb_flowbuilder_attributes WHERE id = (SELECT MAX(id) FROM ezeebot.ezb_flowbuilder_attributes WHERE session_mobile = ? AND message_type = ?);'
        let values = [Wanumber, 'TEXT']
        let s = db.query(query, values, (err, result) => {
            if (err) {
                callback(err);
            }
            if (result.length > 0 && result != undefined) {
                console.log(result[0].attrvalue)
                let val = Buffer.from(result[0].attrvalue);
                let attrval = val.toString()
                callback(null, SessionId, attrval)
            }
            else {
                callback(1)
            }


        });
        console.log(s.sql);
    }

    let checkAnswer = (SessionId, attrval, callback) => {
        // let checkAnswer = (SessionId, callback) => {
        let query = 'SELECT ans FROM apti4 WHERE quesno=?';
        let values = [QueNo];
        let s = db.query(query, values, (err, result) => {
            if (err) {
                callback(err)
            }
            else {
                if (result.length > 0 && result != undefined) {
                    let DBans = result[0].ans;
                    console.log(DBans, attrval)
                    if (DBans == attrval) {
                        iscorrect = true;
                        if (iscorrect == true) {
                            let query = 'INSERT into edu_apti4_reg (wanumber, iscorrect, quesno ,userans,sessionid) VALUES (?,?,?,?,?)';
                            let values = [Wanumber, iscorrect, QueNo, attrval, SessionId];
                            let s = db.query(query, values, (err, result) => {
                                if (err) {
                                    callback(err);
                                } else {
                                    // console.log(result);
                                    callback(null, result);
                                }
                            });
                            console.log(s.sql);
                        }
                    } else {
                        iscorrect = false;
                        if (iscorrect == false) {
                            let query = 'INSERT into edu_apti4_reg (wanumber, iscorrect, quesno ,userans,sessionid) VALUES (?,?,?,?,?)';
                            let values = [Wanumber, iscorrect, QueNo, attrval, SessionId];
                            let s = db.query(query, values, (err, lesult) => {
                                if (err) {
                                    callback(err);
                                } else {
                                    callback(null, result)
                                }
                            });
                            console.log(s.sql);
                        }

                    }
                } else {
                    res.send({
                        code: 100,
                        status: 'FAILED',
                        data: "Something went wrong"
                    });

                }


            }

        })
    }

    async.waterfall([getSessionId, fetchValue, checkAnswer], (err, result) => {
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
                data: ""
            };
            res.status(200).json(response);
        }

    })

})


router.post('/getScoreFour/:wanumber', (req, res) => {
    let Wanumber = req.params.wanumber;
    console.log(Wanumber)
    let SessionId = req.body.SessionId;

    async.waterfall([
        function (done) {
            var query = "SELECT MAX(sessionid) AS sessionid FROM edu_apti4_reg WHERE wanumber = ?";
            var s = db.query(query, [Wanumber], (err, result) => {
                console.log("result============", result);

                done(err, result[0].sessionid);
            });
        },
        function (SessionId, done) {
            var query = "SELECT COUNT(1) AS C FROM edu_apti4_reg WHERE sessionid = ? AND iscorrect = ?";
            var s = db.query(query, [SessionId, 1], (err, result) => {
                console.log(result[0].C);
                done(err, result[0].C);
            });
        },
        function (c, done) {
            let message = null;
            if (c >= 3) {
                message = "Congratulations! You have been selected to take part in the search of India\'s next Superthinker";
            }
            else {
                message = "Oops! It seems you need some more practice. Visit our website www.aqad.in";
            }
            done(null, message);
        }
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
});



router.post('/AptiSetOne/:quesno/:wanumber/:ans', (req, res) => {
    let iscorrect = false;
    let Wanumber = req.params.wanumber;
    let QueNo = req.params.quesno;
    let Ans = req.params.ans;
    console.log("ans======", Ans);

    let getSessionIdOne = (callback) => {
        let query = 'SELECT MAX(id) As id FROM `ezb_flowbuilder_session` WHERE mobileno = ?'
        let values = [Wanumber]
        let s = db.query(query, values, (err, result) => {
            if (err) {
                callback(err)
            }
            if (result.length > 0) {
                let SessionId = result[0].id
                callback(null, SessionId)
            } else {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });
            }

        })

    }

    let fetchValueOne = (SessionId, callback) => {
        let query = 'SELECT attrvalue FROM ezeebot.ezb_flowbuilder_attributes WHERE id = (SELECT MAX(id) FROM ezeebot.ezb_flowbuilder_attributes WHERE session_mobile = ? AND message_type = ?);'
        let values = [Wanumber, 'TEXT']
        let s = db.query(query, values, (err, result) => {
            if (err) {
                callback(err);
            }
            if (result.length > 0 && result != undefined) {
                console.log(result[0].attrvalue)
                let val = Buffer.from(result[0].attrvalue);
                let attrval = val.toString()
                callback(null, SessionId, attrval)
            }
            else {
                callback(1)
            }


        });
        console.log(s.sql);
    }

    let checkAnswerOne = (SessionId, attrval, callback) => {
        // let checkAnswer = (SessionId, callback) => {
        let query = 'SELECT ans FROM apti1 WHERE quesno=?';
        let values = [QueNo];
        let s = db.query(query, values, (err, result) => {
            if (err) {
                callback(err)
            }
            else {
                if (result.length > 0 && result != undefined) {
                    let DBans = result[0].ans;
                    console.log(DBans, attrval)
                    if (DBans == attrval) {
                        iscorrect = true;
                        if (iscorrect == true) {
                            let query = 'INSERT into edu_apti1_reg (wanumber, iscorrect, quesno ,userans,sessionid) VALUES (?,?,?,?,?)';
                            let values = [Wanumber, iscorrect, QueNo, attrval, SessionId];
                            let s = db.query(query, values, (err, result) => {
                                if (err) {
                                    callback(err);
                                } else {
                                    // console.log(result);
                                    callback(null, result);
                                }
                            });
                            console.log(s.sql);
                        }
                    } else {
                        iscorrect = false;
                        if (iscorrect == false) {
                            let query = 'INSERT into edu_apti1_reg (wanumber, iscorrect, quesno ,userans,sessionid) VALUES (?,?,?,?,?)';
                            let values = [Wanumber, iscorrect, QueNo, attrval, SessionId];
                            let s = db.query(query, values, (err, lesult) => {
                                if (err) {
                                    callback(err);
                                } else {
                                    callback(null, result)
                                }
                            });
                            console.log(s.sql);
                        }

                    }
                } else {
                    res.send({
                        code: 100,
                        tatus: 'FAILED',
                        data: "Something went wrong"
                    });

                }


            }

        })
    }

    async.waterfall([getSessionIdOne, fetchValueOne, checkAnswerOne], (err, result) => {
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
                data: ""
            };
            res.status(200).json(response);
        }

    })
})



router.post('/getScoreOne/:wanumber', (req, res) => {
    let Wanumber = req.params.wanumber;
    console.log(Wanumber)
    let SessionId = req.body.SessionId;

    async.waterfall([
        function (done) {
            var query = "SELECT MAX(sessionid) AS sessionid FROM edu_apti1_reg WHERE wanumber = ?";
            var s = db.query(query, [Wanumber], (err, result) => {
                console.log("result============", result);

                done(err, result[0].sessionid);
            });
        },
        function (SessionId, done) {
            var query = "SELECT COUNT(1) AS C FROM edu_apti1_reg WHERE sessionid = ? AND iscorrect = ?";
            var s = db.query(query, [SessionId, 1], (err, result) => {
                console.log(result[0].C);
                done(err, result[0].C);
            });
        },
        function (c, done) {
            let message = null;
            if (c >= 3) {
                message = "Congratulations! You have been selected to take part in the search of India\'s next Superthinker";
            }
            else {
                message = "Oops! It seems you need some more practice. Visit our website www.aqad.in";
            }
            done(null, message);
        }
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
});


router.post('/AptiSetTwo/:quesno/:wanumber/:ans', (req, res) => {

    let iscorrect = false;
    let Wanumber = req.params.wanumber;
    let QueNo = req.params.quesno;
    let Ans = req.params.ans;
    console.log("ans======", Ans);

    let getSessionIdTwo = (callback) => {
        let query = 'SELECT MAX(id) As id FROM `ezb_flowbuilder_session` WHERE mobileno = ?'
        let values = [Wanumber]
        let s = db.query(query, values, (err, result) => {
            if (err) {
                callback(err)
            }
            if (result.length > 0) {
                let SessionId = result[0].id
                callback(null, SessionId)
            } else {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: "Something went wrong"
                });
            }

        })

    }

    let fetchValueTwo = (SessionId, callback) => {
        let query = 'SELECT attrvalue FROM ezeebot.ezb_flowbuilder_attributes WHERE id = (SELECT MAX(id) FROM ezeebot.ezb_flowbuilder_attributes WHERE session_mobile = ? AND message_type = ?);'
        let values = [Wanumber, 'TEXT']
        let s = db.query(query, values, (err, result) => {
            if (err) {
                callback(err);
            }
            if (result.length > 0 && result != undefined) {
                console.log(result[0].attrvalue)
                let val = Buffer.from(result[0].attrvalue);
                let attrval = val.toString()
                callback(null, SessionId, attrval)
            }
            else {
                callback(1)
            }


        });
        console.log(s.sql);
    }

    let checkAnswerTwo = (SessionId, attrval, callback) => {
        // let checkAnswer = (SessionId, callback) => {
        let query = 'SELECT ans FROM apti2 WHERE quesno=?';
        // console.log(quesno);
        let values = [QueNo];
        let s = db.query(query, values, (err, result) => {
            if (err) {
                callback(err)
            }
            else {
                if (result.length > 0 && result != undefined) {
                    let DBans = result[0].ans;
                    console.log(DBans, attrval)
                    if (DBans == attrval) {
                        iscorrect = true;
                        if (iscorrect == true) {
                            let query = 'INSERT into edu_apti2_reg (wanumber, iscorrect, quesno ,userans,sessionid) VALUES (?,?,?,?,?)';
                            let values = [Wanumber, iscorrect, QueNo, attrval, SessionId];
                            let s = db.query(query, values, (err, result) => {
                                if (err) {
                                    callback(err);
                                } else {
                                    // console.log(result);
                                    callback(null, result);
                                }
                            });
                            console.log(s.sql);
                        }
                    } else {
                        iscorrect = false;
                        if (iscorrect == false) {
                            let query = 'INSERT into edu_apti2_reg (wanumber, iscorrect, quesno ,userans,sessionid) VALUES (?,?,?,?,?)';
                            let values = [Wanumber, iscorrect, QueNo, attrval, SessionId];
                            let s = db.query(query, values, (err, lesult) => {
                                if (err) {
                                    callback(err);
                                } else {
                                    callback(null, result)
                                }
                            });
                            console.log(s.sql);
                        }

                    }
                } else {
                    res.send({
                        code: 100,
                        tatus: 'FAILED',
                        data: "Something went wrong"
                    });

                }


            }

        })
    }

    async.waterfall([getSessionIdTwo, fetchValueTwo, checkAnswerTwo], (err, result) => {
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
                data: ""
            };
            res.status(200).json(response);
        }

    })



})



router.post('/getScoreTwo/:wanumber', (req, res) => {
    let Wanumber = req.params.wanumber;
    console.log(Wanumber)
    let SessionId = req.body.SessionId;

    async.waterfall([
        function (done) {
            var query = "SELECT MAX(sessionid) AS sessionid FROM edu_apti2_reg WHERE wanumber = ?";
            var s = db.query(query, [Wanumber], (err, result) => {
                console.log("result============", result);

                done(err, result[0].sessionid);
            });
        },
        function (SessionId, done) {
            var query = "SELECT COUNT(1) AS C FROM edu_apti2_reg WHERE sessionid = ? AND iscorrect = ?";
            var s = db.query(query, [SessionId, 1], (err, result) => {
                console.log(result[0].C);
                done(err, result[0].C);
            });
        },
        function (c, done) {
            let message = null;
            if (c >= 3) {
                message = "Congratulations! You have been selected to take part in the search of India\'s next Superthinker";
            }
            else {
                message = "Oops! It seems you need some more practice. Visit our website www.aqad.in";
            }
            done(null, message);
        }
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
});


module.exports = router;
