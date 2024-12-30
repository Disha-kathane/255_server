const express = require('express');
const router = express.Router();
const axios = require('axios');
const dbpool = require('../db/connection');
var http = require('http');
var https = require('https');
var httpUrl = require('url');
const { readSync } = require('fs');



router.post('/statelist/:mobileno', async (req, res) => {
    try {
        let mobileNo = req.params.mobileno;
        // console.log({ mobileNo });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }

        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://pams.punjab.gov.in/prod/api/EAMS/StateList',
            headers: {}

        };

        let result = await axios(config1);
        let arrobj = result.data.data;
        // console.log("result.data.count: ", result.data.count)
        // console.log("arrobj.length================>", arrobj)
        let stateArr = [];
        // console.log(m/ap)
        // let count = 1
        let temp = "Please select from the below state👇 \n\n";

        for (let i = 0; i < arrobj.length; i++) {
            // console.log("i---------->", i, arrobj[i].stateName, "-----DISTRICT------------", arrobj[i].stateId)

            temp += `Reply ${i + 1} 👉 for  ${arrobj[i].stateName} \n`;

            stateArr.push(arrobj[i].stateName)
        }
        // console.log("stateArr------------------------------------------------------------------------", stateArr)
        const uniqueStates = [...new Set(stateArr)];

        if (result.data != 0) {
            console.log("succass op ---------- > ", temp)
            return res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: temp
            });
        } else {
            return res.send({
                code: '100',
                status: 'Failed',
                type: 'text',
                data: "No address list found here"
            });
        }

    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: "Data not found"
        });
    }



});


router.post('/getDistname/:mobileno/:type', async (req, res) => {
    try {

        // return res.send("hsdghucdg")
        let mobileNo = req.params.mobileno;
        let type = req.params.type
        // console.log({ mobileNo, type });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }

        // var data1 = '';
        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: 'https://ppdms.punjab.gov.in/demoapi/api/EAMS/StateList',
            url: 'https://pams.punjab.gov.in/prod/api/EAMS/StateList',
            headers: {}

        };
        let result = await axios(config1);
        let arrobj = result.data.data;
        let arrobj11 = [];
        for (let i = 0; i < arrobj.length; i++) {
            let obj = {}
            if (arrobj.length != undefined && arrobj.length > 0) {
                arrobj11.push({ stateName: arrobj[i].stateName, stateId: arrobj[i].stateId, type: i + 1 })
            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    type: 'text',
                    data: "Select correct option"
                });
            }
        };

        // console.log("arrobj11----------------------->", arrobj11)
        let record;
        for (let i = 0; i < arrobj11.length; i++) {
            // console.log(i)
            if (type == arrobj11[i].type) {
                record = arrobj11[i].stateId
                // console.log(arrobj11[i])
                break;
            }
        };

        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/DistrictList?stateMasterId=${record}`,
            url: `https://pams.punjab.gov.in/prod/api/EAMS/DistrictList?stateMasterId=${record}`,

            headers: {}

        };
        let result1 = await axios(config1);
        let arrobj1 = result1.data.data;

        let temp = "Please select from the below district👇 \n\n";

        // console.log("arrobj1-------------------->", arrobj1);
        if (arrobj1.length > 0) {

            for (let i = 0; i < arrobj1.length; i++) {
                temp += `Reply ${i + 1} 👉 for  ${arrobj1[i].districtName} \n`;

            }
            // console.log("tmp ------------------>", temp)


            if (result.data != 0) {
                console.log("success output => ", temp)
                return res.send({
                    code: '200',
                    status: 'SUCCESS',
                    type: 'text',
                    data: temp
                });
            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    type: 'text',
                    data: "No address list found here"
                });
            }
        } else {
            return res.send({
                code: '100',
                status: 'Failed',
                data: "No data found"
            });
        }


    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: "Data not found"
        });
    }


});


