let express = require('express');
let router = express.Router();
let async = require('async');
let axios = require('axios');
let FormData = require('form-data');
let mysql = require('mysql');


let dbpool;
let db_config = {
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'Lupin_DB',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};
dbpool = mysql.createPool(db_config);

//Lupin code added by sneha 

router.post('/getAllState', (req, res) => {
    let getLoginData = (done) => {
        let data = new FormData();
        data.append('username', 'Whatsapp');
        data.append('password', 'KHYFDHGHFGFDFGGFDGG');
        data.append('client', 'Whatsapp');
        let config = {
            method: 'post',
            url: 'https://uatlims.lupindiagnostics.com/HomeCollectionAPI/api/LoginAPI',
            headers: {
                ...data.getHeaders()
            },
            data: data
        };

        axios(config)
            .then(function (response) {

                let authtoken = response.data.responseBody.attributes[0].attrvalue;
                done(null, authtoken);
            })
            .catch(function (error) {
                done(error);
            });
    }
    let getAllState = (authtoken, done) => {
        let data = new FormData();
        let config = {
            method: 'post',
            url: 'https://uatlims.lupindiagnostics.com/HomeCollectionAPI/api/WhatsApp/GetAllCity',
            headers: {
                'Authorization': 'Bearer ' + authtoken,
                ...data.getHeaders()
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                let typeSmsContent;
                let tempstate = null;
                let j = 1;
                typeSmsContent = '*Select State from the below options*.\n\n*For ex*: Type *1* for ANDHRA PRADESH.\n\n'
                let res = response.data.responseBody;
                console.log({ res })
                if (res.length > 0) {
                    for (i = 0; i < res.length; i++) {
                        if (tempstate != res[i].State) {
                            let State = res[i].State;
                            let StateID = res[i].StateID;
                            let typeId = j;
                            typeSmsContent += '*' + j + '*' + '. ' + State + '\n';
                            let query = 'REPLACE INTO tbl_state(state,stateid,typeid) VALUES(?,?,?)';
                            let values = [State, StateID, typeId];
                            let s = dbpool.query(query, values, (err, result) => {
                                if (err) {
                                    done(err);
                                } else {
                                    // console.log(result);
                                }
                            });
                            console.log(s.sql);
                            tempstate = res[i].State;
                            j = j + 1;

                        }
                    }
                    done(null, typeSmsContent)
                } else {
                    let response = {
                        code: 100,
                        status: 'FAILED',
                        data: "Record Not Found"
                    }
                    res.status(200).json(response);
                }

            })
            .catch(function (error) {
                console.log(error);
            });
    }

    async.waterfall([getLoginData, getAllState], (err, result) => {
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

router.post('/getAllCity/:inputid', (req, res) => {
    let InputId = (typeof req.params.inputid != undefined) ? req.params.inputid + '' : '';
    let getLoginData = (done) => {
        let data = new FormData();
        data.append('username', 'Whatsapp');
        data.append('password', 'KHYFDHGHFGFDFGGFDGG');
        data.append('client', 'Whatsapp');
        let config = {
            method: 'post',
            url: 'https://uatlims.lupindiagnostics.com/HomeCollectionAPI/api/LoginAPI',
            headers: {
                ...data.getHeaders()
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                let authtoken = response.data.responseBody.attributes[0].attrvalue;
                done(null, authtoken);
            })
            .catch(function (error) {
                done(error);
            });
    }
    let getAllCity = (authtoken, done) => {
        let data = new FormData();
        let config = {
            method: 'post',
            url: 'https://uatlims.lupindiagnostics.com/HomeCollectionAPI/api/WhatsApp/GetAllCity',
            headers: {
                'Authorization': 'Bearer ' + authtoken,
                ...data.getHeaders()
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                let typeSmsContent;
                let tempcity;
                let k = 1;
                typeSmsContent = '*Select City from the below options.*\n\n*For ex*: Type *1* for ANANTHPUR.\n\n'
                let res = response.data.responseBody;
                if (res.length > 0) {
                    let query = 'SELECT  state, stateid FROM tbl_state WHERE typeid = ?'
                    let values = [InputId];
                    let s = dbpool.query(query, values, (err, result) => {
                        if (err) {
                            done(err);
                        }
                        if (result != undefined && result.length > 0) {
                            let StateId = result[0].stateid;
                            console.log("stateid=========================", StateId)
                            for (i = 0; i < res.length; i++) {
                                if (tempcity != res[i].City) {
                                    let TempCity = res[i].City;
                                    let TempCityId = res[i].CityID;
                                    let TempStateId = res[i].StateID;
                                    if (StateId == TempStateId) {
                                        let typeId = k;
                                        typeSmsContent += '*' + k + '*' + '. ' + TempCity + '\n';
                                        let query = 'REPLACE INTO tbl_city(city,cityid,typeid,stateid) VALUES(?,?,?,?)';
                                        let values = [TempCity, TempCityId, typeId, StateId];
                                        let s = dbpool.query(query, values, (err, result) => {
                                            if (err) {
                                                done(err);
                                            } else {
                                                // console.log(result);
                                            }
                                        });
                                        console.log(s.sql);
                                        tempcity = res[i].City;
                                        k = k + 1;
                                    }
                                }
                            }
                            done(null, typeSmsContent)
                        } else {
                            done(1)
                        }
                    })
                } else {
                    let response = {
                        code: 100,
                        status: 'FAILED',
                        data: "Record Not Found"
                    }
                    res.status(200).json(response);
                }

            })
            .catch(function (error) {
                console.log(error);
            });
    }

    async.waterfall([getLoginData, getAllCity], (err, result) => {
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

router.post('/checkCityLength/:statevalue/:cityvalue', (req, res) => {
    let StateValue = (typeof req.params.statevalue != undefined) ? req.params.statevalue + '' : '';
    let CityValue = (typeof req.params.cityvalue != undefined) ? req.params.cityvalue + '' : '';
    console.log(StateValue, CityValue)
    let checkCityLength = (done) => {
        // let query = 'SELECT typeid FROM tbl_city WHERE typeid = ? AND stateid =?'
        let query = 'SELECT a.stateid, a.cityid FROM tbl_city AS a, tbl_state AS b' +
            ' WHERE a.stateid = b.`stateid` AND a.`typeid` = ? AND b.`typeid` = ?';
        let value = [CityValue, StateValue]
        let s = dbpool.query(query, value, (err, result) => {
            if (err) {
                done(err)
            }
            if (result.length > 0) {
                done(null, 'Record Found')
            }
            else {
                done(1)
            }
        })
        console.log(s.sql)
    }
    async.waterfall([checkCityLength], (err, result) => {
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

router.post('/getDiseaseOrganHabits/:type', (req, res) => {
    let Type = (typeof req.params.type != undefined) ? req.params.type + '' : '';
    let getLoginData = (done) => {
        let data = new FormData();
        data.append('username', 'Whatsapp');
        data.append('password', 'KHYFDHGHFGFDFGGFDGG');
        data.append('client', 'Whatsapp');
        let config = {
            method: 'post',
            url: 'https://uatlims.lupindiagnostics.com/HomeCollectionAPI/api/LoginAPI',
            headers: {
                ...data.getHeaders()
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                //console.log('getLoginData response--------------------------->' + JSON.stringify(response.data));
                let authtoken = response.data.responseBody.attributes[0].attrvalue;

                done(null, authtoken);
            })
            .catch(function (error) {
                //console.log('getLoginData error--------------------------->' + JSON.stringify(error));
                done(error);
            });
    }
    let getData = (authtoken, done) => {
        let data = new FormData();
        data.append('Type', Type);
        let config = {
            method: 'post',
            url: 'https://uatlims.lupindiagnostics.com/HomeCollectionAPI/api/WhatsApp/GetOrgan_Disease_Habits',
            headers: {
                'Authorization': 'Bearer ' + authtoken,
                ...data.getHeaders()
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                let disesaseArr = response.data.responseBody;
                if (disesaseArr.length > 0) {
                    let typeSmsContent = '*Please select below option.*\n\n*For ex*: Type *1* for ALLERGY.\n\n';
                    for (let k = 0; k < disesaseArr.length; k++) {
                        // console.log("mappingname===================", disesaseArr[k].MappingName)
                        TypeId = (k + 1);
                        typeSmsContent += '*' + (k + 1) + '*' + '. ' + disesaseArr[k].MappingName + '\n';
                        let query = 'REPLACE INTO tbl_lupin(type,mappingname,typeid) VALUES(?,?,?)';
                        let values = [Type, disesaseArr[k].MappingName, TypeId];
                        let s = dbpool.query(query, values, (err, result) => {
                            if (err) {
                                done(err);
                            } else {
                                // console.log(result);
                            }
                        });
                        console.log(s.sql);
                    }
                    done(null, typeSmsContent);
                } else {
                    let response = {
                        code: 100,
                        status: 'FAILED',
                        data: "Record Not Found"
                    }
                    res.status(200).json(response);
                }
            })
            .catch(function (error) {
                done(error);

            });
    }

    async.waterfall([getLoginData, getData], (err, result) => {
        if (err) {
            // console.log(JSON.stringify(err));
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

router.post('/getItemList/:stypeid/:ctypeid/:type/:mappingid', (req, res) => {
    let StypeId = (typeof req.params.stypeid != undefined) ? req.params.stypeid + '' : '';
    let CtypeId = (typeof req.params.ctypeid != undefined) ? req.params.ctypeid + '' : '';
    let Type = (typeof req.params.type != undefined) ? req.params.type + '' : '';
    let MappingId = (typeof req.params.mappingid != undefined) ? req.params.mappingid + '' : '';
    console.log("logs============================", StypeId, CtypeId, Type, MappingId)
    let getLoginData = (done) => {
        let data = new FormData();
        data.append('username', 'Whatsapp');
        data.append('password', 'KHYFDHGHFGFDFGGFDGG');
        data.append('client', 'Whatsapp');
        let config = {
            method: 'post',
            url: 'https://uatlims.lupindiagnostics.com/HomeCollectionAPI/api/LoginAPI',
            headers: {
                ...data.getHeaders()
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                let authtoken = response.data.responseBody.attributes[0].attrvalue;
                done(null, authtoken);
            })
            .catch(function (error) {
                done(error);
            });
    }

    let getAllCityApi = (authtoken, done) => {
        // let query = 'SELECT stateid ,cityid From  tbl_city WHERE typeid= ? AND stateid = ?'
        let query = 'SELECT a.stateid, a.cityid FROM tbl_city AS a, tbl_state AS b' +
            ' WHERE a.stateid = b.`stateid` AND a.`typeid` = ? AND b.`typeid` = ?';
        let value = [CtypeId, StypeId]
        let s = dbpool.query(query, value, (err, result) => {
            if (err) {
                done(err);
            }
            if (result != undefined && result.length > 0) {
                var obj = {
                    StateId: result[0].stateid,
                    CityId: result[0].cityid
                }
                console.log(obj.StateId, obj.CityId)
                done(null, obj, authtoken);
            } else {
                done(1)
            }

        })
        console.log(s.sql);
    }

    getItemListApi = (obj, authtoken, done) => {
        let query = 'SELECT mappingname FROM `tbl_lupin` WHERE type = ? AND typeid = ?';
        let values = [Type, MappingId];
        let s = dbpool.query(query, values, (err, result) => {
            if (err) {
                done(err);
            } else {
                if (result.length > 0) {
                    let MappingName = result[0].mappingname;
                    var data = new FormData();
                    console.log(obj.StateId, obj.CityId, Type, MappingName)
                    data.append('StateID', obj.StateId);
                    data.append('CityID', obj.CityId);
                    data.append('Type', Type);
                    data.append('SearchKeyword', MappingName);
                    var config = {
                        method: 'post',
                        url: 'https://uatlims.lupindiagnostics.com/HomeCollectionAPI/api/WhatsApp/GetItemList_whatsapp',
                        headers: {
                            'Authorization': 'Bearer ' + authtoken,
                            ...data.getHeaders()
                        },
                        data: data
                    };

                    axios(config)
                        .then(function (response) {
                            // let tempMappingName = null;
                            tempMappingName = MappingName.toLowerCase().replace(/ /g, '').replace(/,/g, '-')
                            let res = response.data.responseBody;
                            console.log(res)
                            let typeSmsContent = '';
                            if (res.length > 0) {
                                typeSmsContent += '*Below are the tests available for ' + MappingName + '* \n\n';

                                for (let k = 0; k < res.length; k++) {
                                    // typeSmsContent += '*' + (k + 1) + '*' + '. ' + res[k].itemname + ' *Rs.' + parseInt(res[k].Rate) + '*\n\n';
                                    typeSmsContent += res[k].itemname + ' *Rs.' + parseInt(res[k].Rate) + '*\n\n';
                                }
                                typeSmsContent += '*To book a test, kindly visit* https://www.lupindiagnostics.com/page/test-list/' + tempMappingName + '\n';
                            }
                            else {
                                typeSmsContent += 'There are no tests available for *' + MappingName + '* as of now \n\n';
                                typeSmsContent += 'To search a test, kindly visit https://www.lupindiagnostics.com/page/test-list/' + tempMappingName + '\n';
                            }

                            done(null, typeSmsContent);

                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                } else {
                    res.send({
                        code: 100,
                        status: 'FAILED',
                        data: "Something went wrong"
                    });
                }

            }
        });
        console.log(s.sql);

    }
    async.waterfall([getLoginData, getAllCityApi, getItemListApi], (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: 'FAILED',
                data: "Something went wrong"
            });
        } else {
            let response = {
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: result
            };
            res.status(200).json(response);
        }
    })

})
module.exports = router;