router.post('/assemblyName/:mobileno/:stateid/:districtid', async (req, res) => {
    try {

        // return res.send("hsdghucdg")
        let mobileNo = req.params.mobileno;
        let type = req.params.stateid;
        let districtid = req.params.districtid
        // console.log({ mobileNo, districtid });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }

        // var data1 = '';
        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: 'https://ppdms.punjab.gov.in/demoapi/api/EAMS/StateList',
            url: 'https://pams.punjab.gov.in/prod/api/EAMS/StateList',

            headers: {}

        };
        let result = await axios(config1);
        let arrobj = result.data.data;
        let arrobj11 = [];
        for (let i = 0; i < arrobj.length; i++) {
            let obj = {}
            if (arrobj.length != undefined && arrobj.length > 0) {
                arrobj11.push({ stateName: arrobj[i].stateName, stateId: arrobj[i].stateId, type: i + 1 })
            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    type: 'text',
                    data: "Select correct option"
                });
            }
        };
        // 
        // console.log("arrobj11----------------------->", arrobj11)
        let record;
        for (let i = 0; i < arrobj11.length; i++) {
            // console.log(i)
            if (type == arrobj11[i].type) {
                record = arrobj11[i].stateId
                // console.log(arrobj11[i])
                break;
            }
        };

        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/DistrictList?stateMasterId=${record}`,
            url: `https://pams.punjab.gov.in/prod/api/EAMS/DistrictList?stateMasterId=${record}`,

            headers: {}

        };
        let result1 = await axios(config1);
        let arrobj1 = result1.data.data;

        // console.log("arrobj1 -----------------------------> ", arrobj1, districtid)
        let districtArr = []
        let resultArr = []
        let arrnew = []
        for (let i = 0; i < arrobj1.length; i++) {

            arrnew.push({ districtMasterId: arrobj1[i].districtMasterId, number: i + 1 })
        }
        // console.log("arrnew -------------------------------------------->", arrnew)
        for (let i = 0; i < arrnew.length; i++) {
            if (districtid == arrnew[i].number) {
                let config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,
                    url: `https://pams.punjab.gov.in/prod/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,

                    headers: {}
                };

                // console.log("config------------------------------->", config)

                let result = await axios(config);
                resultArr = result.data.data;
            }
        }
        // console.log("resultArr------------------------------- ", resultArr)

        if (resultArr.length > 0) {
            let temp = "Please select the below assembly name👇 \n\n";

            // console.log("arrobj1-------------------->", arrobj1);

            for (let i = 0; i < resultArr.length; i++) {
                temp += `Reply ${i + 1} 👉 for  ${resultArr[i].assemblyName} \n`;

            }


            if (result.data != 0) {
                console.log("success result ---> ", temp)
                return res.send({
                    code: '200',
                    status: 'SUCCESS',
                    type: 'text',
                    data: temp
                });
            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    type: 'text',
                    data: "No address list found here"
                });
            }

        } else {
            return res.send({
                code: '100',
                status: 'Failed',
                data: "Data Not Found"
            });
        }

    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: "Data not found"
        });
    }


});


router.post('/boothname/:mobileno/:stateid/:districtid/:assemblyMasterId', async (req, res) => {
    try {

        // return res.send("hsdghucdg")
        let mobileNo = req.params.mobileno;
        let assemblyMasterId = req.params.assemblyMasterId;
        let type = req.params.stateid;
        let districtid = req.params.districtid
        // console.log({ mobileNo, districtid, assemblyMasterId });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }

        // var data1 = '';
        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: 'https://ppdms.punjab.gov.in/demoapi/api/EAMS/StateList',
            url: 'https://pams.punjab.gov.in/prod/api/EAMS/StateList',

            headers: {}

        };
        let result = await axios(config1);
        let arrobj = result.data.data;
        let arrobj11 = [];
        for (let i = 0; i < arrobj.length; i++) {
            let obj = {}
            if (arrobj.length != undefined && arrobj.length > 0) {
                arrobj11.push({ stateName: arrobj[i].stateName, stateId: arrobj[i].stateId, type: i + 1 })
            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    type: 'text',
                    data: "Select correct option"
                });
            }
        };
        let record;
        for (let i = 0; i < arrobj11.length; i++) {
            // console.log(i)
            if (type == arrobj11[i].type) {
                record = arrobj11[i].stateId
                // console.log(arrobj11[i])
                break;
            }
        };

        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/DistrictList?stateMasterId=${record}`,
            url: `https://pams.punjab.gov.in/prod/api/EAMS/DistrictList?stateMasterId=${record}`,

            headers: {}

        };
        let result1 = await axios(config1);
        let arrobj1 = result1.data.data;

        // console.log("arrobj1 -----------------------------> ", arrobj1, districtid)
        let districtArr = []
        let resultArr = []
        let arrnew = []
        for (let i = 0; i < arrobj1.length; i++) {

            arrnew.push({ districtMasterId: arrobj1[i].districtMasterId, number: i + 1 })
        }

        let distidMaster = null;
        // console.log("arrnew -------------------------------------------->", arrnew)
        for (let i = 0; i < arrnew.length; i++) {
            if (districtid == arrnew[i].number) {

                distidMaster = arrnew[i].districtMasterId;
                let config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,
                    url: `https://pams.punjab.gov.in/prod/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,

                    headers: {}
                };

                // console.log("config------------------------------->", config)

                let result = await axios(config);
                resultArr = result.data.data;
                break;
            }
        }
        // console.log("resultArr------------------------------- ", resultArr)

        if (resultArr.length > 0) {
            let assemblyIdArr = [];
            for (let i = 0; i < resultArr.length; i++) {
                assemblyIdArr.push({ assemblyId: resultArr[i].assemblyId, assemblyMasterId: i + 1 })
            }

            // console.log("indsijjdfhefhvbhnc===========================+++++++++++++++++++++++++++", assemblyIdArr)
            let resultdata
            let resultee;
            for (let j = 0; j < assemblyIdArr.length; j++) {
                console.log(assemblyMasterId, " == ", assemblyIdArr[j].assemblyMasterId, "cfvgbhnjcdvsxbnmdfnbgvcdhnxj");
                if (assemblyMasterId == assemblyIdArr[j].assemblyMasterId) {

                    if (assemblyMasterId == assemblyIdArr[j].assemblyMasterId) {
                        let config = {
                            method: 'get',
                            maxBodyLength: Infinity,
                            // url: `https://ppdms.punjab.gov.in/api/EAMS/GetBoothListById?&stateMasterId=${record}&assemblyMasterId=${assemblyIdArr[j].assemblyId}&districtMasterId=${distidMaster}`,
                            url: `https://pams.punjab.gov.in/prod/api/EAMS/GetBoothListById?&stateMasterId=${record}&assemblyMasterId=${assemblyIdArr[j].assemblyId}&districtMasterId=${distidMaster}`,

                            headers: {}
                        };

                        // console.log("config------------------------------->", config)

                        let result = await axios(config);
                        resultee = result
                        resultdata = result.data.data;

                        break;
                    }
                }
            }

            // console.log("resulresultdata1 ------------>", resultdata)
            if (resultdata.length > 0) {
                // console.log("if", { resultdata })


                let temp = "Please select the below boothname 👇 \n\n";

                // console.log("arrobj1-------------------->", arrobj1);

                for (let i = 0; i < resultdata.length; i++) {
                    temp += `Reply ${i + 1} 👉 for boothCode_No: ${resultdata[i].boothCode_No} - boothName: ${resultdata[i].boothName} \n`;

                }


                if (resultdata.length > 0) {
                    return res.send({
                        code: '200',
                        status: 'SUCCESS',
                        type: 'text',
                        data: temp
                    });
                } else {
                    return res.send({
                        code: '100',
                        status: 'Failed',
                        type: 'text',
                        data: "No address list found here"
                    });
                }


            } else {

                if (resultdata.status == 400) {
                    return res.send({
                        code: '100',
                        status: 'Failed',
                        type: 'text',
                        data: "No Data found "
                    });
                }
                // console.log("else", { resultdata })
                return res.send({
                    code: '100',
                    status: 'Failed',
                    data: "Data Not Found"
                });
            }

        } else {
            return res.send({
                code: '100',
                status: 'Failed',
                data: "Data Not Found"
            });
        }

    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: "Data not found"
        });
    }


});


router.post('/boothcount/:mobileno/:stateid/:districtid/:assemblyMasterId/:boothcode', async (req, res) => {

    try {

        // return res.send("hsdghucdg")
        let mobileNo = req.params.mobileno;
        let assemblyMasterId = req.params.assemblyMasterId;
        let type = req.params.stateid;
        let districtid = req.params.districtid
        let boothcode = req.params.boothcode

        // console.log({ mobileNo, districtid, assemblyMasterId });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }

        // var data1 = '';
        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: 'https://ppdms.punjab.gov.in/demoapi/api/EAMS/StateList',
            url: 'https://pams.punjab.gov.in/prod/api/EAMS/StateList',

            headers: {}

        };
        let result = await axios(config1);
        let arrobj = result.data.data;
        let arrobj11 = [];
        for (let i = 0; i < arrobj.length; i++) {
            let obj = {}
            if (arrobj.length != undefined && arrobj.length > 0) {
                arrobj11.push({ stateName: arrobj[i].stateName, stateId: arrobj[i].stateId, type: i + 1 })
            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    type: 'text',
                    data: "Select correct option"
                });
            }
        };
        let record;
        for (let i = 0; i < arrobj11.length; i++) {
            // console.log(i)
            if (type == arrobj11[i].type) {
                record = arrobj11[i].stateId
                // console.log(arrobj11[i])
                break;
            }
        };

        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/DistrictList?stateMasterId=${record}`,
            url: `https://pams.punjab.gov.in/prod/api/EAMS/DistrictList?stateMasterId=${record}`,

            headers: {}

        };
        let result1 = await axios(config1);
        let arrobj1 = result1.data.data;

        // console.log("arrobj1 -----------------------------> ", arrobj1, districtid)
        let districtArr = []
        let resultArr = []
        let arrnew = []
        for (let i = 0; i < arrobj1.length; i++) {

            arrnew.push({ districtMasterId: arrobj1[i].districtMasterId, number: i + 1 })
        }

        let distidMaster = null;
        // console.log("arrnew -------------------------------------------->", arrnew)
        for (let i = 0; i < arrnew.length; i++) {
            if (districtid == arrnew[i].number) {

                distidMaster = arrnew[i].districtMasterId;
                let config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,
                    url: `https://pams.punjab.gov.in/prod/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,

                    headers: {}
                };

                // console.log("config------------------------------->", config)

                let result = await axios(config);
                resultArr = result.data.data;
                break;
            }
        }
        // console.log("resultArr------------------------------- ", resultArr)

        if (resultArr.length > 0) {
            let assemblyId1 = null
            let assemblyIdArr = [];
            for (let i = 0; i < resultArr.length; i++) {
                assemblyIdArr.push({ assemblyId: resultArr[i].assemblyId, assemblyMasterId: i + 1 })
            }

            // console.log("indsijjdfhefhvbhnc===========================+++++++++++++++++++++++++++", assemblyIdArr)
            let resultdata
            let resultee;
            for (let j = 0; j < assemblyIdArr.length; j++) {
                // console.log(assemblyMasterId, " == ", assemblyIdArr[j].assemblyMasterId, "cfvgbhnjcdvsxbnmdfnbgvcdhnxj");
                if (assemblyMasterId == assemblyIdArr[j].assemblyMasterId) {

                    if (assemblyMasterId == assemblyIdArr[j].assemblyMasterId) {
                        assemblyId1 = assemblyIdArr[j].assemblyId
                        let config = {
                            method: 'get',
                            maxBodyLength: Infinity,
                            // url: `https://ppdms.punjab.gov.in/api/EAMS/GetBoothListById?&stateMasterId=${record}&assemblyMasterId=${assemblyIdArr[j].assemblyId}&districtMasterId=${distidMaster}`,
                            url: `https://pams.punjab.gov.in/prod/api/EAMS/GetBoothListById?&stateMasterId=${record}&assemblyMasterId=${assemblyIdArr[j].assemblyId}&districtMasterId=${distidMaster}`,

                            headers: {}
                        };

                        // console.log("config------------------------------->", config)

                        let result = await axios(config);
                        resultee = result
                        resultdata = result.data.data;

                        break;
                    }
                }
            }
            let boothnameArr = []
            // console.log("resulresultdata1 ------------>", resultdata)
            if (resultdata.length > 0) {
                // console.log("if", { resultdata })
                for (let k = 0; k < resultdata.length; k++) {
                    boothnameArr.push({ boothMasterId: resultdata[k].boothMasterId, boothName: resultdata[k].boothName, boothCode_No: resultdata[k].boothCode_No, index: k + 1 })
                };

            } else {

                if (resultdata.status == 400) {
                    return res.send({
                        code: '100',
                        status: 'Failed',
                        type: 'text',
                        data: "No Data found "
                    });
                }
                // console.log("else", { resultdata })
                return res.send({
                    code: '100',
                    status: 'Failed',
                    data: "Data Not Found"
                });
            }

            // console.log("boothnameArr-------/------------>", boothnameArr);
            let boothresult = null;
            let shoowBoothname = null;
            let showboothCode_No = null
            for (let i = 0; i < boothnameArr.length; i++) {
                if (boothcode == boothnameArr[i].index) {
                    // console.log("inside the index +++++++++++++++++++++", boothnameArr[i]);
                    shoowBoothname = boothnameArr[i].boothName
                    showboothCode_No = boothnameArr[i].boothCode_No
                    let config = {
                        method: 'get',
                        maxBodyLength: Infinity,
                        // url: `https://ppdms.punjab.gov.in/api/EAMS/GetQISList?&stateMasterId=${record}&assemblyMasterId=${assemblyId1}&districtMasterId=${distidMaster}&boothMasterId=${boothnameArr[i].boothMasterId}`,
                        url: `https://pams.punjab.gov.in/prod/api/EAMS/GetQISList?&stateMasterId=${record}&assemblyMasterId=${assemblyId1}&districtMasterId=${distidMaster}&boothMasterId=${boothnameArr[i].boothMasterId}`,

                        headers: {}
                    };

                    // console.log("config------------------------------->", config)

                    let result = await axios(config);
                    // resultee = result
                    boothresult = result.data

                    break;
                }
            }
            // console.log("boothresult-----------------------------------         =============++++++++++++++++++++ => ", { shoowBoothname, showboothCode_No })

            // console.log("boothresult         =============++++++++++++++++++++ => ", typeof (boothresult), boothresult)

            if (boothresult instanceof Object) {
                let temp = "The number of Voters in the queue at "

                temp = temp + `*${shoowBoothname}*` + " at " + `*${boothresult.queueEnterTime}*` + " is " + `*${boothresult.queueCount}*`

                return res.send({
                    code: '200',
                    status: 'SUCCESS',
                    type: 'text',
                    data: temp
                });
            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    data: "Data Not Found"
                });
            }

        } else {
            return res.send({
                code: '100',
                status: 'Failed',
                data: "Data Not Found"
            });
        }

    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: "Data Not Found"
        });
    }
});


router.post('/boothcountEnter/:mobileno/:stateid/:districtid/:assemblyMasterId/:boothcode', async (req, res) => {

    try {

        // return res.send("hsdghucdg")
        let mobileNo = req.params.mobileno;
        let assemblyMasterId = req.params.assemblyMasterId;
        let type = req.params.stateid;
        let districtid = req.params.districtid
        let boothcode = req.params.boothcode;
        // let boothqueue = req.params.boothqueue;
        // console.log({ mobileNo, districtid, assemblyMasterId });

        if (boothcode.length > 3) {
            return res.send({
                code: '100',
                status: 'Failed',
                type: 'text',
                data: "booth code should be numbered from 1 to 999."
            });
        }
        // else if (boothcode.length < 3) {
        //     return res.send({
        //         code: '100',
        //         status: 'Success',
        //         type: 'text',
        //         data: "booth code should be numbered from 1 to 999."
        //     });
        // }
        else {

            if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
                mobileNo = mobileNo.substring('2');
            }

            // var data1 = '';
            var config1 = {
                method: 'get',
                maxBodyLength: Infinity,
                // url: 'https://ppdms.punjab.gov.in/demoapi/api/EAMS/StateList',
                url: 'https://pams.punjab.gov.in/prod/api/EAMS/StateList',

                headers: {}

            };
            let result = await axios(config1);
            let arrobj = result.data.data;
            let arrobj11 = [];
            for (let i = 0; i < arrobj.length; i++) {
                let obj = {}
                if (arrobj.length != undefined && arrobj.length > 0) {
                    arrobj11.push({ stateName: arrobj[i].stateName, stateId: arrobj[i].stateId, type: i + 1 })
                } else {
                    return res.send({
                        code: '100',
                        status: 'Failed',
                        type: 'text',
                        data: "Select correct option"
                    });
                }
            };
            let record;
            for (let i = 0; i < arrobj11.length; i++) {
                // console.log(i)
                if (type == arrobj11[i].type) {
                    record = arrobj11[i].stateId
                    // console.log(arrobj11[i])
                    break;
                }
            };

            var config1 = {
                method: 'get',
                maxBodyLength: Infinity,
                // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/DistrictList?stateMasterId=${record}`,
                url: `https://pams.punjab.gov.in/prod/api/EAMS/DistrictList?stateMasterId=${record}`,

                headers: {}

            };
            let result1 = await axios(config1);
            let arrobj1 = result1.data.data;

            // console.log("arrobj1 -----------------------------> ", arrobj1, districtid)
            let districtArr = []
            let resultArr = []
            let arrnew = []
            for (let i = 0; i < arrobj1.length; i++) {

                arrnew.push({ districtMasterId: arrobj1[i].districtMasterId, number: i + 1 })
            }

            let distidMaster = null;
            // console.log("arrnew -------------------------------------------->", arrnew)
            for (let i = 0; i < arrnew.length; i++) {
                if (districtid == arrnew[i].number) {

                    distidMaster = arrnew[i].districtMasterId;
                    let config = {
                        method: 'get',
                        maxBodyLength: Infinity,
                        // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,
                        url: `https://pams.punjab.gov.in/prod/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,

                        headers: {}
                    };

                    // console.log("config------------------------------->", config)

                    let result = await axios(config);
                    resultArr = result.data.data;
                    break;
                }
            }
            // console.log("resultArr------------------------------- ", resultArr)

            if (resultArr.length > 0) {
                let assemblyId1 = null
                let assemblyIdArr = [];
                for (let i = 0; i < resultArr.length; i++) {
                    assemblyIdArr.push({ assemblyId: resultArr[i].assemblyId, assemblyMasterId: i + 1 })
                }

                // console.log("indsijjdfhefhvbhnc===========================+++++++++++++++++++++++++++", assemblyIdArr)
                let resultdata
                let resultee;
                for (let j = 0; j < assemblyIdArr.length; j++) {
                    // console.log(assemblyMasterId, " == ", assemblyIdArr[j].assemblyMasterId, "cfvgbhnjcdvsxbnmdfnbgvcdhnxj");
                    if (assemblyMasterId == assemblyIdArr[j].assemblyMasterId) {

                        if (assemblyMasterId == assemblyIdArr[j].assemblyMasterId) {
                            assemblyId1 = assemblyIdArr[j].assemblyId
                            let config = {
                                method: 'get',
                                maxBodyLength: Infinity,
                                // url: `https://ppdms.punjab.gov.in/api/EAMS/GetBoothListById?&stateMasterId=${record}&assemblyMasterId=${assemblyIdArr[j].assemblyId}&districtMasterId=${distidMaster}`,
                                url: `https://pams.punjab.gov.in/prod/api/EAMS/GetBoothListById?&stateMasterId=${record}&assemblyMasterId=${assemblyIdArr[j].assemblyId}&districtMasterId=${distidMaster}`,

                                headers: {}
                            };

                            // console.log("config------------------------------->", config)

                            let result = await axios(config);
                            resultee = result
                            resultdata = result.data.data;

                            break;
                        }
                    }
                }
                let boothnameArr = []
                // console.log("resulresultdata1 ------------>", resultdata)
                if (resultdata.length > 0) {
                    // console.log("if", { resultdata })
                    for (let k = 0; k < resultdata.length; k++) {
                        boothnameArr.push({ boothMasterId: resultdata[k].boothMasterId, boothName: resultdata[k].boothName, boothCode_No: resultdata[k].boothCode_No, index: k + 1 })
                    };
                } else {

                    if (resultdata.status == 400) {
                        return res.send({
                            code: '100',
                            status: 'Failed',
                            type: 'text',
                            data: "No Data found "
                        });
                    }
                    // console.log("else", { resultdata })
                    return res.send({
                        code: '100',
                        status: 'Failed',
                        data: "Data Not Found"
                    });
                }

                // console.log("boothnameArr------------------->", boothnameArr);
                let boothresult = null;
                let shoowBoothname = null;
                let showboothCode_No = null
                for (let i = 0; i < boothnameArr.length; i++) {
                    if (boothcode == boothnameArr[i].boothCode_No) {

                        // console.log("inside the index +++++++++++++++++++++", boothnameArr[i]);
                        shoowBoothname = boothnameArr[i].boothName
                        showboothCode_No = boothnameArr[i].boothCode_No
                        let config = {
                            method: 'get',
                            maxBodyLength: Infinity,
                            // url: `https://ppdms.punjab.gov.in/api/EAMS/GetQISList?&stateMasterId=${record}&assemblyMasterId=${assemblyId1}&districtMasterId=${distidMaster}&boothMasterId=${boothnameArr[i].boothMasterId}`,
                            url: `https://pams.punjab.gov.in/prod/api/EAMS/GetQISList?&stateMasterId=${record}&assemblyMasterId=${assemblyId1}&districtMasterId=${distidMaster}&boothMasterId=${boothnameArr[i].boothMasterId}`,
                            headers: {}
                        };

                        // console.log("config------------------------------->", config)

                        let result = await axios(config);
                        // resultee = result
                        boothresult = result.data

                        break;
                    }
                }
                console.log("boothresult-----------------------------------         =============++++++++++++++++++++ => ", { shoowBoothname, showboothCode_No })

                console.log("boothresult         =============++++++++++++++++++++ => ", typeof (boothresult), boothresult)

                if (boothresult instanceof Object) {

                    // let boothqueue = req.params.boothqueue;
                    // if (boothqueue == boothresult.queueCount) {
                    console.log("inside the booth count")
                    let temp = "The number of Voters in the queue at "

                    temp = temp + `*${shoowBoothname}*` + " at " + `*${boothresult.queueEnterTime}*` + " is " + `*${boothresult.queueCount}*`

                    return res.send({
                        code: '200',
                        status: 'SUCCESS',
                        type: 'text',
                        data: temp
                    });
                    // } else {
                    //     return res.send({
                    //         code: '100',
                    //         status: 'Failed',
                    //         data: "No Data Found"
                    //     });
                    // }

                } else {
                    return res.send({
                        code: '100',
                        status: 'Failed',
                        data: "Data Not Found"
                    });
                }

            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    data: "Data Not Found"
                });
            }
        }



    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: "Data Not found"
        });
    }
});



router.post('/statelist/punjabi/:mobileno', async (req, res) => {
    try {
        let mobileNo = req.params.mobileno;
        // console.log({ mobileNo });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }

        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://pams.punjab.gov.in/prod/api/EAMS/StateList',
            headers: {}

        };

        let result = await axios(config1);
        let arrobj = result.data.data;
        // console.log("result.data.count: ", result.data.count)
        // console.log("arrobj.length================>", arrobj)
        let stateArr = [];
        // console.log(m/ap)
        // let count = 1
        let temp = "Please select from the below state👇 \n\n";

        for (let i = 0; i < arrobj.length; i++) {
            // console.log("i---------->", i, arrobj[i].stateName, "-----DISTRICT------------", arrobj[i].stateId)
            if (arrobj[i].secondLanguage !== null) {

                temp += `ਦਰਜ ਕਰੋ ${i + 1} 👉 ਲਈ  ${arrobj[i].secondLanguage} \n`;

                stateArr.push(arrobj[i].secondLanguage)
            }
        }
        // console.log("stateArr------------------------------------------------------------------------", stateArr)
        const uniqueStates = [...new Set(stateArr)];

        if (result.data != 0) {
            console.log("succass op ---------- > ", temp)
            return res.send({
                code: '200',
                status: 'SUCCESS',
                type: 'text',
                data: temp
            });
        } else {
            return res.send({
                code: '100',
                status: 'Failed',
                type: 'text',
                data: "ਇੱਥੇ ਕੋਈ ਪਤਾ ਸੂਚੀ ਨਹੀਂ ਮਿਲੀ"
            });
        }

    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
        });
    }
});


router.post('/getDistname/punjabi/:mobileno/:type', async (req, res) => {
    try {

        // return res.send("hsdghucdg")
        let mobileNo = req.params.mobileno;
        let type = req.params.type
        // console.log({ mobileNo, type });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }

        // var data1 = '';
        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: 'https://ppdms.punjab.gov.in/demoapi/api/EAMS/StateList',
            url: 'https://pams.punjab.gov.in/prod/api/EAMS/StateList',
            headers: {}

        };
        let result = await axios(config1);
        let arrobj = result.data.data;
        let arrobj11 = [];
        for (let i = 0; i < arrobj.length; i++) {
            let obj = {}
            if (arrobj.length != undefined && arrobj.length > 0) {
                if (arrobj[i].secondLanguage !== null) {

                    arrobj11.push({ stateName: arrobj[i].secondLanguage, stateId: arrobj[i].stateId, type: i + 1 })
                }
            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    type: 'text',
                    data: "ਸਹੀ ਵਿਕਲਪ ਚੁਣੋ"
                });
            }
        };

        console.log("arrobj11----------------------->", arrobj11)
        let record;
        for (let i = 0; i < arrobj11.length; i++) {
            // console.log(i)
            if (type == arrobj11[i].type) {
                record = arrobj11[i].stateId
                // console.log(arrobj11[i])
                break;
            }
        };
        console.log({ record })
        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/DistrictList?stateMasterId=${record}`,
            url: `https://pams.punjab.gov.in/prod/api/EAMS/DistrictList?stateMasterId=${record}`,

            headers: {}

        };
        let result1 = await axios(config1);
        let arrobj1 = result1.data.data;

        let temp = "ਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਦਿੱਤੇ ਜ਼ਿਲ੍ਹਿਆਂ ਵਿੱਚੋਂ ਚੁਣੋ 👇 \n\n";

        // console.log("arrobj1-------------------->", arrobj1);
        if (arrobj1.length > 0) {

            for (let i = 0; i < arrobj1.length; i++) {
                if (arrobj1[i].secondLanguage !== null) {

                    temp += `${arrobj1[i].secondLanguage}  ਲਈ ${i + 1} ਦਰਜ ਕਰੋ\n`;
                }

            }
            // console.log("tmp ------------------>", temp)


            if (result.data != 0) {
                console.log("success output => ", temp)
                return res.send({
                    code: '200',
                    status: 'SUCCESS',
                    type: 'text',
                    data: temp
                });
            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    type: 'text',
                    data: "ਇੱਥੇ ਕੋਈ ਪਤਾ ਸੂਚੀ ਨਹੀਂ ਮਿਲੀ"
                });
            }
        } else {
            return res.send({
                code: '100',
                status: 'Failed',
                data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
            });
        }


    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
        });
    }
});


router.post('/assemblyName/punjabi/:mobileno/:stateid/:districtid', async (req, res) => {
    try {

        // return res.send("hsdghucdg")
        let mobileNo = req.params.mobileno;
        let type = req.params.stateid;
        let districtid = req.params.districtid
        // console.log({ mobileNo, districtid });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }

        // var data1 = '';
        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: 'https://ppdms.punjab.gov.in/demoapi/api/EAMS/StateList',
            url: 'https://pams.punjab.gov.in/prod/api/EAMS/StateList',

            headers: {}

        };
        let result = await axios(config1);
        let arrobj = result.data.data;
        let arrobj11 = [];
        for (let i = 0; i < arrobj.length; i++) {
            let obj = {}

            // console.log("arrobj -----------------> ", arrobj)
            if (arrobj.length != undefined && arrobj.length > 0) {

                if (arrobj[i].secondLanguage !== null) {

                    arrobj11.push({ stateName: arrobj[i].secondLanguage, stateId: arrobj[i].stateId, type: i + 1 })
                }
                // arrobj11.push({ stateName: arrobj[i].stateName, stateId: arrobj[i].stateId, type: i + 1 })
            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    type: 'text',
                    data: "ਸਹੀ ਵਿਕਲਪ ਚੁਣੋ"
                });
            }
        };
        // 
        // console.log("arrobj11----------------------->", arrobj11)
        let record;
        for (let i = 0; i < arrobj11.length; i++) {
            // console.log(i)
            if (type == arrobj11[i].type) {
                record = arrobj11[i].stateId
                // console.log(arrobj11[i])
                break;
            }
        };

        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/DistrictList?stateMasterId=${record}`,
            url: `https://pams.punjab.gov.in/prod/api/EAMS/DistrictList?stateMasterId=${record}`,

            headers: {}

        };
        let result1 = await axios(config1);
        let arrobj1 = result1.data.data;

        // console.log("arrobj1 -----------------------------> ", arrobj1, districtid)
        let districtArr = []
        let resultArr = []
        let arrnew = []
        for (let i = 0; i < arrobj1.length; i++) {

            arrnew.push({ districtMasterId: arrobj1[i].districtMasterId, number: i + 1 })
        }
        // console.log("arrnew -------------------------------------------->", arrnew)
        for (let i = 0; i < arrnew.length; i++) {
            if (districtid == arrnew[i].number) {
                let config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,
                    url: `https://pams.punjab.gov.in/prod/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,

                    headers: {}
                };

                // console.log("config------------------------------->", config)

                let result = await axios(config);
                resultArr = result.data.data;
            }
        }
        // console.log("resultArr------------------------------- ", resultArr)

        if (resultArr.length > 0) {
            let temp = "ਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਦਿੱਤੇ ਅਸੈਂਬਲੀ ਦਾ ਨਾਮ ਚੁਣੋ 👇 \n\n";

            // console.log("arrobj1-------------------->", arrobj1);

            for (let i = 0; i < resultArr.length; i++) {
                if (resultArr[i].secondLanguage !== null) {

                    temp += `${resultArr[i].secondLanguage} ਲਈ ${i + 1}  ਦਰਜ ਕਰੋ \n`;
                }

            }


            if (result.data != 0) {
                console.log("success result ---> ", temp)
                return res.send({
                    code: '200',
                    status: 'SUCCESS',
                    type: 'text',
                    data: temp
                });
            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    type: 'text',
                    data: "ਇੱਥੇ ਕੋਈ ਪਤਾ ਸੂਚੀ ਨਹੀਂ ਮਿਲੀ"
                });
            }

        } else {
            return res.send({
                code: '100',
                status: 'Failed',
                data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
            });
        }

    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
        });
    }
});


router.post('/boothname/punjabi/:mobileno/:stateid/:districtid/:assemblyMasterId', async (req, res) => {
    try {

        // return res.send("hsdghucdg")
        let mobileNo = req.params.mobileno;
        let assemblyMasterId = req.params.assemblyMasterId;
        let type = req.params.stateid;
        let districtid = req.params.districtid
        // console.log({ mobileNo, districtid, assemblyMasterId });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }

        // var data1 = '';
        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: 'https://ppdms.punjab.gov.in/demoapi/api/EAMS/StateList',
            url: 'https://pams.punjab.gov.in/prod/api/EAMS/StateList',

            headers: {}

        };
        let result = await axios(config1);
        let arrobj = result.data.data;
        let arrobj11 = [];
        for (let i = 0; i < arrobj.length; i++) {
            let obj = {}
            if (arrobj.length != undefined && arrobj.length > 0) {
                if (arrobj[i].secondLanguage !== null) {

                    arrobj11.push({ stateName: arrobj[i].secondLanguage, stateId: arrobj[i].stateId, type: i + 1 })
                }
                // arrobj11.push({ stateName: arrobj[i].stateName, stateId: arrobj[i].stateId, type: i + 1 })
            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    type: 'text',
                    data: "ਸਹੀ ਵਿਕਲਪ ਚੁਣੋ"
                });
            }
        };
        let record;
        for (let i = 0; i < arrobj11.length; i++) {
            // console.log(i)
            if (type == arrobj11[i].type) {
                record = arrobj11[i].stateId
                // console.log(arrobj11[i])
                break;
            }
        };

        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/DistrictList?stateMasterId=${record}`,
            url: `https://pams.punjab.gov.in/prod/api/EAMS/DistrictList?stateMasterId=${record}`,

            headers: {}

        };
        let result1 = await axios(config1);
        let arrobj1 = result1.data.data;

        // console.log("arrobj1 -----------------------------> ", arrobj1, districtid)
        let districtArr = []
        let resultArr = []
        let arrnew = []
        for (let i = 0; i < arrobj1.length; i++) {

            arrnew.push({ districtMasterId: arrobj1[i].districtMasterId, number: i + 1 })
        }

        let distidMaster = null;
        // console.log("arrnew -------------------------------------------->", arrnew)
        for (let i = 0; i < arrnew.length; i++) {
            if (districtid == arrnew[i].number) {

                distidMaster = arrnew[i].districtMasterId;
                let config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,
                    url: `https://pams.punjab.gov.in/prod/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,

                    headers: {}
                };

                // console.log("config------------------------------->", config)

                let result = await axios(config);
                resultArr = result.data.data;
                break;
            }
        }
        // console.log("resultArr------------------------------- ", resultArr)

        if (resultArr.length > 0) {
            let assemblyIdArr = [];
            for (let i = 0; i < resultArr.length; i++) {
                assemblyIdArr.push({ assemblyId: resultArr[i].assemblyId, assemblyMasterId: i + 1 })
            }

            // console.log("indsijjdfhefhvbhnc===========================+++++++++++++++++++++++++++", assemblyIdArr)
            let resultdata
            let resultee;
            for (let j = 0; j < assemblyIdArr.length; j++) {
                console.log(assemblyMasterId, " == ", assemblyIdArr[j].assemblyMasterId, "cfvgbhnjcdvsxbnmdfnbgvcdhnxj");
                if (assemblyMasterId == assemblyIdArr[j].assemblyMasterId) {

                    if (assemblyMasterId == assemblyIdArr[j].assemblyMasterId) {
                        let config = {
                            method: 'get',
                            maxBodyLength: Infinity,
                            // url: `https://ppdms.punjab.gov.in/api/EAMS/GetBoothListById?&stateMasterId=${record}&assemblyMasterId=${assemblyIdArr[j].assemblyId}&districtMasterId=${distidMaster}`,
                            url: `https://pams.punjab.gov.in/prod/api/EAMS/GetBoothListById?&stateMasterId=${record}&assemblyMasterId=${assemblyIdArr[j].assemblyId}&districtMasterId=${distidMaster}`,

                            headers: {}
                        };

                        // console.log("config------------------------------->", config)

                        let result = await axios(config);
                        resultee = result
                        resultdata = result.data.data;

                        break;
                    }
                }
            }

            // console.log("resulresultdata1 ------------>", resultdata)
            if (resultdata.length > 0) {
                // console.log("if", { resultdata })


                let temp = "ਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਦਿੱਤੇ ਬੂਥਾਂ ਵਿੱਚੋਂ ਆਪਣੇ ਬੂਥ ਦਾ ਨਾਮ ਚੁਣੋ 👇 \n\n";



                // console.log("arrobj1-------------------->", arrobj1);

                for (let i = 0; i < resultdata.length; i++) {

                    if (resultdata[i].secondLanguage !== null) {
                        temp += `ਦਰਜ ਕਰੋ ${i + 1} 👉 for boothCode_No: ${resultdata[i].boothCode_No} - boothName: ${resultdata[i].secondLanguage} \n`;

                    }
                    // temp += `Reply ${i + 1} 👉 for boothCode_No: ${resultdata[i].boothCode_No} - boothName: ${resultdata[i].secondLanguage} \n`;
                }


                if (resultdata.length > 0) {
                    return res.send({
                        code: '200',
                        status: 'SUCCESS',
                        type: 'text',
                        data: temp
                    });
                } else {
                    return res.send({
                        code: '100',
                        status: 'Failed',
                        type: 'text',
                        data: "ਇੱਥੇ ਕੋਈ ਪਤਾ ਸੂਚੀ ਨਹੀਂ ਮਿਲੀ"
                    });
                }


            } else {

                if (resultdata.status == 400) {
                    return res.send({
                        code: '100',
                        status: 'Failed',
                        type: 'text',
                        data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
                    });
                }
                // console.log("else", { resultdata })
                return res.send({
                    code: '100',
                    status: 'Failed',
                    data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
                });
            }

        } else {
            return res.send({
                code: '100',
                status: 'Failed',
                data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
            });
        }

    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
        });
    }


});


router.post('/boothcount/punjabi/:mobileno/:stateid/:districtid/:assemblyMasterId/:boothcode', async (req, res) => {

    try {
        // return res.send("hsdghucdg")
        let mobileNo = req.params.mobileno;
        let assemblyMasterId = req.params.assemblyMasterId;
        let type = req.params.stateid;
        let districtid = req.params.districtid
        let boothcode = req.params.boothcode

        // console.log({ mobileNo, districtid, assemblyMasterId });

        if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
            mobileNo = mobileNo.substring('2');
        }

        // var data1 = '';
        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: 'https://ppdms.punjab.gov.in/demoapi/api/EAMS/StateList',
            url: 'https://pams.punjab.gov.in/prod/api/EAMS/StateList',

            headers: {}

        };
        let result = await axios(config1);
        let arrobj = result.data.data;
        let arrobj11 = [];
        for (let i = 0; i < arrobj.length; i++) {
            let obj = {}
            if (arrobj.length != undefined && arrobj.length > 0) {
                if (arrobj[i].secondLanguage !== null) {

                    arrobj11.push({ stateName: arrobj[i].secondLanguage, stateId: arrobj[i].stateId, type: i + 1 })
                }
                // arrobj11.push({ stateName: arrobj[i].stateName, stateId: arrobj[i].stateId, type: i + 1 })
            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    type: 'text',
                    data: "ਸਹੀ ਵਿਕਲਪ ਚੁਣੋ"
                });
            }
        };
        let record;
        for (let i = 0; i < arrobj11.length; i++) {
            // console.log(i)
            if (type == arrobj11[i].type) {
                record = arrobj11[i].stateId
                // console.log(arrobj11[i])
                break;
            }
        };

        var config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/DistrictList?stateMasterId=${record}`,
            url: `https://pams.punjab.gov.in/prod/api/EAMS/DistrictList?stateMasterId=${record}`,

            headers: {}

        };
        let result1 = await axios(config1);
        let arrobj1 = result1.data.data;

        // console.log("arrobj1 -----------------------------> ", arrobj1, districtid)
        let districtArr = []
        let resultArr = []
        let arrnew = []
        for (let i = 0; i < arrobj1.length; i++) {

            arrnew.push({ districtMasterId: arrobj1[i].districtMasterId, number: i + 1 })
        }

        let distidMaster = null;
        // console.log("arrnew -------------------------------------------->", arrnew)
        for (let i = 0; i < arrnew.length; i++) {
            if (districtid == arrnew[i].number) {

                distidMaster = arrnew[i].districtMasterId;
                let config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,
                    url: `https://pams.punjab.gov.in/prod/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,

                    headers: {}
                };

                // console.log("config------------------------------->", config)

                let result = await axios(config);
                resultArr = result.data.data;
                break;
            }
        }
        // console.log("resultArr------------------------------- ", resultArr)

        if (resultArr.length > 0) {
            let assemblyId1 = null
            let assemblyIdArr = [];
            for (let i = 0; i < resultArr.length; i++) {
                assemblyIdArr.push({ assemblyId: resultArr[i].assemblyId, assemblyMasterId: i + 1 })
            }

            // console.log("indsijjdfhefhvbhnc===========================+++++++++++++++++++++++++++", assemblyIdArr)
            let resultdata
            let resultee;
            for (let j = 0; j < assemblyIdArr.length; j++) {
                // console.log(assemblyMasterId, " == ", assemblyIdArr[j].assemblyMasterId, "cfvgbhnjcdvsxbnmdfnbgvcdhnxj");
                if (assemblyMasterId == assemblyIdArr[j].assemblyMasterId) {

                    if (assemblyMasterId == assemblyIdArr[j].assemblyMasterId) {
                        assemblyId1 = assemblyIdArr[j].assemblyId
                        let config = {
                            method: 'get',
                            maxBodyLength: Infinity,
                            // url: `https://ppdms.punjab.gov.in/api/EAMS/GetBoothListById?&stateMasterId=${record}&assemblyMasterId=${assemblyIdArr[j].assemblyId}&districtMasterId=${distidMaster}`,
                            url: `https://pams.punjab.gov.in/prod/api/EAMS/GetBoothListById?&stateMasterId=${record}&assemblyMasterId=${assemblyIdArr[j].assemblyId}&districtMasterId=${distidMaster}`,

                            headers: {}
                        };

                        // console.log("config------------------------------->", config)

                        let result = await axios(config);
                        resultee = result
                        resultdata = result.data.data;

                        break;
                    }
                }
            }
            let boothnameArr = []
            // console.log("resulresultdata1 ------------>", resultdata)
            if (resultdata.length > 0) {
                // console.log("if", { resultdata })
                for (let k = 0; k < resultdata.length; k++) {
                    boothnameArr.push({ boothMasterId: resultdata[k].boothMasterId, boothName: resultdata[k].secondLanguage, boothCode_No: resultdata[k].boothCode_No, index: k + 1 })
                };

            } else {

                if (resultdata.status == 400) {
                    return res.send({
                        code: '100',
                        status: 'Failed',
                        type: 'text',
                        data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
                    });
                }
                // console.log("else", { resultdata })
                return res.send({
                    code: '100',
                    status: 'Failed',
                    data: "ਸਹੀ ਵਿਕਲਪ ਚੁਣੋ"
                });
            }

            // console.log("boothnameArr-------/------------>", boothnameArr);
            let boothresult = null;
            let shoowBoothname = null;
            let showboothCode_No = null
            for (let i = 0; i < boothnameArr.length; i++) {
                if (boothcode == boothnameArr[i].index) {
                    // console.log("inside the index +++++++++++++++++++++", boothnameArr[i]);
                    shoowBoothname = boothnameArr[i].secondLanguage
                    showboothCode_No = boothnameArr[i].boothCode_No
                    let config = {
                        method: 'get',
                        maxBodyLength: Infinity,
                        // url: `https://ppdms.punjab.gov.in/api/EAMS/GetQISList?&stateMasterId=${record}&assemblyMasterId=${assemblyId1}&districtMasterId=${distidMaster}&boothMasterId=${boothnameArr[i].boothMasterId}`,
                        url: `https://pams.punjab.gov.in/prod/api/EAMS/GetQISList?&stateMasterId=${record}&assemblyMasterId=${assemblyId1}&districtMasterId=${distidMaster}&boothMasterId=${boothnameArr[i].boothMasterId}`,

                        headers: {}
                    };

                    // console.log("config------------------------------->", config)

                    let result = await axios(config);
                    // resultee = result
                    boothresult = result.data

                    break;
                }
            }
            // console.log("boothresult-----------------------------------         =============++++++++++++++++++++ => ", { shoowBoothname, showboothCode_No })

            // console.log("boothresult         =============++++++++++++++++++++ => ", typeof (boothresult), boothresult)

            if (boothresult instanceof Object) {
                // let temp = "'ਤੇ ਕਤਾਰ ਵਿੱਚ ਵੋਟਰਾਂ ਦੀ ਗਿਣਤੀ "  ////{Boothname} 'ਤੇ { Time } ਵਜੇ ਕਤਾਰ ਵਿੱਚ ਵੋਟਰਾਂ ਦੀ ਗਿਣਤੀ  {QueueCount Value} ਹੈ 

                // temp = temp + shoowBoothname + " 'ਤੇ " + boothresult.queueEnterTime + " ਹੈ " + boothresult.queueCount

                let temp = ""  ////{Boothname} 'ਤੇ { Time } ਵਜੇ ਕਤਾਰ ਵਿੱਚ ਵੋਟਰਾਂ ਦੀ ਗਿਣਤੀ  {QueueCount Value} ਹੈ 
                // '{Booth name} ਵਿਖੇ {time} ਵਜੇ ਵੋਟਰਾਂ ਦੀ ਗਿਣਤੀ {QueueCount}ਹੈ।'

                temp = temp + shoowBoothname + " ਵਿਖੇ " + boothresult.queueEnterTime + " ਵਜੇ ਵੋਟਰਾਂ ਦੀ ਗਿਣਤੀ " + boothresult.queueCount + " ਹੈ। "

                return res.send({
                    code: '200',
                    status: 'SUCCESS',
                    type: 'text',
                    data: temp
                });
            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
                });
            }

        } else {
            return res.send({
                code: '100',
                status: 'Failed',
                data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
            });
        }

    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
        });
    }
});


router.post('/boothcountEnter/punjabi/:mobileno/:stateid/:districtid/:assemblyMasterId/:boothcode', async (req, res) => {

    try {

        // return res.send("hsdghucdg")
        let mobileNo = req.params.mobileno;
        let assemblyMasterId = req.params.assemblyMasterId;
        let type = req.params.stateid;
        let districtid = req.params.districtid
        let boothcode = req.params.boothcode;
        // let boothqueue = req.params.boothqueue;
        // console.log({ mobileNo, districtid, assemblyMasterId });

        if (boothcode.length > 3) {
            return res.send({
                code: '100',
                status: 'Failed',
                type: 'text',
                data: "ਬੂਥ ਨੰਬਰ ਵੱਧ ਤੋਂ ਵੱਧ 3 ਅੰਕਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।"
            });
        }
        // else if (boothcode.length < 3) {
        //     return res.send({
        //         code: '100',
        //         status: 'Success',
        //         type: 'text',
        //         data: "booth code should be numbered from 1 to 999."
        //     });
        // }
        else {

            if (mobileNo.length == 12 && mobileNo.startsWith('91')) {
                mobileNo = mobileNo.substring('2');
            }

            // var data1 = '';
            var config1 = {
                method: 'get',
                maxBodyLength: Infinity,
                // url: 'https://ppdms.punjab.gov.in/demoapi/api/EAMS/StateList',
                url: 'https://pams.punjab.gov.in/prod/api/EAMS/StateList',

                headers: {}

            };
            let result = await axios(config1);
            let arrobj = result.data.data;
            let arrobj11 = [];
            for (let i = 0; i < arrobj.length; i++) {
                let obj = {}
                if (arrobj.length != undefined && arrobj.length > 0) {
                    // arrobj11.push({ stateName: arrobj[i].stateName, stateId: arrobj[i].stateId, type: i + 1 })
                    if (arrobj[i].secondLanguage !== null) {

                        arrobj11.push({ stateName: arrobj[i].secondLanguage, stateId: arrobj[i].stateId, type: i + 1 })
                    }
                } else {
                    return res.send({
                        code: '100',
                        status: 'Failed',
                        type: 'text',
                        data: "ਸਹੀ ਵਿਕਲਪ ਚੁਣੋ"
                    });
                }
            };
            let record;
            for (let i = 0; i < arrobj11.length; i++) {
                // console.log(i)
                if (type == arrobj11[i].type) {
                    record = arrobj11[i].stateId
                    // console.log(arrobj11[i])
                    break;
                }
            };

            var config1 = {
                method: 'get',
                maxBodyLength: Infinity,
                // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/DistrictList?stateMasterId=${record}`,
                url: `https://pams.punjab.gov.in/prod/api/EAMS/DistrictList?stateMasterId=${record}`,

                headers: {}

            };
            let result1 = await axios(config1);
            let arrobj1 = result1.data.data;

            // console.log("arrobj1 -----------------------------> ", arrobj1, districtid)
            let districtArr = []
            let resultArr = []
            let arrnew = []
            for (let i = 0; i < arrobj1.length; i++) {

                arrnew.push({ districtMasterId: arrobj1[i].districtMasterId, number: i + 1 })
            }

            let distidMaster = null;
            // console.log("arrnew -------------------------------------------->", arrnew)
            for (let i = 0; i < arrnew.length; i++) {
                if (districtid == arrnew[i].number) {

                    distidMaster = arrnew[i].districtMasterId;
                    let config = {
                        method: 'get',
                        maxBodyLength: Infinity,
                        // url: `https://ppdms.punjab.gov.in/demoapi/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,
                        url: `https://pams.punjab.gov.in/prod/api/EAMS/GetAssembliesListById?stateId=${record}&districtId=${arrnew[i].districtMasterId}`,

                        headers: {}
                    };

                    // console.log("config------------------------------->", config)

                    let result = await axios(config);
                    resultArr = result.data.data;
                    break;
                }
            }
            // console.log("resultArr------------------------------- ", resultArr)

            if (resultArr.length > 0) {
                let assemblyId1 = null
                let assemblyIdArr = [];
                for (let i = 0; i < resultArr.length; i++) {
                    assemblyIdArr.push({ assemblyId: resultArr[i].assemblyId, assemblyMasterId: i + 1 })
                }

                // console.log("indsijjdfhefhvbhnc===========================+++++++++++++++++++++++++++", assemblyIdArr)
                let resultdata
                let resultee;
                for (let j = 0; j < assemblyIdArr.length; j++) {
                    // console.log(assemblyMasterId, " == ", assemblyIdArr[j].assemblyMasterId, "cfvgbhnjcdvsxbnmdfnbgvcdhnxj");
                    if (assemblyMasterId == assemblyIdArr[j].assemblyMasterId) {

                        if (assemblyMasterId == assemblyIdArr[j].assemblyMasterId) {
                            assemblyId1 = assemblyIdArr[j].assemblyId
                            let config = {
                                method: 'get',
                                maxBodyLength: Infinity,
                                // url: `https://ppdms.punjab.gov.in/api/EAMS/GetBoothListById?&stateMasterId=${record}&assemblyMasterId=${assemblyIdArr[j].assemblyId}&districtMasterId=${distidMaster}`,
                                url: `https://pams.punjab.gov.in/prod/api/EAMS/GetBoothListById?&stateMasterId=${record}&assemblyMasterId=${assemblyIdArr[j].assemblyId}&districtMasterId=${distidMaster}`,

                                headers: {}
                            };

                            // console.log("config------------------------------->", config)

                            let result = await axios(config);
                            resultee = result
                            resultdata = result.data.data;

                            break;
                        }
                    }
                }
                let boothnameArr = []
                // console.log("resulresultdata1 ------------>", resultdata)
                if (resultdata.length > 0) {
                    // console.log("if", { resultdata })
                    for (let k = 0; k < resultdata.length; k++) {
                        boothnameArr.push({ boothMasterId: resultdata[k].boothMasterId, boothName: resultdata[k].secondLanguage, boothCode_No: resultdata[k].boothCode_No, index: k + 1 })
                    };
                } else {

                    if (resultdata.status == 400) {
                        return res.send({
                            code: '100',
                            status: 'Failed',
                            type: 'text',
                            data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
                        });
                    }
                    // console.log("else", { resultdata })
                    return res.send({
                        code: '100',
                        status: 'Failed',
                        data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
                    });
                }

                // console.log("boothnameArr------------------->", boothnameArr);
                let boothresult = null;
                let shoowBoothname = null;
                let showboothCode_No = null
                for (let i = 0; i < boothnameArr.length; i++) {
                    if (boothcode == boothnameArr[i].boothCode_No) {

                        console.log("inside the index +++++++++++++++++++++", boothnameArr[i]);
                        shoowBoothname = boothnameArr[i].boothName
                        showboothCode_No = boothnameArr[i].boothCode_No
                        let config = {
                            method: 'get',
                            maxBodyLength: Infinity,
                            // url: `https://ppdms.punjab.gov.in/api/EAMS/GetQISList?&stateMasterId=${record}&assemblyMasterId=${assemblyId1}&districtMasterId=${distidMaster}&boothMasterId=${boothnameArr[i].boothMasterId}`,
                            url: `https://pams.punjab.gov.in/prod/api/EAMS/GetQISList?&stateMasterId=${record}&assemblyMasterId=${assemblyId1}&districtMasterId=${distidMaster}&boothMasterId=${boothnameArr[i].boothMasterId}`,
                            headers: {}
                        };

                        // console.log("config------------------------------->", config)

                        let result = await axios(config);
                        // resultee = result
                        boothresult = result.data

                        break;
                    }
                }
                console.log("boothresult-----------------------------------         =============++++++++++++++++++++ => ", { shoowBoothname, showboothCode_No })

                console.log("boothresult         =============++++++++++++++++++++ => ", typeof (boothresult), boothresult)

                if (boothresult instanceof Object) {

                    // let boothqueue = req.params.boothqueue;
                    // if (boothqueue == boothresult.queueCount) {
                    console.log("inside the booth count")
                    let temp = ""


                    temp = temp + `*${shoowBoothname}*` + " ਵਿਖੇ " + `*${boothresult.queueEnterTime}*` + " ਵਜੇ ਵੋਟਰਾਂ ਦੀ ਗਿਣਤੀ " + `*${boothresult.queueCount}*` + " ਹੈ।"

                    return res.send({
                        code: '200',
                        status: 'SUCCESS',
                        type: 'text',
                        data: temp
                    });
                    // } else {
                    //     return res.send({
                    //         code: '100',
                    //         status: 'Failed',
                    //         data: "No Data Found"
                    //     });
                    // }

                } else {
                    return res.send({
                        code: '100',
                        status: 'Failed',
                        data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
                    });
                }

            } else {
                return res.send({
                    code: '100',
                    status: 'Failed',
                    data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
                });
            }
        }



    } catch (err) {
        console.log(err)
        return res.send({
            code: '100',
            status: 'Failed',
            data: "ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ"
        });
    }



});



module.exports = router;

