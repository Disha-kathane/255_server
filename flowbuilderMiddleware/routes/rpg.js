let express = require('express');
let router = express.Router();
let axios = require('axios');
const { rmSync } = require('fs');
let mysql = require('mysql2');
let http = require('http');
let https = require('https');
let httpUrl = require('url');

let db_config = {
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'cescdb',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};

let dbpool = mysql.createPool(db_config).promise();

// check mobile number is registered or not || present on prod

router.post('/checkmobileno/:mobno', async (req, res) => {
    let mobno = null;
    try {

        mobno = req.params.mobno;
        let data = null;
        let status = null;
        let code = null;
        let url = "https://cescrajasthan.co.in/ivrAPI/isPhoneRegistered.php?cli=" + mobno;

        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };

        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        console.log(result.data, mobno);

        data = result.data;
        console.log({ data });

        status = data.STATUS;
        console.log({ status });

        if (status === 'R') {
            code = 200;
        }
        else if (status === 'MR') {
            code = 300;
        }
        else if (status === 'NR') {
            code = 400;
        }

        return res.send({
            code: code,
            status: "SUCCESS",
            type: "text",
            data: status
        });

    } catch (err) {
        console.log(err, mobno);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong, Please try again"
        });
    }
});

// KNO List single || same on prod

router.post('/knolist/:mobno', async (req, res) => {

    try {
        let mobno = req.params.mobno;
        let data = null;
        let message = null;
        let kno = null;
        let name = null;
        let address = null;
        let meterno = null;

        // let tempArr = [];

        console.log({ mobno });

        // let formattedNumber = mobno.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');

        if (mobno.length == 12) {
            mobno = mobno.substring(2, 12);
            console.log({ mobno });
        }

        console.log({ mobno });
        let url = "https://cescrajasthan.co.in/kotawebserviceMC/getknolistmobapp.jsp?mobno=" + mobno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };

        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        console.log(result.data);

        data = result.data.KNOLIST;
        console.log({ data });

        kno = data[0].kno;
        name = data[0].name;
        address = data[0].addr;
        meterno = data[0].meterno;
        regmobno = data[0].regmobno;


        // tempArr.push(kno);

        let query2 = "SELECT COUNT(1) as C from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + mobno]);
        console.log(result2[0][0].C);

        let count = result2[0][0].C;
        console.log({ count });

        if (count === 0) {
            let query1 = "INSERT INTO kno_list_tbl (wanumber, kno_no) VALUES (?,?)";
            let values1 = ["91" + mobno, kno];
            let result1 = await dbpool.query(query1, values1);
        }
        else if (count === 1) {
            let query3 = "Update kno_list_tbl set kno_no = ?, mobileno = ? where wanumber = ?";
            let result3 = await dbpool.query(query3, [kno, '91' + regmobno, '91' + mobno]);
            console.log(result3);
        }

        message = "ℹ️ KNO: " + kno + "\n" + "👨🏼‍💼 Name: " + name + "\n" + "🏚️ Address: " + address + "\n" + "🟦 Meter No: " + meterno + "\n";

        console.log(message);

        if (data === 'NODATA') {
            return res.send({
                code: 300,
                status: "SUCCESS",
                type: "text",
                data: "Please enter valid mobile number"
            });
        }
        else {
            return res.send({
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: message
            });
        }

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong"
        });
    }
});

// KNO List single hindi
router.post('/knolist/hindi/:mobno', async (req, res) => {

    try {
        let mobno = req.params.mobno;
        let data = null;
        let message = null;
        let kno = null;
        let name = null;
        let address = null;
        let meterno = null;
        let mobno1 = null;
        // let tempArr = [];

        console.log({ mobno });

        if (mobno.length == 12) {
            mobno = mobno.substring(2, 12);
            console.log({ mobno });
        }

        // let formattedNumber = mobno.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');

        console.log({ mobno });

        let url = "https://cescrajasthan.co.in/kotawebserviceMC/getknolistmobapp.jsp?mobno=" + mobno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };

        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        console.log(result.data);

        data = result.data.KNOLIST;
        console.log({ data });

        kno = data[0].kno;
        name = data[0].name;
        address = data[0].addr;
        meterno = data[0].meterno;
        regmobno = data[0].regmobno;
        mobno1 = data[0].mobno;

        // tempArr.push(kno);

        let query2 = "SELECT COUNT(1) as C from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + mobno]);
        console.log(result2[0][0].C);

        let count = result2[0][0].C;
        console.log({ count });

        if (count === 0) {
            let query1 = "INSERT INTO kno_list_tbl (wanumber, kno_no) VALUES (?,?)";
            let values1 = ["91" + mobno, kno];
            let result1 = await dbpool.query(query1, values1);
        }
        else if (count === 1) {
            let query3 = "Update kno_list_tbl set kno_no = ?, mobileno = ? where wanumber = ?";
            let result3 = await dbpool.query(query3, [kno, '91' + regmobno, '91' + mobno]);
            console.log(result3);
        }

        message = "ℹ️ केएनओ: " + kno + "\n" + "👨🏼‍💼 नाम: " + name + "\n" + "🏚️ पता: " + address + "\n" + "🟦 मीटर संख्या: " + meterno;

        console.log(message);

        if (data === 'NODATA') {
            return res.send({
                code: 300,
                status: "SUCCESS",
                type: "text",
                data: "कृपया वैध मोबाइल नंबर दर्ज करें"
                // data: "Please enter valid mobile number"

            });
        }
        else {
            return res.send({
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: message
            });
        }

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "कुछ गलत हो गया"
        });
    }
});


// KNO List Single for not registered || same on prod

router.post('/knolist/nr/:mobno/:wanumber', async (req, res) => {

    try {
        let mobno = req.params.mobno;
        let wanumber = req.params.wanumber;
        let data = null;
        let message = null;
        let kno = null;
        let name = null;
        let address = null;
        let meterno = null;
        // let tempArr = [];

        console.log({ mobno });

        // let formattedNumber = mobno.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');
        if (mobno.length == 12) {
            mobno = mobno.substring(2, 12);
            console.log({ mobno });
        }

        // let formattedWanumber = wanumber.replace(/^\+/, '');
        // formattedWanumber = formattedWanumber.replace(/^91/, '');

        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }

        console.log({ mobno, wanumber });

        let url = "https://cescrajasthan.co.in/ivrAPI/isPhoneRegistered.php?cli=" + mobno
        let config1 = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };

        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config1.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config1.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let configResult = await axios(config1);
        console.log("=========> MR");
        console.log(configResult.data.STATUS);

        let configStatus = configResult.data.STATUS;

        console.log({ configStatus });

        if (configStatus === "MR") {

            return res.send({
                code: 400,
                status: "SUCCESS",
                type: "text",
                data: "MR"
            });
        }
        else {
            let url = "https://cescrajasthan.co.in/kotawebserviceMC/getknolistmobapp.jsp?mobno=" + mobno

            let config = {
                method: "post",
                url: url,
                headers: {},
                data: data
            };
            let protocol = httpUrl.parse(url).protocol;
            if (protocol != null && protocol == "https:") {
                config.httpsAgent = new https.Agent({
                    keepAlive: false,
                    rejectUnauthorized: false
                }); //secureProtocol: 'TLSv1_method'
            } else {
                config.httpAgent = new http.Agent({
                    keepAlive: false,
                    rejectUnauthorized: false
                }); //secureProtocol: 'TLSv1_method'
            }



            let result = await axios(config);
            console.log(result.data);

            data = result.data.KNOLIST;
            console.log({ data });

            kno = data[0].kno;
            name = data[0].name;
            address = data[0].addr;
            meterno = data[0].meterno;

            // tempArr.push(kno);

            let query2 = "SELECT COUNT(1) as C from kno_list_tbl where wanumber = ?";
            let result2 = await dbpool.query(query2, ['91' + wanumber]);
            console.log(result2[0][0].C);
            let count = result2[0][0].C;
            console.log({ count });

            if (count === 0) {
                let query1 = "INSERT INTO kno_list_tbl (wanumber, kno_no, mobileno) VALUES (?,?,?)";
                let values1 = ['91' + wanumber, kno, '91' + mobno];
                let result1 = await dbpool.query(query1, values1);
            }
            else {
                let query3 = "UPDATE kno_list_tbl SET kno_no = ?, mobileno = ? WHERE wanumber = ?";
                let result3 = await dbpool.query(query3, [kno, '91' + mobno, '91' + wanumber]);
            }

            message = "ℹ️ KNO: " + kno + "\n" + "👨🏼‍💼 Name: " + name + "\n" + "🏚️ Address: " + address + "\n" + "🟦 Meter No: " + meterno + "\n";

            console.log(message);

            if (data === 'NODATA') {
                return res.send({
                    code: 300,
                    status: "SUCCESS",
                    type: "text",
                    data: "Please enter valid mobile number"
                });
            }
            else {
                return res.send({
                    code: 200,
                    status: "SUCCESS",
                    type: "text",
                    data: message
                });
            }
        }

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong"
        });
    }
});

// KNO List single for not registered hindi

router.post('/knolist/nr/hindi/:mobno/:wanumber', async (req, res) => {

    try {
        let mobno = req.params.mobno;
        let wanumber = req.params.wanumber;
        let data = null;
        let message = null;
        let kno = null;
        let name = null;
        let address = null;
        let meterno = null;
        // let tempArr = [];

        console.log({ mobno });

        // let formattedNumber = mobno.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');

        if (mobno.length == 12) {
            mobno = mobno.substring(2, 12);
            console.log({ mobno });
        }

        // let formattedWanumber = wanumber.replace(/^\+/, '');
        // formattedWanumber = formattedWanumber.replace(/^91/, '');

        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }

        console.log({ mobno, wanumber });

        // let config1 = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/ivrAPI/isPhoneRegistered.php?cli=" + mobno,
        //     headers: {},
        //     data: data
        // };

        let url = "https://cescrajasthan.co.in/ivrAPI/isPhoneRegistered.php?cli=" + mobno

        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let configResult = await axios(config1);
        console.log("=========> MR");
        console.log(configResult.data.STATUS);

        let configStatus = configResult.data.STATUS;

        console.log({ configStatus });

        if (configStatus === "MR") {

            return res.send({
                code: 400,
                status: "SUCCESS",
                type: "text",
                data: "MR"
            });
        }
        else {

            // let config = {
            //     method: "post",
            //     url: "https://cescrajasthan.co.in/kotawebserviceMC/getknolistmobapp.jsp?mobno=" + mobno,
            //     headers: {},
            //     data: data
            // };

            let url = "https://cescrajasthan.co.in/kotawebserviceMC/getknolistmobapp.jsp?mobno=" + mobno

            let config = {
                method: "post",
                url: url,
                headers: {},
                data: data
            };
            let protocol = httpUrl.parse(url).protocol;
            if (protocol != null && protocol == "https:") {
                config.httpsAgent = new https.Agent({
                    keepAlive: false,
                    rejectUnauthorized: false
                }); //secureProtocol: 'TLSv1_method'
            } else {
                config.httpAgent = new http.Agent({
                    keepAlive: false,
                    rejectUnauthorized: false
                }); //secureProtocol: 'TLSv1_method'
            }

            let result = await axios(config);
            console.log(result.data);

            data = result.data.KNOLIST;
            console.log({ data });

            kno = data[0].kno;
            name = data[0].name;
            address = data[0].addr;
            meterno = data[0].meterno;

            // tempArr.push(kno);

            let query2 = "SELECT COUNT(1) as C from kno_list_tbl where wanumber = ?";
            let result2 = await dbpool.query(query2, ['91' + wanumber]);
            console.log(result2[0][0].C);
            let count = result2[0][0].C;
            console.log({ count });

            if (count === 0) {
                let query1 = "INSERT INTO kno_list_tbl (wanumber, kno_no, mobileno) VALUES (?,?,?)";
                let values1 = ['91' + wanumber, kno, '91' + mobno];
                let result1 = await dbpool.query(query1, values1);
            }
            else {
                let query3 = "UPDATE kno_list_tbl SET kno_no = ?, mobileno = ? WHERE wanumber = ?";
                let result3 = await dbpool.query(query3, [kno, '91' + mobno, '91' + wanumber]);
            }

            // message = "KNO: " + kno + "\n" + "Name: " + name + "\n" + "Address: " + address + "\n" + "Meter No: " + meterno;
            message = "ℹ️ केएनओ: " + kno + "\n" + "👨🏼‍💼 नाम: " + name + "\n" + "🏚️ पता: " + address + "\n" + "🟦 मीटर संख्या: " + meterno;


            console.log(message);

            if (data === 'NODATA') {
                return res.send({
                    code: 300,
                    status: "SUCCESS",
                    type: "text",
                    // data: "Please enter valid mobile number"
                    data: 'कृपया वैध मोबाइल नंबर दर्ज करें'
                });
            }
            else {
                return res.send({
                    code: 200,
                    status: "SUCCESS",
                    type: "text",
                    data: message
                });
            }
        }

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "कुछ गलत हो गया"
        });
    }
});


// Register mobile number || same on production

router.post('/registermobno/:kno/:wanumber', async (req, res) => {

    try {
        let kno = req.params.kno;
        let wanumber = req.params.wanumber;
        console.log({ wanumber });
        let data = null;
        let name = null;
        let address = null;
        let meterno = null;
        let mobileno = null;
        let mobno1 = null;


        if (kno.length !== 12) {
            return res.send({
                code: 400,
                status: "FAILED",
                type: "text",
                message: "Invalid KNO"
            });
        }

        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
        //     headers: {},
        //     data: data
        // };

        let url = "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno

        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }


        let result = await axios(config);
        console.log(result.data);
        data = result.data.KNOPROFILEDET;
        kno = data.lkno;
        name = data.name;
        address = data.address;
        meterno = data.mno;
        mobno = data.mobno;

        let number1 = null;
        // console.log(endnumber);
        if (mobno === '-') {
            number1 = "NA";
        } else {
            // number1 = endnumber.padStart(mobno.length, 'X');
            let endnumber = mobno.slice(-3);
            number1 = endnumber.padStart(mobno.length, 'X');
            // Console.log({ number1 });
        }
        console.log({ number1 });

        let query2 = "SELECT COUNT(1) as C from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, [wanumber]);
        console.log(result2[0][0].C);
        let count = result2[0][0].C;
        console.log({ count });

        if (count === 0) {
            let query1 = "INSERT INTO kno_list_tbl (wanumber, kno_no, mobileno) VALUES (?,?,?)";
            let result1 = await dbpool.query(query1, [wanumber, kno, '91' + mobno]);
            console.log(result1);
        }
        else {
            let query3 = "update kno_list_tbl set kno_no = ?, mobileno = ? where wanumber = ?";
            let result3 = await dbpool.query(query3, [kno, '91' + mobno, wanumber]);
            console.log(result3);
        }

        if (data === 'NODATA') {
            message = "Please enter valid KNO";
            return res.send({
                code: 300,
                status: "SUCCESS",
                type: "text",
                data: message
            });
        }
        else {
            message = "ℹ️ KNO: " + kno + "\n" + "👨🏼‍💼 Name: " + name + "\n" + "🏚️ Address: " + address + "\n" + "🟦 Meter No: " + meterno +
                "\n" + "📱Mobile No: " + number1 + "\n\n";
            return res.send({
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: message
            });
        }

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong"
        });
    }
});

// Register Hindi mobile number || same on production

router.post('/registermobno/hindi/:kno/:wanumber', async (req, res) => {

    try {
        let kno = req.params.kno;
        let wanumber = req.params.wanumber;
        console.log({ wanumber });
        let data = null;
        let name = null;
        let address = null;
        let meterno = null;
        let mobileno = null;
        let mobno1 = null;


        if (kno.length !== 12) {
            return res.send({
                code: 400,
                status: "FAILED",
                type: "text",
                message: "अमान्य केएनओ"
            });
        }

        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
        //     headers: {},
        //     data: data
        // };

        let url = "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno

        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }


        let result = await axios(config);
        console.log(result.data);
        data = result.data.KNOPROFILEDET;
        kno = data.lkno;
        name = data.name;
        address = data.address;
        meterno = data.mno;
        mobno = data.mobno;

        let number1 = null;
        // console.log(endnumber);
        if (mobno === '-') {
            number1 = "NA";
        } else {
            // number1 = endnumber.padStart(mobno.length, 'X');
            let endnumber = mobno.slice(-3);
            number1 = endnumber.padStart(mobno.length, 'X');
            // Console.log({ number1 });
        }
        console.log({ number1 });

        let query2 = "SELECT COUNT(1) as C from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, [wanumber]);
        console.log(result2[0][0].C);
        let count = result2[0][0].C;
        console.log({ count });

        if (count === 0) {
            let query1 = "INSERT INTO kno_list_tbl (wanumber, kno_no, mobileno) VALUES (?,?,?)";
            let result1 = await dbpool.query(query1, [wanumber, kno, '91' + mobno]);
            console.log(result1);
        }
        else {
            let query3 = "update kno_list_tbl set kno_no = ?, mobileno = ? where wanumber = ?";
            let result3 = await dbpool.query(query3, [kno, '91' + mobno, wanumber]);
            console.log(result3);
        }

        if (data === 'NODATA') {
            message = "कृपया वैध KNO दर्ज करें";
            return res.send({
                code: 300,
                status: "SUCCESS",
                type: "text",
                data: message
            });
        }
        else {

            message = "ℹ️ केएनओ: " + kno + "\n" + "👨🏼‍💼 नाम: " + name + "\n" + "Address: " + "🏚️ पता: " + address + "\n" + "🟦 मीटर संख्या: " + meterno +
                "\n" + "📱मोबाइल नं.: " + number1 + "\n\n";
            return res.send({
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: message
            });
        }

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "कुछ गलत हो गया"
        });
    }
});


// Change registered mob. no

router.post('/changemobileno/:kno/:mobno/:rmobno', async (req, res) => {

    try {
        let kno = req.params.kno;
        let mobno = req.params.mobno;
        let rmobno = req.params.rmobno;
        let cli = null;
        let data = null;
        // let url = "https://cescrajasthan.co.in/ivrAPI/sendPhForReg.php?kno=" + kno + "&mob_no=" + mobno + "&cli=" + mobno;

        if (mobno.length == 12) {
            mobno = mobno.substring(2, 12);
            console.log({ mobno });
        }

        // let formattedNumber = rmobno.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');

        if (rmobno.length == 12) {
            rmobno = rmobno.substring(2, 12);
            console.log({ rmobno });
        }

        console.log({ rmobno });

        console.log({ kno, mobno, rmobno });

        // let config1 = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
        //     headers: {},
        //     data: data
        // };


        let url = "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let configResult = await axios(config1);
        console.log(configResult.data.KNOPROFILEDET.mobno);

        cli = configResult.data.KNOPROFILEDET.mobno;
        console.log({ cli });

        // if(mobno != rmobno ){
        //     console.log(" mobile number resistered successfully" )
        // }else{          
        if (cli === rmobno) {
            // let config = {
            //     method: "post",
            //     url: "https://cescrajasthan.co.in/ivrAPI/sendPhForReg.php?kno=" + kno + "&mob_no=" + mobno + "&cli=" + mobno,
            //     headers: {},
            //     data: data
            // };


            let url = "https://cescrajasthan.co.in/ivrAPI/sendPhForReg.php?kno=" + kno + "&mob_no=" + mobno + "&cli=" + mobno
            let config = {
                method: "post",
                url: url,
                headers: {},
                data: data
            };
            let protocol = httpUrl.parse(url).protocol;
            if (protocol != null && protocol == "https:") {
                config.httpsAgent = new https.Agent({
                    keepAlive: false,
                    rejectUnauthorized: false
                }); //secureProtocol: 'TLSv1_method'
            } else {
                config.httpAgent = new http.Agent({
                    keepAlive: false,
                    rejectUnauthorized: false
                }); //secureProtocol: 'TLSv1_method'
            }


            let result = await axios(config);
            console.log(result.data);

            let query1 = "update kno_list_tbl set wanumber = ? where kno_no = ?";
            let result1 = await dbpool.query(query1, ['91' + mobno, kno]);
            console.log({ result1 });

            if (result.data.status == 'success') {
                return res.send({
                    code: 200,
                    status: "SUCCESS",
                    type: "text",
                    data: "Mobile number registered successfully"
                });
            }
        }
        else {
            return res.send({
                code: 300,
                status: "FAILED",
                type: "text",
                data: "Mobile number does not matched with registered mobile number. please try again"
            });
        }
        // }

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong"
        });
    }
});

// Payment Midddlewares

router.post('/payment/:wanumber', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        let kno = null;
        let kdel = "2107";
        let besl = "2102";
        let bkesl = "3101";
        let url = null;

        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }

        console.log({ wanumber });

        let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + wanumber]);
        console.log("inside payment block------------------->", JSON.stringify(result2));

        if (result2[0][0].mobileno == null) {

            let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            let result1 = await dbpool.query(query1, ['91' + wanumber]);
            console.log({ result1 });
            console.log(result1[0][0].kno_no);
            kno = result1[0][0].kno_no;
        }
        else {
            // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
            // console.log({ result1 });
            // console.log(result1[0][0].kno_no);
            // kno = result1[0][0].kno_no;
            // mobileno = formattedNumber;

            console.log(result2[0][0]);

            let mobileno = result2[0][0].mobileno;
            console.log({ mobileno });

            // let wanumber = mobileno.replace(/^\+/, '');
            // wanumber = wanumber.replace(/^91/, '');

            if (mobileno.length == 12) {
                mobileno = mobileno.substring(2, 12);
                console.log({ mobileno });
            }

            let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
            let result3 = await dbpool.query(query3, ['91' + mobileno]);
            console.log(result3[0][0].kno_no);
            kno = result3[0][0].kno_no;

        }

        if (kno.toString().includes(kdel)) {
            // console.log("Kno belongs to kedl");
            url = "https://services.cesc.co.in/jascnaesr/kedl/bdreq.php?kno=" + kno;
        }
        else if (kno.toString().includes(besl)) {
            // console.log("Kno belongs to besl");
            url = "https://services.cesc.co.in/jascnaesr/besl/bdreq.php?kno=" + kno;
        }
        else if (kno.toString().includes(bkesl)) {
            // console.log("Kno belongs to bkesl");
            url = "https://services.cesc.co.in/jascnaesr/bkesl/bdreq.php?kno=" + kno;
        }

        let message = "Please click the below link for payment" + "\n\n" + url;

        console.log(message);

        return res.send({
            code: 200,
            status: "SUCCESS",
            type: "text",
            data: message
        });

    } catch (err) {
        console.log(err);
        return res.send({
            code: 100,
            status: "FAILED",
            data: "Something went wrong"
        });
    }
});

// Payment middleware hindi

router.post('/payment/hindi/:wanumber', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        let kno = null;
        let kdel = "2107";
        let besl = "2102";
        let bkesl = "3101";
        let url = null;

        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }

        console.log({ wanumber });
        let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + wanumber]);

        if (result2[0][0].mobileno == null) {

            let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            let result1 = await dbpool.query(query1, ['91' + wanumber]);
            console.log({ result1 });
            console.log(result1[0][0].kno_no);
            kno = result1[0][0].kno_no;
        }
        else {
            // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
            // console.log({ result1 });
            // console.log(result1[0][0].kno_no);
            // kno = result1[0][0].kno_no;
            // mobileno = formattedNumber;

            console.log(result2[0][0]);

            let mobileno = result2[0][0].mobileno;
            console.log({ mobileno });

            // let formattedMobileno = mobileno.replace(/^\+/, '');
            // formattedMobileno = formattedMobileno.replace(/^91/, '');

            if (mobileno.length == 12) {
                mobileno = mobileno.substring(2, 12);
                console.log({ mobileno });
            }

            let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
            let result3 = await dbpool.query(query3, ['91' + mobileno]);
            console.log(result3[0][0].kno_no);
            kno = result3[0][0].kno_no;

        }

        if (kno.toString().includes(kdel)) {
            // console.log("Kno belongs to kedl");
            url = "https://services.cesc.co.in/jascnaesr/kedl/bdreq.php?kno=" + kno;
        }
        else if (kno.toString().includes(besl)) {
            // console.log("Kno belongs to besl");
            url = "https://services.cesc.co.in/jascnaesr/besl/bdreq.php?kno=" + kno;
        }
        else if (kno.toString().includes(bkesl)) {
            // console.log("Kno belongs to bkesl");
            url = "https://services.cesc.co.in/jascnaesr/bkesl/bdreq.php?kno=" + kno;
        }

        let message = "भुगतान के लिए कृपया नीचे दिए गए लिंक पर क्लिक करें" + "\n\n" + url;

        console.log(message);

        return res.send({
            code: 200,
            status: "SUCCESS",
            type: "text",
            data: message
        });

    } catch (err) {
        console.log(err);
        return res.send({
            code: 100,
            status: "FAILED",
            data: "कुछ गलत हो गया"
        });
    }
});

// Outage Information middleware

router.post('/outageinfo/:wanumber', async (req, res) => {
    try {
        let url = null;
        let wanumber = req.params.wanumber;
        let kno = null;
        let message = null;
        let result = null;

        let kdel = "2107";
        let besl = "2102";
        let bkesl = "3101";

        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');

        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }

        let query1 = "Select kno_no from kno_list_tbl where wanumber = ?";
        let result1 = await dbpool.query(query1, ['91' + wanumber]);
        console.log(result1[0][0]);
        result = result1[0][0];
        kno = result1[0][0].kno_no;

        console.log({ kno });

        if (kno.toString().includes(kdel)) {
            url = "https://cescrajasthan.co.in/cescraj/pages/event/lib/jsonBulletinDetail.php?div=2107&frmt=htm";
        }
        else if (kno.toString().includes(besl)) {
            url = "https://cescrajasthan.co.in/cescraj/pages/event/lib/jsonBulletinDetail.php?div=2102&frmt=htm";
        }
        else if (kno.toString().includes(bkesl)) {
            url = "https://cescrajasthan.co.in/cescraj/pages/event/lib/jsonBulletinDetail.php?div=3101&frmt=htm";
        }

        message = "Please click below url to check outage information: \n\n" + "URL: " + url;
        console.log(message);

        return res.send({
            code: 200,
            status: "SUCCESS",
            type: "text",
            data: message
        });


    } catch (err) {
        console.log(err);
        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Data not found"
        });
    }
});

// Multiple KNO List 

router.post('/knolistmultiple/:mobileno', async (req, res) => {

    try {

        let mobileno = req.params.mobileno;

        // let formattedNumber = mobileno.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');

        if (mobileno.length == 12) {
            mobileno = mobileno.substring(2, 12);
            console.log({ mobileno });
        }
        console.log({ mobileno });

        let data = null;
        let message = "You have multiple KNO registered:\n\n";
        let kno = null;
        let name = null;
        let address = null;
        let meterno = null;
        // let counter = 0;

        let listWebhookPayload = {};

        // let config = {
        //     method: 'post',
        //     url: 'https://cescrajasthan.co.in/kotawebserviceMC/getknolistmobapp.jsp?mobno=' + mobileno,
        //     headers: {},
        //     data: data
        // };

        let url = 'https://cescrajasthan.co.in/kotawebserviceMC/getknolistmobapp.jsp?mobno=' + mobileno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        console.log(result.data);
        data = result.data.KNOLIST;
        console.log({ data });
        console.log("=========> length", data.length);

        let length = data.length;
        console.log({ length });

        if (length < 5) {
            for (let i = 0; i < length; i++) {
                kno = data[i].kno;
                name = data[i].name;
                console.log({ kno, name });
                message += (i + 1) + ")" + " KNO: " + kno + "\n" + "     Name: " + name + "\n\n";
            }
        }
        else {
            for (let i = 0; i <= 4; i++) {
                kno = data[i].kno;
                name = data[i].name;
                console.log({ kno, name });
                message += (i + 1) + ")" + " KNO: " + kno + "\n" + "     Name: " + name + "\n\n";
            }
        }

        console.log(message);

        let finalMessage = message;

        console.log(finalMessage);

        return res.send({
            code: 200,
            status: "SUCCESS",
            type: "list",
            data: finalMessage
        });

    } catch (err) {
        console.log(err);
        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong"
        });
    }
});

// Multiple KNO list Hindi

router.post('/knolistmultiple/hindi/:mobileno', async (req, res) => {

    try {

        let mobileno = req.params.mobileno;
        if (mobileno.length == 12) {
            mobileno = mobileno.substring(2, 12);
            console.log({ mobileno });
        }

        // let formattedNumber = mobileno.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');

        console.log({ mobileno });

        let data = null;
        // let message = "You have multiple KNO registered:\n\n";
        let message = "आपके पास एकाधिक KNO पंजीकृत हैं:\n\n";
        let kno = null;
        let name = null;
        let address = null;
        let meterno = null;
        // let counter = 0;

        let listWebhookPayload = {};

        // let config = {
        //     method: 'post',
        //     url: 'https://cescrajasthan.co.in/kotawebserviceMC/getknolistmobapp.jsp?mobno=' + mobileno,
        //     headers: {},
        //     data: data
        // };


        let url = 'https://cescrajasthan.co.in/kotawebserviceMC/getknolistmobapp.jsp?mobno=' + mobileno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        console.log(result.data);
        data = result.data.KNOLIST;
        console.log({ data });
        console.log("=========> length", data.length);

        let length = data.length;
        console.log({ length });

        if (length < 5) {
            for (let i = 0; i < length; i++) {
                kno = data[i].kno;
                name = data[i].name;
                console.log({ kno, name });
                message += (i + 1) + ")" + " केएनओ: " + kno + "\n" + " नाम: " + name + "\n\n";
            }
        }
        else {
            for (let i = 0; i <= 4; i++) {
                kno = data[i].kno;
                name = data[i].name;
                console.log({ kno, name });
                message += (i + 1) + ")" + " केएनओ: " + kno + "\n" + " नाम: " + name + "\n\n";
            }
        }

        // for (let i = 0; i <= 4; i++) {
        //     kno = data[i].kno;
        //     name = data[i].name;
        //     console.log({ kno, name });
        //     message += (i + 1) + ")" + " केएनओ: " + kno + "\n" + "     नाम: " + name + "\n\n";
        // }

        console.log(message);

        let finalMessage = message;

        console.log(finalMessage);

        return res.send({
            code: 200,
            status: "SUCCESS",
            type: "list",
            data: finalMessage
        });

    } catch (err) {
        console.log(err);
        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "कुछ गलत हो गया"
        });
    }
});

// show details from multiple kno registered for not registered flow

router.post('/selectedknodetails/:kno/:mobileno/:rmobno', async (req, res) => {

    try {
        let kno = req.params.kno;
        let mobileno = req.params.mobileno;
        let rmobno = req.params.rmobno;
        let data = null;

        let knoResult = null;
        let name = null;
        let address = null;
        let meterNo = null;
        let message = '';
        let cli = null;

        if (kno.length !== 12) {
            return res.send({
                code: 400,
                status: "FAILED",
                type: "text",
                message: "Invalid KNO"
            });
        }

        // let formattedNumber = mobileno.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');

        if (mobileno.length == 12) {
            mobileno = mobileno.substring(2, 12);
            console.log({ mobileno });
        }

        console.log({ mobileno });

        // let formattedRNumber = rmobno.replace(/^\+/, '');
        // formattedRNumber = formattedRNumber.replace(/^91/, '');
        if (rmobno.length == 12) {
            rmobno = rmobno.substring(2, 12);
            console.log({ rmobno });
        }

        console.log({ rmobno });


        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
        //     headers: {},
        //     data: data
        // };


        let url = "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        console.log(result.data.KNOPROFILEDET);
        data = result.data.KNOPROFILEDET;

        if (data == 'NODATA') {
            return res.send({
                code: 300,
                status: "FAILED",
                type: "text",
                data: "Invalid KNO"
            });
        }

        knoResult = data.lkno;
        name = data.name;
        address = data.address;
        meterNo = data.mno;
        cli = data.mobno;

        if (cli === rmobno) {
            message += "ℹ️ KNO: " + kno + "\n" + "👨🏼‍💼 Name: " + name + "\n" + "🏚️ Address: " + address + "\n" + "🟦 Meter No: " + meterNo;

            console.log(message);

            let query2 = "select count(1) as C from kno_list_tbl where wanumber = ?";
            let result2 = await dbpool.query(query2, ['91' + mobileno]);
            console.log(result2[0][0]);

            let count = result2[0][0].C;
            console.log({ count });

            if (count === 0) {
                let query1 = "INSERT INTO kno_list_tbl (wanumber, kno_no) VALUES (?,?)";
                let queryResult = await dbpool.query(query1, ['91' + mobileno, kno]);
                console.log({ queryResult });
            }
            else {
                let query3 = "UPDATE kno_list_tbl SET kno_no = ?, mobileno = ? where wanumber = ?";
                let result3 = await dbpool.query(query3, [kno, '91' + rmobno, '91' + mobileno]);
                console.log({ result3 });
            }

            return res.send({
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: message
            });
        }
        else {
            return res.send({
                code: 500,
                status: "FAILED",
                type: "text",
                data: "This KNO does not match with your mobile number. Please enter valid KNO"
            });
        }

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong"
        });
    }
});

// show details from multiple kno registered for not registered flow hindi

router.post('/selectedknodetails/hindi/:kno/:mobileno/:rmobno', async (req, res) => {

    try {
        let kno = req.params.kno;
        let mobileno = req.params.mobileno;
        let rmobno = req.params.rmobno;
        let data = null;

        let knoResult = null;
        let name = null;
        let address = null;
        let meterNo = null;
        let message = '';
        let cli = null;

        if (kno.length !== 12) {
            return res.send({
                code: 400,
                status: "FAILED",
                type: "text",
                message: "अमान्य केएनओ"
            });
        }

        // let formattedNumber = mobileno.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');

        if (mobileno.length == 12) {
            mobileno = mobileno.substring(2, 12);
            console.log({ mobileno });
        }

        console.log({ mobileno });

        // let formattedRNumber = rmobno.replace(/^\+/, '');
        // formattedRNumber = formattedRNumber.replace(/^91/, '');

        if (rmobno.length == 12) {
            rmobno = rmobno.substring(2, 12);
            console.log({ rmobno });
        }

        console.log({ rmobno });


        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
        //     headers: {},
        //     data: data
        // };

        let url = "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }


        let result = await axios(config);
        console.log(result.data.KNOPROFILEDET);
        data = result.data.KNOPROFILEDET;

        if (data == 'NODATA') {
            return res.send({
                code: 300,
                status: "FAILED",
                type: "text",
                data: "अमान्य केएनओ"
            });
        }

        knoResult = data.lkno;
        name = data.name;
        address = data.address;
        meterNo = data.mno;
        cli = data.mobno;

        if (cli === rmobno) {
            message += "ℹ️ केएनओ: " + kno + "\n" + "👨🏼‍💼 नाम: " + name + "\n" + "🏚️ पता: " + address + "\n" + "🟦 मीटर संख्या: " + meterNo;

            console.log(message);

            let query2 = "select count(1) as C from kno_list_tbl where wanumber = ?";
            let result2 = await dbpool.query(query2, ['91' + mobileno]);
            console.log(result2[0][0]);

            let count = result2[0][0].C;
            console.log({ count });

            if (count === 0) {
                let query1 = "INSERT INTO kno_list_tbl (wanumber, kno_no) VALUES (?,?)";
                let queryResult = await dbpool.query(query1, ['91' + mobileno, kno]);
                console.log({ queryResult });
            }
            else {
                let query3 = "UPDATE kno_list_tbl SET kno_no = ?, mobileno = ? where wanumber = ?";
                let result3 = await dbpool.query(query3, [kno, '91' + rmobno, '91' + mobileno]);
                console.log({ result3 });
            }

            return res.send({
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: message
            });
        }
        else {
            return res.send({
                code: 500,
                status: "FAILED",
                type: "text",
                // data: "This KNO does not match with your mobile number. Please enter valid KNO"
                data: "यह KNO आपके मोबाइल नंबर से मेल नहीं खाता. कृपया वैध KNO दर्ज करें"
            });
        }

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            // data: "Something went wrong"
            data: "कुछ गलत हो गया"
        });
    }
});

// show details from multiple kno registered for multi registered flow

router.post('/mrr/:kno/:wanumber', async (req, res) => {
    try {
        let kno = req.params.kno;
        let wanumber = req.params.wanumber;
        let data = null;

        let knoResult = null;
        let name = null;
        let address = null;
        let meterNo = null;
        let message = '';
        let cli = null;

        console.log({ kno, wanumber });

        if (kno.length !== 12) {
            return res.send({
                code: 400,
                status: "FAILED",
                type: "text",
                message: "Invalid KNO"
            });
        }

        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');

        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }


        console.log({ wanumber });

        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
        //     headers: {},
        //     data: data
        // };

        let url = "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }
        let result = await axios(config);
        console.log(result.data.KNOPROFILEDET);
        data = result.data.KNOPROFILEDET;

        if (data == 'NODATA') {
            return res.send({
                code: 300,
                status: "SUCCESS",
                type: "text",
                data: "Invalid KNO"
            });
        }

        knoResult = data.lkno;
        name = data.name;
        address = data.address;
        meterNo = data.mno;
        cli = data.mobno;

        if (cli === wanumber) {
            message += "ℹ️ KNO: " + kno + "\n" + "👨🏼‍💼 Name: " + name + "\n" + "🏚️ Address: " + address + "\n" + "🟦 Meter No: " + meterNo;

            console.log(message);

            let query2 = "select count(1) as C from kno_list_tbl where wanumber = ?";
            let result2 = await dbpool.query(query2, ['91' + wanumber]);
            console.log(result2[0][0]);

            let count = result2[0][0].C;
            console.log({ count });

            if (count === 0) {
                let query1 = "INSERT INTO kno_list_tbl (wanumber, kno_no) VALUES (?,?)";
                let queryResult = await dbpool.query(query1, ['91' + wanumber, kno]);
                console.log({ queryResult });
            }
            else {
                let query3 = "UPDATE kno_list_tbl SET kno_no = ?, mobileno = ? where wanumber = ?";
                let result3 = await dbpool.query(query3, [kno, null, '91' + wanumber]);
                console.log({ result3 });
            }

            return res.send({
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: message
            });

        }
        else {
            return res.send({
                code: 500,
                status: "FAILED",
                type: "text",
                data: "This KNO does not match with your mobile number. Please enter valid KNO"
            });
        }

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong"
        });
    }
});

// show details from multiple kno registered for multi registered flow hindi

router.post('/mrr/hindi/:kno/:wanumber', async (req, res) => {
    try {
        let kno = req.params.kno;
        let wanumber = req.params.wanumber;
        let data = null;

        let knoResult = null;
        let name = null;
        let address = null;
        let meterNo = null;
        let message = '';
        let cli = null;

        console.log({ kno, wanumber });

        if (kno.length !== 12) {
            return res.send({
                code: 400,
                status: "FAILED",
                type: "text",
                message: "अमान्य केएनओ"
            });
        }

        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');


        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }

        console.log({ wanumber });

        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
        //     headers: {},
        //     data: data
        // };

        let url = "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        console.log(result.data.KNOPROFILEDET);
        data = result.data.KNOPROFILEDET;

        if (data == 'NODATA') {
            return res.send({
                code: 300,
                status: "SUCCESS",
                type: "text",
                data: "अमान्य केएनओ"
            });
        }

        knoResult = data.lkno;
        name = data.name;
        address = data.address;
        meterNo = data.mno;
        cli = data.mobno;

        if (cli === wanumber) {
            message += "ℹ️ केएनओ: " + kno + "\n" + "👨🏼‍💼 नाम: " + name + "\n" + "🏚️ पता: " + address + "\n" + "🟦 मीटर संख्या: " + meterNo;

            console.log(message);

            let query2 = "select count(1) as C from kno_list_tbl where wanumber = ?";
            let result2 = await dbpool.query(query2, ['91' + wanumber]);
            console.log(result2[0][0]);

            let count = result2[0][0].C;
            console.log({ count });

            if (count === 0) {
                let query1 = "INSERT INTO kno_list_tbl (wanumber, kno_no) VALUES (?,?)";
                let queryResult = await dbpool.query(query1, ['91' + wanumber, kno]);
                console.log({ queryResult });
            }
            else {
                let query3 = "UPDATE kno_list_tbl SET kno_no = ?, mobileno = ? where wanumber = ?";
                let result3 = await dbpool.query(query3, [kno, null, '91' + wanumber]);
                console.log({ result3 });
            }

            return res.send({
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: message
            });

        }
        else {
            return res.send({
                code: 500,
                status: "FAILED",
                type: "text",
                data: "यह KNO आपके मोबाइल नंबर से मेल नहीं खाता. कृपया वैध KNO दर्ज करें"
            });
        }

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "कुछ गलत हो गया"
        });
    }
});


// Download latest bill

router.post('/getlatestbill/:wanumber', async (req, res) => {

    try {
        // let kno = req.params.kno;
        // let data = null;

        let wanumber = req.params.wanumber;
        let data = null;
        let kno = null;


        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }

        console.log({ wanumber });

        let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + wanumber]);
        console.log({ result2 });
        console.log("=========================================");
        console.log(result2[0][0].mobileno);

        if (result2[0][0].mobileno == null) {

            let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            let result1 = await dbpool.query(query1, ['91' + wanumber]);
            console.log({ result1 });
            console.log(result1[0][0].kno_no);
            kno = result1[0][0].kno_no;
        }
        else {
            // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
            // console.log({ result1 });
            // console.log(result1[0][0].kno_no);
            // kno = result1[0][0].kno_no;
            // mobileno = formattedNumber;

            console.log(result2[0][0]);

            let mobileno = result2[0][0].mobileno;
            console.log({ mobileno });

            // let formattedMobileno = mobileno.replace(/^\+/, '');
            // formattedMobileno = formattedMobileno.replace(/^91/, '');
            if (mobileno.length == 12) {
                mobileno = mobileno.substring(2, 12);
                console.log({ mobileno });
            }


            let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
            let result3 = await dbpool.query(query3, ['91' + mobileno]);
            console.log(result3[0][0].kno_no);
            kno = result3[0][0].kno_no;

        }

        // let config = {
        //     method: 'post',
        //     url: 'https://cescrajasthan.co.in/kotawebsite/current_bill_mobapp.jsp?kno=' + kno,
        //     headers: {},
        //     data: data
        // };

        let url = 'https://cescrajasthan.co.in/kotawebsite/current_bill_mobapp.jsp?kno=' + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        console.log(result.data);
        data = result.data;

        let pdfurl = data.PDFURL;

        let message = "Please find below URL to download your bill.\n\n" + "*URL*: " + pdfurl;
        console.log(message);

        if (data.STATUS === 'ERROR') {
            return res.send({
                code: 100,
                status: "FAILED",
                type: "text",
                data: "Something went wrong"
            });
        }
        else {
            return res.send({
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: message
            });
        }


        console.log({ pdfurl });

    } catch (err) {
        console.log(err);
        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong"
        });
    }
});

// Downloads latest bill hindi

router.post('/getlatestbill/hindi/:wanumber', async (req, res) => {

    try {
        // let kno = req.params.kno;
        // let data = null;

        let wanumber = req.params.wanumber;
        let data = null;
        let kno = null;

        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }
        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');

        console.log({ wanumber });

        let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + wanumber]);
        console.log({ result2 });
        console.log("=========================================");
        console.log(result2[0][0].mobileno);

        if (result2[0][0].mobileno == null) {

            let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            let result1 = await dbpool.query(query1, ['91' + wanumber]);
            console.log({ result1 });
            console.log(result1[0][0].kno_no);
            kno = result1[0][0].kno_no;
        }
        else {
            // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
            // console.log({ result1 });
            // console.log(result1[0][0].kno_no);
            // kno = result1[0][0].kno_no;
            // mobileno = formattedNumber;

            console.log(result2[0][0]);

            let mobileno = result2[0][0].mobileno;
            console.log({ mobileno });

            // let formattedMobileno = mobileno.replace(/^\+/, '');
            // formattedMobileno = formattedMobileno.replace(/^91/, '');
            if (mobileno.length == 12) {
                mobileno = mobileno.substring(2, 12);
                console.log({ mobileno });
            }

            let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
            let result3 = await dbpool.query(query3, ['91' + mobileno]);
            console.log(result3[0][0].kno_no);
            kno = result3[0][0].kno_no;

        }

        // let config = {
        //     method: 'post',
        //     url: 'https://cescrajasthan.co.in/kotawebsite/current_bill_mobapp.jsp?kno=' + kno,
        //     headers: {},
        //     data: data
        // };

        let url = 'https://cescrajasthan.co.in/kotawebsite/current_bill_mobapp.jsp?kno=' + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }
        let result = await axios(config);
        console.log(result.data);
        data = result.data;

        let pdfurl = data.PDFURL;

        let message = "अपना बिल डाउनलोड करने के लिए कृपया नीचे दिए गए URL पर क्लिक करें।\n\n" + "*URL*: " + pdfurl;
        console.log(message);

        if (data.STATUS === 'ERROR') {
            return res.send({
                code: 100,
                status: "FAILED",
                type: "text",
                data: "कुछ गलत हो गया"
            });
        }
        else {
            return res.send({
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: message
            });
        }


        // console.log({ pdfurl });

    } catch (err) {
        console.log(err);
        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "कुछ गलत हो गया"
        });
    }
});

// Payment History

router.post('/paymenthistory/:wanumber', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        let kno = null;
        let data = null;

        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }


        console.log({ wanumber });


        let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + wanumber]);

        if (result2[0][0].mobileno == null) {

            let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            let result1 = await dbpool.query(query1, ['91' + wanumber]);
            console.log({ result1 });
            console.log(result1[0][0].kno_no);
            kno = result1[0][0].kno_no;
        }
        else {
            // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
            // console.log({ result1 });
            // console.log(result1[0][0].kno_no);
            // kno = result1[0][0].kno_no;
            // mobileno = formattedNumber;

            console.log(result2[0][0]);

            let mobileno = result2[0][0].mobileno;
            console.log({ mobileno });

            // let formattedMobileno = mobileno.replace(/^\+/, '');
            // formattedMobileno = formattedMobileno.replace(/^91/, '');
            if (mobileno.length == 12) {
                mobileno = mobileno.substring(2, 12);
                console.log({ mobileno });
            }

            let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
            let result3 = await dbpool.query(query3, ['91' + mobileno]);
            console.log(result3[0][0].kno_no);
            kno = result3[0][0].kno_no;

        }

        // let config = {
        //     method: 'post',
        //     url: 'https://cescrajasthan.co.in/kotawebserviceMC/getPaymentsmobapp_live.jsp?kno=' + kno,
        //     headers: {},
        //     data: data
        // };

        let url = 'https://cescrajasthan.co.in/kotawebserviceMC/getPaymentsmobapp_live.jsp?kno=' + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        console.log(result.data.PAYMENTSDET);

        data = result.data.PAYMENTSDET;
        console.log({ data });

        let month = null;
        let amount = null;
        let date = null;
        let mode = null;

        let monthResult = null;
        let amountResult = null;
        let dateResult = null;
        let modeResult = null;
        let getMonth = null;


        let message = "👇 Please find below payment details of last 6 months:\n\n";

        for (let i = 1; i <= 6; i++) {

            month = "mnth" + i;
            amount = "pmntamt" + i;
            date = "pmntdt" + i;
            mode = "pmntmode" + i;

            monthResult = data[month];
            amountResult = data[amount];
            dateResult = data[date];
            modeResult = data[mode];
            // getMonth = dateResult.substring(3, 6);
            // console.log({ getMonth, dateResult });
            message += "*Month*: " + monthResult + "\n" + "*Amount*: " + amountResult + "\n" + "*Date*: " + dateResult + "\n" + "*Mode*: " + modeResult + "\n\n";


            // message += "*Month*: " + monthResult + "\n" + "*Amount*: " + amountResult + "\n" + "*Date*: " + dateResult + "\n" + "*Mode*: " + modeResult + "\n\n";
        }

        console.log(message);

        return res.send({
            code: 200,
            status: "SUCCESS",
            type: "text",
            data: message
        });


    } catch (err) {

        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "something went wrong"
        });
    }
});

// Payment History hindi

router.post('/paymenthistory/hindi/:wanumber', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        let kno = null;
        let data = null;

        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }

        console.log({ wanumber });


        let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + wanumber]);

        if (result2[0][0].mobileno == null) {

            let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            let result1 = await dbpool.query(query1, ['91' + wanumber]);
            console.log({ result1 });
            console.log(result1[0][0].kno_no);
            kno = result1[0][0].kno_no;
        }
        else {
            // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
            // console.log({ result1 });
            // console.log(result1[0][0].kno_no);
            // kno = result1[0][0].kno_no;
            // mobileno = formattedNumber;

            console.log(result2[0][0]);

            let mobileno = result2[0][0].mobileno;
            console.log({ mobileno });

            // let formattedMobileno = mobileno.replace(/^\+/, '');
            // formattedMobileno = formattedMobileno.replace(/^91/, '');
            if (mobileno.length == 12) {
                mobileno = mobileno.substring(2, 12);
                console.log({ mobileno });
            }

            let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
            let result3 = await dbpool.query(query3, ['91' + mobileno]);
            console.log(result3[0][0].kno_no);
            kno = result3[0][0].kno_no;

        }

        // let config = {
        //     method: 'post',
        //     url: 'https://cescrajasthan.co.in/kotawebserviceMC/getPaymentsmobapp_live.jsp?kno=' + kno,
        //     headers: {},
        //     data: data
        // };

        let url = 'https://cescrajasthan.co.in/kotawebserviceMC/getPaymentsmobapp_live.jsp?kno=' + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        console.log(result.data.PAYMENTSDET);

        data = result.data.PAYMENTSDET;

        let month = null;
        let amount = null;
        let date = null;
        let mode = null;

        let monthResult = null;
        let amountResult = null;
        let dateResult = null;
        let modeResult = null;
        // let getMonth = null;

        let message = "👇 कृपया पिछले 6 महीनों का भुगतान विवरण नीचे देखें:\n\n";

        for (let i = 1; i <= 6; i++) {

            month = "mnth" + i;
            amount = "pmntamt" + i;
            date = "pmntdt" + i;
            mode = "pmntmode" + i;

            monthResult = data[month];
            amountResult = data[amount];
            dateResult = data[date];
            modeResult = data[mode];


            // getMonth = dateResult.substring(3, 6);
            console.log({ dateResult, modeResult });
            message += "*महीना*: " + monthResult + "\n" + "*राशि*: " + amountResult + "\n" + "*भुगतान तिथि*: " + dateResult + "\n" + "*भुगतान का प्रकार*: " + modeResult + "\n\n";


            // message += "*महीना*: " + monthResult + "\n" + "*राशि*: " + amountResult + "\n" + "*भुगतान तिथि*: " + dateResult + "\n" + "*भुगतान का प्रकार*: " + modeResult + "\n\n";
        }

        console.log({ message });

        return res.send({
            code: 200,
            status: "SUCCESS",
            type: "text",
            data: message
        });


    } catch (err) {

        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "कुछ गलत हो गया"
        });
    }
});

// Usage history

router.post('/usagehistory/:wanumber', async (req, res) => {

    try {

        let wanumber = req.params.wanumber;
        let kno = null;
        let data = null;

        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }

        console.log({ wanumber });

        let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + wanumber]);

        if (result2[0][0].mobileno == null) {

            let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            let result1 = await dbpool.query(query1, ['91' + wanumber]);
            console.log({ result1 });
            console.log(result1[0][0].kno_no);
            kno = result1[0][0].kno_no;
        }
        else {
            // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
            // console.log({ result1 });
            // console.log(result1[0][0].kno_no);
            // kno = result1[0][0].kno_no;
            // mobileno = formattedNumber;

            console.log(result2[0][0]);

            let mobileno = result2[0][0].mobileno;
            console.log({ mobileno });

            // let formattedMobileno = mobileno.replace(/^\+/, '');
            // formattedMobileno = formattedMobileno.replace(/^91/, '');
            if (mobileno.length == 12) {
                mobileno = mobileno.substring(2, 12);
                console.log({ mobileno });
            }

            let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
            let result3 = await dbpool.query(query3, ['91' + mobileno]);
            console.log(result3[0][0].kno_no);
            kno = result3[0][0].kno_no;

        }

        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/kotawebserviceMC/getCnspmobapp_live.jsp?kno=" + kno,
        //     headers: {},
        //     data: data
        // };

        let url = "https://cescrajasthan.co.in/kotawebserviceMC/getCnspmobapp_live.jsp?kno=" + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        data = result.data.CNSPDET;

        console.log(data);

        let message = "👇 Please find below usage history of last 6 months:\n\n";

        let unit = null;
        let date = null;
        let grossAmt = null;
        let netAmt = null;

        let unitResult = null;
        let dateResult = null;
        let grossAmtResult = null;
        let netAmtResult = null;

        for (let i = 1; i <= 6; i++) {
            unit = "unit" + i;
            date = "bccd" + i;
            grossAmt = "grsamt" + i;
            netAmt = "netamt" + i;

            unitResult = data[unit];
            dateResult = data[date];
            grossAmtResult = data[grossAmt];
            netAmtResult = data[netAmt];

            // console.log(unit, date, grossAmt, netAmt);

            message += "*Unit*: " + unitResult + "\n" + "*Date*: " + dateResult + "\n" + "*Gross Amount*: " + grossAmtResult + "\n" + "*Net Amount*: " + netAmtResult + "\n\n";
        }

        console.log(message);

        return res.send({
            code: 200,
            status: "SUCCESS",
            type: "text",
            data: message
        });

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "something went wrong"
        });
    }
});

// Usage history hindi

router.post('/usagehistory/hindi/:wanumber', async (req, res) => {

    try {

        let wanumber = req.params.wanumber;
        let kno = null;
        let data = null;

        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }

        console.log({ wanumber });

        let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + wanumber]);

        if (result2[0][0].mobileno == null) {

            let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            let result1 = await dbpool.query(query1, ['91' + wanumber]);
            console.log({ result1 });
            console.log(result1[0][0].kno_no);
            kno = result1[0][0].kno_no;
        }
        else {
            // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
            // console.log({ result1 });
            // console.log(result1[0][0].kno_no);
            // kno = result1[0][0].kno_no;
            // mobileno = formattedNumber;

            console.log(result2[0][0]);

            let mobileno = result2[0][0].mobileno;
            console.log({ mobileno });

            // let formattedMobileno = mobileno.replace(/^\+/, '');
            // formattedMobileno = formattedMobileno.replace(/^91/, '');
            if (mobileno.length == 12) {
                mobileno = mobileno.substring(2, 12);
                console.log({ mobileno });
            }

            let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
            let result3 = await dbpool.query(query3, ['91' + mobileno]);
            console.log(result3[0][0].kno_no);
            kno = result3[0][0].kno_no;

        }

        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/kotawebserviceMC/getCnspmobapp_live.jsp?kno=" + kno,
        //     headers: {},
        //     data: data
        // };

        let url = "https://cescrajasthan.co.in/kotawebserviceMC/getCnspmobapp_live.jsp?kno=" + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        data = result.data.CNSPDET;

        console.log(data);

        let message = "👇 कृपया पिछले 6 महीनों का उपयोग इतिहास नीचे देखें:\n\n";

        let unit = null;
        let date = null;
        let grossAmt = null;
        let netAmt = null;

        let unitResult = null;
        let dateResult = null;
        let grossAmtResult = null;
        let netAmtResult = null;

        for (let i = 1; i <= 6; i++) {
            unit = "unit" + i;
            date = "bccd" + i;
            grossAmt = "grsamt" + i;
            netAmt = "netamt" + i;

            unitResult = data[unit];
            dateResult = data[date];
            grossAmtResult = data[grossAmt];
            netAmtResult = data[netAmt];

            // console.log(unit, date, grossAmt, netAmt);
            message += "*उपभोग यूनिट*: " + unitResult + "\n" + "*महीना*: " + dateResult + "\n" + "*देय राशि (रु)*: " + grossAmtResult + "\n" + "*LPS के साथ(रु)*: " + netAmtResult + "\n\n";


            // message += "*उपभोग यूनिट*: " + unitResult + "\n" + "*महीना*: " + dateResult + "\n" + "*देय राशि (रु)*: " + grossAmtResult + "\n" + "*शुद्ध राशि*: " + netAmtResult + "\n\n";
        }

        console.log(message);

        return res.send({
            code: 200,
            status: "SUCCESS",
            type: "text",
            data: message
        });

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "कुछ गलत हो गया"
        });
    }
});

// power complaint middlewares

// check bulletin

router.post('/checkbulletin/:wanumber', async (req, res) => {

    try {
        let wanumber = req.params.wanumber;
        let data = null;
        let kno = null;


        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }

        console.log({ wanumber });

        let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + wanumber]);

        if (result2[0][0].mobileno == null) {

            let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            let result1 = await dbpool.query(query1, ['91' + wanumber]);
            console.log({ result1 });
            console.log(result1[0][0].kno_no);
            kno = result1[0][0].kno_no;
        }
        else {
            // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
            // console.log({ result1 });
            // console.log(result1[0][0].kno_no);
            // kno = result1[0][0].kno_no;
            // mobileno = formattedNumber;

            console.log(result2[0][0]);

            let mobileno = result2[0][0].mobileno;
            console.log({ mobileno });

            // let formattedMobileno = mobileno.replace(/^\+/, '');
            // formattedMobileno = formattedMobileno.replace(/^91/, '');

            if (mobileno.length == 12) {
                mobileno = mobileno.substring(2, 12);
                console.log({ mobileno });
            }

            let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
            let result3 = await dbpool.query(query3, ['91' + mobileno]);
            console.log(result3[0][0].kno_no);
            kno = result3[0][0].kno_no;

        }


        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/cescraj/pages/event/lib/jsonChkBulletin.php?kno=" + kno,
        //     headers: {},
        //     data: data
        // };

        let url = "https://cescrajasthan.co.in/cescraj/pages/event/lib/jsonChkBulletin.php?kno=" + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }
        let result = await axios(config);
        console.log(result.data[0]);

        // if (result.data[0] === undefined) {
        //     return res.send({
        //         code: 100,
        //         status: "FAILED",
        //         type: "text",
        //         data: "No details found"
        //     });
        // }
        // else 
        if (result.data.end_time != undefined) {
            data = result.data;
            endtime = data.end_time;
            message = " Our team is working to restore your supply & expected to be resolved by *" + endtime + "*";

            return res.send({
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: message
            });
        } else {
            return res.send({
                code: 100,
                status: "FAILED",
                type: "text",
                data: "No details found"
            });
        }

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong"
        });
    }
});

// check bulletin hindi

router.post('/checkbulletin/hindi/:wanumber', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        let data = null;
        let kno = null;


        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }

        console.log({ wanumber });

        let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + wanumber]);

        console.log("result2----------", result2[0]);



        if (result2[0][0].mobileno == null) {

            let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            let result1 = await dbpool.query(query1, ['91' + wanumber]);
            console.log({ result1 });
            console.log(result1[0][0].kno_no);
            kno = result1[0][0].kno_no;
        }
        else {

            let mobileno = result2[0][0].mobileno;

            // let formattedMobileno = mobileno.replace(/^\+/, '');
            // formattedMobileno = formattedMobileno.replace(/^91/, '');
            if (mobileno.length == 12) {
                mobileno = mobileno.substring(2, 12);
            }

            let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
            let result3 = await dbpool.query(query3, ['91' + mobileno]);
            console.log(result3[0][0].kno_no);
            kno = result3[0][0].kno_no;
        }
        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/cescraj/pages/event/lib/jsonChkBulletin.php?kno=" + kno,
        //     headers: {},
        //     data: data
        // };

        let url = "https://cescrajasthan.co.in/cescraj/pages/event/lib/jsonChkBulletin.php?kno=" + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        console.log("axios result-----------------", result);

        // if (result.data[0] === undefined) {
        //     return res.send({
        //         code: 100,
        //         status: "FAILED",
        //         type: "text",
        //         data: "कोई विवरण नहीं मिला"
        //     });
        // }
        if (result.data.end_time != undefined) {
            data = result.data;
            endtime = data.end_time;
            message = " आपको हुई असुविधा के लिए खेद है। हमारी टीम आपकी बिजली बहाल करने के लिए काम कर रही है और उम्मीद है कि *" + endtime + "* तक समस्या का समाधान हो जाएगा। ";

            return res.send({
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: message
            });
        } else {
            {
                return res.send({
                    code: 100,
                    status: "FAILED",
                    type: "text",
                    data: "कोई विवरण नहीं मिला"
                });
            }
        }

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "कुछ गलत हो गया"
        });
    }

    // try {
    //     let wanumber = req.params.wanumber;
    //     let data = null;
    //     let kno = null;


    //     // let formattedNumber = wanumber.replace(/^\+/, '');
    //     // formattedNumber = formattedNumber.replace(/^91/, '');
    //     if (wanumber.length == 12) {
    //         wanumber = wanumber.substring(2, 12);
    //         console.log({ wanumber });
    //     }

    //     console.log({ wanumber });

    //     let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
    //     let result2 = await dbpool.query(query2, ['91' + wanumber]);

    //     if (result2[0][0].mobileno == null) {

    //         let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
    //         let result1 = await dbpool.query(query1, ['91' + wanumber]);
    //         console.log({ result1 });
    //         console.log(result1[0][0].kno_no);
    //         kno = result1[0][0].kno_no;
    //     }
    //     else {
    //         // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
    //         // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
    //         // console.log({ result1 });
    //         // console.log(result1[0][0].kno_no);
    //         // kno = result1[0][0].kno_no;
    //         // mobileno = formattedNumber;

    //         console.log(result2[0][0]);

    //         let mobileno = result2[0][0].mobileno;
    //         console.log({ mobileno });

    //         // let formattedMobileno = mobileno.replace(/^\+/, '');
    //         // formattedMobileno = formattedMobileno.replace(/^91/, '');
    //         if (mobileno.length == 12) {
    //             mobileno = mobileno.substring(2, 12);
    //             console.log({ mobileno });
    //         }

    //         let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
    //         let result3 = await dbpool.query(query3, ['91' + mobileno]);
    //         console.log(result3[0][0].kno_no);
    //         kno = result3[0][0].kno_no;

    //     }


    //     let config = {
    //         method: "post",
    //         url: "https://cescrajasthan.co.in/cescraj/pages/event/lib/jsonChkBulletin.php?kno=" + kno,
    //         headers: {},
    //         data: data
    //     };

    //     let result = await axios(config);
    //     console.log(result.data[0]);

    //     if (result.data[0] === undefined) {
    //         return res.send({
    //             code: 100,
    //             status: "FAILED",
    //             type: "text",
    //             data: "कोई विवरण नहीं मिला"
    //         });
    //     }
    //     else {
    //         data = result.data;
    //         endtime = data.end_time;
    //         message = "हमारी टीम आपकी आपूर्ति बहाल करने के लिए काम कर रही है और उम्मीद है कि " + endtime + " तक समस्या का समाधान हो जाएगा";

    //         return res.send({
    //             code: 200,
    //             status: "SUCCESS",
    //             type: "text",
    //             data: message
    //         });
    //     }

    // } catch (err) {
    //     console.log(err);

    //     return res.send({
    //         code: 100,
    //         status: "FAILED",
    //         type: "text",
    //         data: "कुछ गलत हो गया"
    //     });
    // }

});

// generate docket

router.post('/checkdocket/:complainttype/:wanumber', async (req, res) => {

    try {

        // let kno = req.params.kno;
        let wanumber = req.params.wanumber;
        let complainttype = req.params.complainttype;
        let data = null;
        let kno = null;
        let comp_src = null;


        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }


        console.log({ wanumber });

        let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + wanumber]);
        console.log('RESULT 2 :' + JSON.stringify(result2));

        if (result2[0][0].mobileno == null) {

            let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            let result1 = await dbpool.query(query1, ['91' + wanumber]);
            console.log({ result1 });
            console.log(result1[0][0].kno_no);
            kno = result1[0][0].kno_no;
        }
        else {
            // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
            // console.log({ result1 });
            // console.log(result1[0][0].kno_no);
            // kno = result1[0][0].kno_no;
            // mobileno = formattedNumber;

            console.log(result2[0][0]);

            let mobileno = result2[0][0].mobileno;
            console.log({ mobileno });

            // let formattedMobileno = mobileno.replace(/^\+/, '');
            // formattedMobileno = formattedMobileno.replace(/^91/, '');
            if (mobileno.length == 12) {
                mobileno = mobileno.substring(2, 12);
                console.log({ mobileno });
            }


            let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
            let result3 = await dbpool.query(query3, ['91' + mobileno]);
            console.log(result3[0][0].kno_no);
            kno = result3[0][0].kno_no;

        }

        // let data = null;
        let isComplaintExist = null;
        let complaintNo = null;
        let message = null;

        // console.log({ kno, complainttype, mobileno });

        let complaint_No = null;

        if (complainttype === "No Power") {
            complaint_No = 1;
        }
        else if (complainttype === "Voltage Problem") {
            complaint_No = 3;
        }
        // else if (complainttype === "3") {
        //     complaint_No = 12;
        // }
        // else if (complainttype === "4") {
        //     complaint_No = 13;
        // }


        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/mobapi/generateDocketNo.php",
        //     headers: {},
        //     data: {
        //         kno: kno,
        //         complaint_type: complaint_No,
        //         mobileno: wanumber,
        //         comp_src: "Whatsapp"
        //     }
        // };


        let url = "https://cescrajasthan.co.in/mobapi/generateDocketNo.php"
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: {
                kno: kno,
                complaint_type: complaint_No,
                mobileno: wanumber,
                comp_src: "Whatsapp"
            }
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        console.log(result.data);
        data = result.data;

        isComplaintExist = data.isexists;
        console.log({ isComplaintExist });

        complaintNo = data.docket;
        console.log({ complaintNo });

        if (isComplaintExist === 'y') {
            message = "Regret for the inconvenience caused Your Complaint is already registered with us\n\n" + "Complaint no: " + complaintNo + "\n\n";
            console.log(message);
        }
        else if (isComplaintExist === 'n') {
            message = "Your Complaint is registered successfully\n\n" + "Complaint no: " + complaintNo + "\n\n";
            console.log(message);
        }

        return res.send({
            code: 200,
            status: "SUCCESS",
            type: "text",
            data: message
        });

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong"
        });
    }

});

// generate docket hindi

router.post('/checkdocket/hindi/:complainttype/:wanumber', async (req, res) => {

    try {

        // let kno = req.params.kno;
        let wanumber = req.params.wanumber;
        let complainttype = req.params.complainttype;
        let data = null;
        let kno = null;
        let comp_src = null;


        // let formattedNumber = wanumber.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }

        console.log({ wanumber });

        let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + wanumber]);
        console.log('RESULT 2 :' + JSON.stringify(result2));

        if (result2[0][0] != undefined && result2[0][0].mobileno == null) {

            let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            let result1 = await dbpool.query(query1, ['91' + wanumber]);
            console.log({ result1 });
            console.log(result1[0][0].kno_no);
            kno = result1[0][0].kno_no;
        }
        else {
            // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            // let result1 = await dbpool.query(query1, ['91' + wanumber]);
            // console.log({ result1 });
            // console.log(result1[0][0].kno_no);
            // kno = result1[0][0].kno_no;
            // mobileno = wanumber;

            console.log(result2[0][0]);

            let mobileno = result2[0][0].mobileno;
            console.log({ mobileno });

            // let formattedMobileno = mobileno.replace(/^\+/, '');
            // formattedMobileno = formattedMobileno.replace(/^91/, '');
            if (mobileno.length == 12) {
                mobileno = mobileno.substring(2, 12);
                console.log({ mobileno });
            }

            let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
            let result3 = await dbpool.query(query3, ['91' + mobileno]);
            console.log(result3[0][0].kno_no);
            kno = result3[0][0].kno_no;

        }

        // let data = null;
        let isComplaintExist = null;
        let complaintNo = null;
        let message = null;

        // console.log({ kno, complainttype, mobileno });

        let complaint_No = null;

        if (complainttype === "No Power") {
            complaint_No = 1;
        }
        else if (complainttype === "Voltage Problem") {
            complaint_No = 3;
        }
        // else if (complainttype === "3") {
        //     complaint_No = 12;
        // }
        // else if (complainttype === "4") {
        //     complaint_No = 13;
        // }


        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/mobapi/generateDocketNo.php",
        //     headers: {},
        //     data: {
        //         kno: kno,
        //         complaint_type: complaint_No,
        //         mobileno: wanumber,
        //         comp_src: "Whatsapp"
        //     }
        // };

        let url = "https://cescrajasthan.co.in/mobapi/generateDocketNo.php"
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: {
                kno: kno,
                complaint_type: complaint_No,
                mobileno: wanumber,
                comp_src: "Whatsapp"
            }
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        console.log(result.data);
        data = result.data;

        isComplaintExist = data.isexists;
        console.log({ isComplaintExist });

        complaintNo = data.docket;
        console.log({ complaintNo });

        if (isComplaintExist === 'y') {
            message = "आपको हुई असुविधा के लिए खेद है, आपकी शिकायत हमारे पास पहले से ही दर्ज है\n\n" + "शिकायत संख्या: " + complaintNo + "\n\n";
            console.log(message);
        }
        else if (isComplaintExist === 'n') {
            message = "आपकी शिकायत सफलतापूर्वक पंजीकृत किया गया है\n\n" + "शिकायत संख्या: " + complaintNo + "\n\n";
            console.log(message);
        }

        return res.send({
            code: 200,
            status: "SUCCESS",
            type: "text",
            data: message
        });

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "कुछ गलत हो गया"
        });
    }

});

// check mobno present or not

router.post('/checkmobnopresent/:kno', async (req, res) => {
    try {
        let kno = req.params.kno;
        let data = null;
        let result = null;
        let mobileno = null;

        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
        //     headers: {},
        //     data: data
        // };

        let url = "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }


        let response = await axios(config);
        console.log(response.data.KNOPROFILEDET);

        result = response.data.KNOPROFILEDET;
        console.log({ result });

        mobileno = result.mobno;
        console.log({ mobileno });

        if (result === 'NODATA') {
            return res.send({
                code: 400,
                status: "SUCCESS",
                type: "text",
                data: "No data found"
            });
        }
        else {
            console.log("===============>", isNaN(mobileno));
            if (!isNaN(mobileno)) {
                return res.send({
                    code: 200,
                    status: "SUCCESS",
                    type: "text",
                    data: "mobile number is present"
                });
            }
            else {
                return res.send({
                    code: 300,
                    status: "SUCCESS",
                    type: "text",
                    data: "mobile number is not present"
                });
            }
        }

    } catch (err) {
        console.log(err);
        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong"
        });
    }
});

// match mobile number

router.post('/comparemobno/:mobno/:kno', async (req, res) => {
    try {
        let mobno = req.params.mobno;
        let kno = req.params.kno;
        let data = null;
        let result = null;

        let formattedNumber = null;

        // let formattedNumber = mobno.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');

        if (mobno.length == 12) {
            mobno = mobno.substring(2, 12);
            console.log({ mobno });
        }

        console.log({ mobno });

        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
        //     headers: {},
        //     data: data
        // };

        let url = "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let response = await axios(config);
        console.log(response.data.KNOPROFILEDET);

        result = response.data.KNOPROFILEDET;
        mobilenoResult = result.mobno;

        console.log({ mobno, mobilenoResult });

        if (mobno === mobilenoResult) {
            return res.send({
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: "mobile number matched"
            });
        }
        else if (mobno !== result.mobileno) {
            return res.send({
                code: 300,
                status: "SUCCESS",
                type: "text",
                data: "mobile number not matched"
            });
        }

    } catch (err) {
        console.log(err);
        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong"
        });
    }
});

// Change mobile number 
router.post('/changemobileno/:kno/:wanumber', async (req, res) => {

    try {
        let kno = req.params.kno;
        let mobno = req.params.wanumber;
        // let rmobno = req.params.rmobno;
        let cli = null;
        let data = null;
        // let url = "https://cescrajasthan.co.in/ivrAPI/sendPhForReg.php?kno=" + kno + "&mob_no=" + mobno + "&cli=" + mobno;

        if (mobno.length == 12) {
            mobno = mobno.substring(2, 12);
            console.log({ mobno });
        }

        // let formattedNumber = rmobno.replace(/^\+/, '');
        // formattedNumber = formattedNumber.replace(/^91/, '');

        // console.log({ formattedNumber });

        console.log({ kno, mobno });

        // let config1 = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
        //     headers: {},
        //     data: data
        // };

        // let configResult = await axios(config1);
        // console.log(configResult.data.KNOPROFILEDET.mobno);

        // cli = configResult.data.KNOPROFILEDET.mobno;
        // console.log({ cli });

        // if (cli === formattedNumber) {


        // let config = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/ivrAPI/sendPhForReg.php?kno=" + kno + "&mob_no=" + mobno + "&cli=" + mobno,
        //     headers: {},
        //     data: data
        // };

        let url = "https://cescrajasthan.co.in/ivrAPI/sendPhForReg.php?kno=" + kno + "&mob_no=" + mobno + "&cli=" + mobno
        let config = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let result = await axios(config);
        console.log(result.data);

        let query1 = "update kno_list_tbl set wanumber = ? where kno_no = ?";
        let result1 = await dbpool.query(query1, ['91' + mobno, kno]);
        console.log({ result1 });

        if (result.data.status === 'success') {
            return res.send({
                code: 200,
                status: "SUCCESS",
                type: "text",
                data: "Mobile number registered successfully"
            });
        } else {
            return res.send({
                code: 100,
                status: "FAILED",
                type: "text",
                data: "Something went wrong"
            });
        }
        // }
        // else {
        //     return res.send({
        //         code: 300,
        //         status: "FAILED",
        //         type: "text",
        //         data: "Mobile number does not matched with registered mobile number. please try again"
        //     });
        // }

    } catch (err) {
        console.log(err);

        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong"
        });
    }
});

// change mobno in main menu
router.post('/changemob/:wanumber/:newmobno', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        let newmobno = req.params.newmobno;
        let data = null;
        let kno = null;

        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }

        console.log({ wanumber });

        let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
        let result2 = await dbpool.query(query2, ['91' + wanumber]);
        console.log({ result2 });
        console.log("=========================================");
        console.log(result2[0][0].mobileno);

        if (result2[0][0].mobileno == null) {

            let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
            let result1 = await dbpool.query(query1, ['91' + wanumber]);
            console.log({ result1 });
            console.log(result1[0][0].kno_no);
            kno = result1[0][0].kno_no;
        }
        else {

            console.log(result2[0][0]);

            let mobileno = result2[0][0].mobileno;
            console.log({ mobileno });

            if (mobileno.length == 12) {
                mobileno = mobileno.substring(2, 12);
                console.log({ mobileno });
            }

            let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
            let result3 = await dbpool.query(query3, ['91' + mobileno]);
            console.log(result3[0][0].kno_no);
            kno = result3[0][0].kno_no;

        }

        // let config1 = {
        //     method: "post",
        //     url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
        //     headers: {},
        //     data: data
        // };

        let url = "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno
        let config1 = {
            method: "post",
            url: url,
            headers: {},
            data: data
        };
        let protocol = httpUrl.parse(url).protocol;
        if (protocol != null && protocol == "https:") {
            config1.httpsAgent = new https.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        } else {
            config1.httpAgent = new http.Agent({
                keepAlive: false,
                rejectUnauthorized: false
            }); //secureProtocol: 'TLSv1_method'
        }

        let mobno = null;
        let result = await axios(config1);
        console.log(result.data);
        data = result.data.KNOPROFILEDET;
        mobno = data.mobno;

        let PHONE_REGEXP = /^[6789]\d{9}$/;

        if (PHONE_REGEXP.test(newmobno) == true) {
            // let config2 = {
            //     method: "post",
            //     url: "https://cescrajasthan.co.in/ivrAPI/sendPhForReg.php?kno=" + kno + "&mob_no=" + newmobno + "&cli=" + mobno,
            //     headers: {},
            //     data: data
            // };

            let url = "https://cescrajasthan.co.in/ivrAPI/sendPhForReg.php?kno=" + kno + "&mob_no=" + newmobno + "&cli=" + mobno
            let config2 = {
                method: "post",
                url: url,
                headers: {},
                data: data
            };
            let protocol = httpUrl.parse(url).protocol;
            if (protocol != null && protocol == "https:") {
                config2.httpsAgent = new https.Agent({
                    keepAlive: false,
                    rejectUnauthorized: false
                }); //secureProtocol: 'TLSv1_method'
            } else {
                config2.httpAgent = new http.Agent({
                    keepAlive: false,
                    rejectUnauthorized: false
                }); //secureProtocol: 'TLSv1_method'
            }

            let result_1 = await axios(config2);
            console.log(result_1.data);

            if (result_1.data.status === 'success') {

                let query1 = "update kno_list_tbl set wanumber = ? where kno_no = ?";
                let result1 = await dbpool.query(query1, ['91' + newmobno, kno]);
                console.log({ result1 });

                return res.send({
                    code: 200,
                    status: "SUCCESS",
                    type: "text",
                    data: "Mobile number registered successfully"
                });
            } else {
                return res.send({
                    code: 100,
                    status: "FAILED",
                    type: "text",
                    data: "Something went wrong"
                });
            }

        } else {
            return res.send({
                code: 300,
                status: "FAILED",
                type: "text",
                data: "Invalid mobile number"
            });
        }


    } catch (err) {
        console.log(err);
        return res.send({
            code: 100,
            status: "FAILED",
            type: "text",
            data: "Something went wrong"
        });
    }
});



// // check mobile number is registered or not

// router.post('/checkmobileno/:mobno', async (req, res) => {
//     try {

//         let mobno = req.params.mobno;
//         let data = null;
//         let status = null;
//         let code = null;

//         let config = {
//             method: "post",
//             url: "https://cescrajasthan.co.in/ivrAPI/isPhoneRegistered.php?cli=" + mobno,
//             headers: {},
//             data: data
//         };

//         let result = await axios(config);
//         console.log(result.data);

//         data = result.data;
//         console.log({ data });

//         status = data.STATUS;
//         console.log({ status });

//         if (status === 'R') {
//             code = 200;
//         }
//         else if (status === 'MR') {
//             code = 300;
//         }
//         else if (status === 'NR') {
//             code = 400;
//         }

//         return res.send({
//             code: code,
//             status: "SUCCESS",
//             type: "text",
//             data: status
//         });

//     } catch (err) {
//         console.log(err);

//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong, Please try again"
//         });
//     }
// });

// // KNO List single

// router.post('/knolist/:mobno', async (req, res) => {

//     try {
//         let mobno = req.params.mobno;
//         let data = null;
//         let message = null;
//         let kno = null;
//         let name = null;
//         let address = null;
//         let meterno = null;
//         // let tempArr = [];

//         console.log({ mobno });

//         let formattedNumber = mobno.replace(/^\+/, '');
//         formattedNumber = formattedNumber.replace(/^91/, '');

//         console.log({ formattedNumber });

//         let config = {
//             method: "post",
//             url: "https://cescrajasthan.co.in/kotawebserviceMC/getknolistmobapp.jsp?mobno=" + formattedNumber,
//             headers: {},
//             data: data
//         };

//         let result = await axios(config);
//         console.log(result.data);

//         data = result.data.KNOLIST;
//         console.log({ data });

//         kno = data[0].kno;
//         name = data[0].name;
//         address = data[0].addr;
//         meterno = data[0].meterno;
//         regmobno = data[0].regmobno;

//         // tempArr.push(kno);

//         let query2 = "SELECT COUNT(1) as C from kno_list_tbl where wanumber = ?";
//         let result2 = await dbpool.query(query2, ['91' + formattedNumber]);
//         console.log(result2[0][0].C);

//         let count = result2[0][0].C;
//         console.log({ count });

//         if (count === 0) {
//             let query1 = "REPLACE INTO kno_list_tbl (wanumber, kno_no) VALUES (?,?)";
//             let values1 = ["91" + formattedNumber, kno];
//             let result1 = await dbpool.query(query1, values1);
//         }
//         else if (count === 1) {
//             let query3 = "Update kno_list_tbl set kno_no = ?, mobileno = ? where wanumber = ?";
//             let result3 = await dbpool.query(query3, [kno, '91' + regmobno, '91' + formattedNumber]);
//             console.log(result3);
//         }

//         message = "KNO: " + kno + "\n" + "Name: " + name + "\n" + "Address: " + address + "\n" + "Meter No: " + meterno;

//         console.log(message);

//         if (data === 'NODATA') {
//             return res.send({
//                 code: 300,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: "Please enter valid mobile number"
//             });
//         }
//         else {
//             return res.send({
//                 code: 200,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: message
//             });
//         }

//     } catch (err) {
//         console.log(err);

//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong"
//         });
//     }
// });

// // KNO List Single for not registered

// router.post('/knolist/nr/:mobno/:wanumber', async (req, res) => {

//     try {
//         let mobno = req.params.mobno;
//         let wanumber = req.params.wanumber;
//         let data = null;
//         let message = null;
//         let kno = null;
//         let name = null;
//         let address = null;
//         let meterno = null;
//         // let tempArr = [];

//         console.log({ mobno });

//         let formattedNumber = mobno.replace(/^\+/, '');
//         formattedNumber = formattedNumber.replace(/^91/, '');

//         let formattedWanumber = wanumber.replace(/^\+/, '');
//         formattedWanumber = formattedWanumber.replace(/^91/, '');

//         console.log({ formattedNumber, formattedWanumber });

//         let config = {
//             method: "post",
//             url: "https://cescrajasthan.co.in/kotawebserviceMC/getknolistmobapp.jsp?mobno=" + formattedNumber,
//             headers: {},
//             data: data
//         };

//         let result = await axios(config);
//         console.log(result.data);

//         data = result.data.KNOLIST;
//         console.log({ data });

//         kno = data[0].kno;
//         name = data[0].name;
//         address = data[0].addr;
//         meterno = data[0].meterno;

//         // tempArr.push(kno);

//         let query2 = "SELECT COUNT(1) as C from kno_list_tbl where wanumber = ?";
//         let result2 = await dbpool.query(query2, ['91' + formattedWanumber]);
//         console.log(result2[0][0].C);
//         let count = result2[0][0].C;
//         console.log({ count });

//         if (count === 0) {
//             let query1 = "REPLACE INTO kno_list_tbl (wanumber, kno_no, mobileno) VALUES (?,?,?)";
//             let values1 = ['91' + formattedWanumber, kno, '91' + formattedNumber];
//             let result1 = await dbpool.query(query1, values1);
//         }

//         message = "KNO: " + kno + "\n" + "Name: " + name + "\n" + "Address: " + address + "\n" + "Meter No: " + meterno;

//         console.log(message);

//         if (data === 'NODATA') {
//             return res.send({
//                 code: 300,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: "Please enter valid mobile number"
//             });
//         }
//         else {
//             return res.send({
//                 code: 200,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: message
//             });
//         }

//     } catch (err) {
//         console.log(err);

//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong"
//         });
//     }
// });

// // Register mobile number

// router.post('/registermobno/:kno', async (req, res) => {

//     try {
//         let kno = req.params.kno;
//         let wanumber = req.params.wanumber;
//         console.log({ wanumber });
//         let data = null;
//         let name = null;
//         let address = null;
//         let meterno = null;
//         let mobileno = null;

//         let config = {
//             method: "post",
//             url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
//             headers: {},
//             data: data
//         };

//         let result = await axios(config);
//         console.log(result.data);
//         data = result.data.KNOPROFILEDET;
//         kno = data.lkno;
//         name = data.name;
//         address = data.address;
//         meterno = data.mno;
//         mobno = data.mobno;

//         let query2 = "SELECT COUNT(1) as C from kno_list_tbl where wanumber = ?";
//         let result2 = await dbpool.query(query2, [wanumber]);
//         console.log(result2[0][0].C);
//         let count = result2[0][0].C;
//         console.log({ count });

//         if (count === 0) {
//             let query1 = "REPLACE INTO kno_list_tbl (wanumber, kno_no, mobileno) VALUES (?,?,?)";
//             let result1 = await dbpool.query(query1, [wanumber, kno, '91' + mobno]);
//             console.log(result1);
//         }
//         else {
//             let query3 = "update kno_list_tbl set kno_no = ?, mobileno = ? where wanumber = ?";
//             let result3 = await dbpool.query(query3, [kno, '91' + mobno, wanumber]);
//             console.log(result3);
//         }

//         if (data === 'NODATA') {
//             message = "Please enter valid KNO";
//             return res.send({
//                 code: 300,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: message
//             });
//         }
//         else {
//             message = "KNO: " + kno + "\n" + "Name: " + name + "\n" + "Address: " + address + "\n" + "Meter No: " + meterno + "\n\n";
//             return res.send({
//                 code: 200,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: message
//             });
//         }

//     } catch (err) {
//         console.log(err);

//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong"
//         });
//     }
// });

// // Change registered mob. no

// router.post('/changemobileno/:kno/:mobno', async (req, res) => {

//     try {
//         let kno = req.params.kno;
//         let mobno = req.params.mobno;
//         let data = null;
//         // let url = "https://cescrajasthan.co.in/ivrAPI/sendPhForReg.php?kno=" + kno + "&mob_no=" + mobno + "&cli=" + mobno;

//         if (mobno.length == 12) {
//             mobno = mobno.substring(2, 12);
//             console.log({ mobno });
//         }

//         console.log({ kno, mobno });


//         let config = {
//             method: "post",
//             url: "https://cescrajasthan.co.in/ivrAPI/sendPhForReg.php?kno=" + kno + "&mob_no=" + mobno + "&cli=" + mobno,
//             headers: {},
//             data: data
//         };

//         let result = await axios(config);
//         console.log(result.data);

//         let query1 = "update kno_list_tbl set wanumber = ? where kno_no = ?";
//         let result1 = await dbpool.query(query1, ['91' + mobno, kno]);
//         console.log({ result1 });

//         if (result.data.status === 'success') {
//             return res.send({
//                 code: 200,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: "Mobile number registered successfully"
//             });
//         }

//     } catch (err) {
//         console.log(err);

//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong"
//         });
//     }
// });

// // Payment Midddlewares

// router.post('/payment/:wanumber', async (req, res) => {
//     try {
//         let wanumber = req.params.wanumber;
//         let kno = null;
//         let kdel = "2107";
//         let besl = "2102";
//         let bkesl = "3101";
//         let url = null;

//         let formattedNumber = wanumber.replace(/^\+/, '');
//         formattedNumber = formattedNumber.replace(/^91/, '');

//         console.log({ formattedNumber });

//         let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
//         let result2 = await dbpool.query(query2, ['91' + formattedNumber]);

//         if (result2[0][0].mobileno == null) {

//             let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
//             let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
//             console.log({ result1 });
//             console.log(result1[0][0].kno_no);
//             kno = result1[0][0].kno_no;
//         }
//         else {
//             // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
//             // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
//             // console.log({ result1 });
//             // console.log(result1[0][0].kno_no);
//             // kno = result1[0][0].kno_no;
//             // mobileno = formattedNumber;

//             console.log(result2[0][0]);

//             let mobileno = result2[0][0].mobileno;
//             console.log({ mobileno });

//             let formattedMobileno = mobileno.replace(/^\+/, '');
//             formattedMobileno = formattedMobileno.replace(/^91/, '');

//             let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
//             let result3 = await dbpool.query(query3, ['91' + formattedMobileno]);
//             console.log(result3[0][0].kno_no);
//             kno = result3[0][0].kno_no;

//         }

//         if (kno.toString().includes(kdel)) {
//             // console.log("Kno belongs to kedl");
//             url = "https://services.cesc.co.in/jascnaesr/kedl/bdreq.php?kno=" + kno;
//         }
//         else if (kno.toString().includes(besl)) {
//             // console.log("Kno belongs to besl");
//             url = "https://services.cesc.co.in/jascnaesr/besl/bdreq.php?kno=" + kno;
//         }
//         else if (kno.toString().includes(bkesl)) {
//             // console.log("Kno belongs to bkesl");
//             url = "https://services.cesc.co.in/jascnaesr/bkesl/bdreq.php?kno=" + kno;
//         }

//         let message = "Please click the below link for payment" + "\n\n" + url;

//         console.log(message);

//         return res.send({
//             code: 200,
//             status: "SUCCESS",
//             type: "text",
//             data: message
//         });

//     } catch (err) {
//         console.log(err);
//         return res.send({
//             code: 100,
//             status: "FAILED",
//             data: "Something went wrong"
//         });
//     }
// });

// // Outage Information middleware

// router.post('/outageinfo/:wanumber', async (req, res) => {
//     try {
//         let url = null;
//         let wanumber = req.params.wanumber;
//         let kno = null;
//         let message = null;
//         let result = null;

//         let kdel = "2107";
//         let besl = "2102";
//         let bkesl = "3101";

//         let formattedNumber = wanumber.replace(/^\+/, '');
//         formattedNumber = formattedNumber.replace(/^91/, '');

//         let query1 = "Select kno_no from kno_list_tbl where wanumber = ?";
//         let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
//         console.log(result1[0][0]);
//         result = result1[0][0];
//         kno = result1[0][0].kno_no;

//         console.log({ kno });

//         if (kno.toString().includes(kdel)) {
//             url = "https://cescrajasthan.co.in/cescraj/pages/event/lib/jsonBulletinDetail.php?div=2107&frmt=htm";
//         }
//         else if (kno.toString().includes(besl)) {
//             url = "https://cescrajasthan.co.in/cescraj/pages/event/lib/jsonBulletinDetail.php?div=2102&frmt=htm";
//         }
//         else if (kno.toString().includes(bkesl)) {
//             url = "https://cescrajasthan.co.in/cescraj/pages/event/lib/jsonBulletinDetail.php?div=3101&frmt=htm";
//         }

//         message = "Please click below url to check outage information: \n\n" + "URL: " + url;
//         console.log(message);

//         return res.send({
//             code: 200,
//             status: "SUCCESS",
//             type: "text",
//             data: message
//         });


//     } catch (err) {
//         console.log(err);
//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Data not found"
//         });
//     }
// });

// // Multiple KNO List 

// router.post('/knolistmultiple/:mobileno', async (req, res) => {

//     try {

//         let mobileno = req.params.mobileno;

//         let formattedNumber = mobileno.replace(/^\+/, '');
//         formattedNumber = formattedNumber.replace(/^91/, '');

//         // console.log({ formattedNumber });

//         let data = null;
//         let message = "You have multiple KNO registered:\n\n";
//         let kno = null;
//         let name = null;
//         let address = null;
//         let meterno = null;
//         let counter = 0;

//         let listWebhookPayload = {};

//         let config = {
//             method: 'post',
//             url: 'https://cescrajasthan.co.in/kotawebserviceMC/getknolistmobapp.jsp?mobno=' + formattedNumber,
//             headers: {},
//             data: data
//         };

//         let result = await axios(config);
//         console.log(result.data);
//         data = result.data.KNOLIST;
//         // console.log(data);
//         // listWebhookPayload = {
//         //     "header_text": "You have multiple kno registered",
//         //     "body_text": "Please select from below list",
//         //     // "footer_text": "test_url",
//         //     "button_text": "Menu text",
//         //     "rows": "5",
//         //     "section_count": "1",
//         //     "sections": {

//         //     }
//         // };

//         // // console.log({ listWebhookPayload });
//         // listWebhookPayload.sections = {};
//         // const sectionIndex = 1; // Index of the section to add rows to

//         // listWebhookPayload.sections[sectionIndex] = {
//         //     "section_text": "Select from list " + sectionIndex,
//         //     "rows": {}
//         // };
//         for (let i = 0; i <= 4; i++) {
//             // counter++;
//             // console.log(counter, i);
//             kno = data[i].kno;
//             name = data[i].name;
//             // address = data[i].addr;
//             // meterno = data[i].meterno;

//             console.log({ kno, name });

//             // message += (i + 1) + ")" + " " + kno + "\n\n";
//             message += (i + 1) + ")" + " KNO: " + kno + "\n" + "     Name: " + name + "\n\n";


//             // listWebhookPayload.sections[sectionIndex].rows[i] = {
//             //     "row_text": data[i].kno,
//             //     "description_text": data[i].name,
//             // };
//             // listWebhookPayload.sections = {
//             //     "1": {
//             //         "section_text": "Select from list 1",
//             //         "rows": {
//             //             [i]: {
//             //                 "row_text": data[i].kno,
//             //                 "description_text": data[i].name,
//             //             }
//             //         }
//             //     }
//             // };
//         }



//         console.log(JSON.stringify(listWebhookPayload));


//         console.log(message);

//         // let message1 = "Please Enter your KNO from the above list";

//         let finalMessage = message;

//         console.log(finalMessage);

//         return res.send({
//             code: 200,
//             status: "SUCCESS",
//             type: "list",
//             data: finalMessage
//         });

//     } catch (err) {
//         console.log(err);
//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong"
//         });
//     }
// });

// // show details from multiple kno registered

// router.post('/selectedknodetails/:kno/:mobileno', async (req, res) => {

//     try {
//         let kno = req.params.kno;
//         let mobileno = req.params.mobileno;
//         let data = null;

//         let knoResult = null;
//         let name = null;
//         let address = null;
//         let meterNo = null;
//         let message = '';


//         let config = {
//             method: "post",
//             url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
//             headers: {},
//             data: data
//         };

//         let result = await axios(config);
//         console.log(result.data.KNOPROFILEDET);
//         data = result.data.KNOPROFILEDET;

//         if (data == 'NODATA') {
//             return res.send({
//                 code: 300,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: "Invalid KNO"
//             });
//         }

//         knoResult = data.lkno;
//         name = data.name;
//         address = data.address;
//         meterNo = data.mno;

//         message += "KNO: " + kno + "\n" + "Name: " + name + "\n" + "Address: " + address + "\n" + "Meter No: " + meterNo;

//         console.log(message);

//         let query2 = "select count(1) as C from kno_list_tbl where wanumber = ?";
//         let result2 = await dbpool.query(query2, ['91' + mobileno]);
//         console.log(result2[0][0]);

//         let count = result2[0][0].C;
//         console.log({ count });

//         if (count === 0) {
//             let query1 = "REPLACE INTO kno_list_tbl (wanumber, kno_no) VALUES (?,?)";
//             let queryResult = await dbpool.query(query1, ['91' + mobileno, kno]);
//             console.log({ queryResult });
//         }
//         else {
//             let query3 = "UPDATE kno_list_tbl SET kno_no = ? where wanumber = ?";
//             let result3 = await dbpool.query(query3, [kno, '91' + mobileno]);
//             console.log({ result3 });
//         }

//         return res.send({
//             code: 200,
//             status: "SUCCESS",
//             type: "text",
//             data: message
//         });

//     } catch (err) {
//         console.log(err);

//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong"
//         });
//     }
// });

// // Download latest bill

// router.post('/getlatestbill/:wanumber', async (req, res) => {

//     try {
//         // let kno = req.params.kno;
//         // let data = null;

//         let wanumber = req.params.wanumber;
//         let data = null;
//         let kno = null;


//         let formattedNumber = wanumber.replace(/^\+/, '');
//         formattedNumber = formattedNumber.replace(/^91/, '');

//         console.log({ formattedNumber });

//         let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
//         let result2 = await dbpool.query(query2, ['91' + formattedNumber]);
//         console.log({ result2 });
//         console.log("=========================================");
//         console.log(result2[0][0].mobileno);

//         if (result2[0][0].mobileno == null) {

//             let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
//             let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
//             console.log({ result1 });
//             console.log(result1[0][0].kno_no);
//             kno = result1[0][0].kno_no;
//         }
//         else {
//             // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
//             // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
//             // console.log({ result1 });
//             // console.log(result1[0][0].kno_no);
//             // kno = result1[0][0].kno_no;
//             // mobileno = formattedNumber;

//             console.log(result2[0][0]);

//             let mobileno = result2[0][0].mobileno;
//             console.log({ mobileno });

//             let formattedMobileno = mobileno.replace(/^\+/, '');
//             formattedMobileno = formattedMobileno.replace(/^91/, '');

//             let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
//             let result3 = await dbpool.query(query3, ['91' + formattedMobileno]);
//             console.log(result3[0][0].kno_no);
//             kno = result3[0][0].kno_no;

//         }

//         let config = {
//             method: 'post',
//             url: 'https://cescrajasthan.co.in/kotawebsite/current_bill_mobapp.jsp?kno=' + kno,
//             headers: {},
//             data: data
//         };

//         let result = await axios(config);
//         console.log(result.data);
//         data = result.data;

//         let pdfurl = data.PDFURL;

//         let message = "Please find below URL to download your bill.\n\n" + "*URL*: " + pdfurl;
//         console.log(message);

//         if (data.STATUS === 'ERROR') {
//             return res.send({
//                 code: 100,
//                 status: "FAILED",
//                 type: "text",
//                 data: "Something went wrong"
//             });
//         }
//         else {
//             return res.send({
//                 code: 200,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: message
//             });
//         }


//         console.log({ pdfurl });

//     } catch (err) {
//         console.log(err);
//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong"
//         });
//     }
// });

// // Downloads latest bill hindi

// router.post('/hindi/getlatestbill/:kno', async (req, res) => {

//     try {
//         let kno = req.params.kno;
//         let data = null;

//         console.log({ kno });

//         let config = {
//             method: 'post',
//             url: 'https://cescrajasthan.co.in/kotawebsite/current_bill_mobapp.jsp?kno=' + kno,
//             headers: {},
//             data: data
//         };

//         let result = await axios(config);
//         console.log(result.data);
//         data = result.data;

//         let pdfurl = data.PDFURL;

//         let message = "अपना बिल डाउनलोड करने के लिए कृपया नीचे दिए गए URL पर क्लिक करें।\n\n" + "*URL*: " + pdfurl;
//         console.log(message);

//         if (data.STATUS === 'ERROR') {
//             return res.send({
//                 code: 100,
//                 status: "FAILED",
//                 type: "text",
//                 data: "Something went wrong"
//             });
//         }
//         else {
//             return res.send({
//                 code: 200,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: message
//             });
//         }


//         console.log({ pdfurl });

//     } catch (err) {
//         console.log(err);
//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong"
//         });
//     }
// });

// // Payment History

// router.post('/paymenthistory/:wanumber', async (req, res) => {
//     try {
//         let wanumber = req.params.wanumber;
//         let kno = null;
//         let data = null;

//         let formattedNumber = wanumber.replace(/^\+/, '');
//         formattedNumber = formattedNumber.replace(/^91/, '');

//         console.log({ formattedNumber });


//         let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
//         let result2 = await dbpool.query(query2, ['91' + formattedNumber]);

//         if (result2[0][0].mobileno == null) {

//             let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
//             let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
//             console.log({ result1 });
//             console.log(result1[0][0].kno_no);
//             kno = result1[0][0].kno_no;
//         }
//         else {
//             // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
//             // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
//             // console.log({ result1 });
//             // console.log(result1[0][0].kno_no);
//             // kno = result1[0][0].kno_no;
//             // mobileno = formattedNumber;

//             console.log(result2[0][0]);

//             let mobileno = result2[0][0].mobileno;
//             console.log({ mobileno });

//             let formattedMobileno = mobileno.replace(/^\+/, '');
//             formattedMobileno = formattedMobileno.replace(/^91/, '');

//             let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
//             let result3 = await dbpool.query(query3, ['91' + formattedMobileno]);
//             console.log(result3[0][0].kno_no);
//             kno = result3[0][0].kno_no;

//         }

//         let config = {
//             method: 'post',
//             url: 'https://cescrajasthan.co.in/kotawebserviceMC/getPaymentsmobapp_live.jsp?kno=' + kno,
//             headers: {},
//             data: data
//         };

//         let result = await axios(config);
//         console.log(result.data.PAYMENTSDET);

//         data = result.data.PAYMENTSDET;

//         let month = null;
//         let amount = null;
//         let date = null;
//         let mode = null;

//         let monthResult = null;
//         let amountResult = null;
//         let dateResult = null;
//         let modeResult = null;

//         let message = "👇 Please find below payment details of last 6 months:\n\n";

//         for (let i = 1; i <= 6; i++) {

//             month = "mnth" + i;
//             amount = "pmntamt" + i;
//             date = "pmntdt" + i;
//             mode = "pmntmode" + i;

//             monthResult = data[month];
//             amountResult = data[amount];
//             dateResult = data[date];
//             modeResult = data[mode];

//             message += "*Month*: " + monthResult + "\n" + "*Amount*: " + amountResult + "\n" + "*Date*: " + dateResult + "\n" + "*Mode*: " + modeResult + "\n\n";
//         }

//         console.log(message);

//         return res.send({
//             code: 200,
//             status: "SUCCESS",
//             type: "text",
//             data: message
//         });


//     } catch (err) {

//         console.log(err);

//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "something went wrong"
//         });
//     }
// });

// // Usage history

// router.post('/usagehistory/:wanumber', async (req, res) => {

//     try {

//         let wanumber = req.params.wanumber;
//         let kno = null;
//         let data = null;

//         let formattedNumber = wanumber.replace(/^\+/, '');
//         formattedNumber = formattedNumber.replace(/^91/, '');

//         console.log({ formattedNumber });

//         let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
//         let result2 = await dbpool.query(query2, ['91' + formattedNumber]);

//         if (result2[0][0].mobileno == null) {

//             let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
//             let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
//             console.log({ result1 });
//             console.log(result1[0][0].kno_no);
//             kno = result1[0][0].kno_no;
//         }
//         else {
//             // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
//             // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
//             // console.log({ result1 });
//             // console.log(result1[0][0].kno_no);
//             // kno = result1[0][0].kno_no;
//             // mobileno = formattedNumber;

//             console.log(result2[0][0]);

//             let mobileno = result2[0][0].mobileno;
//             console.log({ mobileno });

//             let formattedMobileno = mobileno.replace(/^\+/, '');
//             formattedMobileno = formattedMobileno.replace(/^91/, '');

//             let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
//             let result3 = await dbpool.query(query3, ['91' + formattedMobileno]);
//             console.log(result3[0][0].kno_no);
//             kno = result3[0][0].kno_no;

//         }

//         let config = {
//             method: "post",
//             url: "https://cescrajasthan.co.in/kotawebserviceMC/getCnspmobapp_live.jsp?kno=" + kno,
//             headers: {},
//             data: data
//         };

//         let result = await axios(config);
//         data = result.data.CNSPDET;

//         console.log(data);

//         let message = "👇 Please find below usage history of last 6 months:\n\n";

//         let unit = null;
//         let date = null;
//         let grossAmt = null;
//         let netAmt = null;

//         let unitResult = null;
//         let dateResult = null;
//         let grossAmtResult = null;
//         let netAmtResult = null;

//         for (let i = 1; i <= 6; i++) {
//             unit = "unit" + i;
//             date = "bccd" + i;
//             grossAmt = "grsamt" + i;
//             netAmt = "netamt" + i;

//             unitResult = data[unit];
//             dateResult = data[date];
//             grossAmtResult = data[grossAmt];
//             netAmtResult = data[netAmt];

//             // console.log(unit, date, grossAmt, netAmt);

//             message += "*Unit*: " + unitResult + "\n" + "*Date*: " + dateResult + "\n" + "*Gross Amount*: " + grossAmtResult + "\n" + "*Net Amount*: " + netAmtResult + "\n\n";
//         }

//         console.log(message);

//         return res.send({
//             code: 200,
//             status: "SUCCESS",
//             type: "text",
//             data: message
//         });

//     } catch (err) {
//         console.log(err);

//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "something went wrong"
//         });
//     }
// });

// // power complaint middlewares

// // check bulletin

// router.post('/checkbulletin/:wanumber', async (req, res) => {

//     try {
//         let wanumber = req.params.wanumber;
//         let data = null;
//         let kno = null;


//         let formattedNumber = wanumber.replace(/^\+/, '');
//         formattedNumber = formattedNumber.replace(/^91/, '');

//         console.log({ formattedNumber });

//         let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
//         let result2 = await dbpool.query(query2, ['91' + formattedNumber]);

//         if (result2[0][0].mobileno == null) {

//             let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
//             let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
//             console.log({ result1 });
//             console.log(result1[0][0].kno_no);
//             kno = result1[0][0].kno_no;
//         }
//         else {
//             // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
//             // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
//             // console.log({ result1 });
//             // console.log(result1[0][0].kno_no);
//             // kno = result1[0][0].kno_no;
//             // mobileno = formattedNumber;

//             console.log(result2[0][0]);

//             let mobileno = result2[0][0].mobileno;
//             console.log({ mobileno });

//             let formattedMobileno = mobileno.replace(/^\+/, '');
//             formattedMobileno = formattedMobileno.replace(/^91/, '');

//             let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
//             let result3 = await dbpool.query(query3, ['91' + formattedMobileno]);
//             console.log(result3[0][0].kno_no);
//             kno = result3[0][0].kno_no;

//         }


//         let config = {
//             method: "post",
//             url: "https://cescrajasthan.co.in/cescraj/pages/event/lib/jsonChkBulletin.php?kno=" + kno,
//             headers: {},
//             data: data
//         };

//         let result = await axios(config);
//         console.log(result.data[0]);

//         if (result.data[0] === undefined) {
//             return res.send({
//                 code: 100,
//                 status: "FAILED",
//                 type: "text",
//                 data: "No details found"
//             });
//         }
//         else {
//             data = result.data;
//             endtime = data.end_time;
//             message = "Our team is working to restore your supply & expected to be resolved by " + endtime;

//             return res.send({
//                 code: 200,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: message
//             });
//         }

//     } catch (err) {
//         console.log(err);

//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong"
//         });
//     }
// });

// // check bulletin hindi

// router.post('/hindi/checkbulletin/:kno', async (req, res) => {

//     try {
//         let kno = req.params.kno;
//         let data = null;

//         let config = {
//             method: "post",
//             url: "https://cescrajasthan.co.in/cescraj/pages/event/lib/jsonChkBulletin.php?kno=" + kno,
//             headers: {},
//             data: data
//         };

//         let result = await axios(config);
//         console.log(result.data[0]);

//         if (result.data[0] === undefined) {
//             return res.send({
//                 code: 100,
//                 status: "FAILED",
//                 type: "text",
//                 data: "No details found"
//             });
//         }
//         else {
//             data = result.data;
//             endtime = data.end_time;
//             message = "हमारी टीम आपकी आपूर्ति बहाल करने के लिए काम कर रही है और उम्मीद है कि " + endtime + " तक समस्या का समाधान हो जाएगा";

//             return res.send({
//                 code: 200,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: message
//             });
//         }

//     } catch (err) {
//         console.log(err);

//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong"
//         });
//     }
// });

// // generate docket

// router.post('/checkdocket/:complainttype/:wanumber', async (req, res) => {

//     try {

//         // let kno = req.params.kno;
//         let wanumber = req.params.wanumber;
//         let complainttype = req.params.complainttype;
//         let data = null;
//         let kno = null;


//         let formattedNumber = wanumber.replace(/^\+/, '');
//         formattedNumber = formattedNumber.replace(/^91/, '');

//         console.log({ formattedNumber });

//         let query2 = "select mobileno from kno_list_tbl where wanumber = ?";
//         let result2 = await dbpool.query(query2, ['91' + formattedNumber]);
//         console.log('RESULT 2 :' + JSON.stringify(result2));

//         if (result2[0][0].mobileno == null) {

//             let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
//             let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
//             console.log({ result1 });
//             console.log(result1[0][0].kno_no);
//             kno = result1[0][0].kno_no;
//         }
//         else {
//             // let query1 = "select kno_no from kno_list_tbl where wanumber = ?";
//             // let result1 = await dbpool.query(query1, ['91' + formattedNumber]);
//             // console.log({ result1 });
//             // console.log(result1[0][0].kno_no);
//             // kno = result1[0][0].kno_no;
//             // mobileno = formattedNumber;

//             console.log(result2[0][0]);

//             let mobileno = result2[0][0].mobileno;
//             console.log({ mobileno });

//             let formattedMobileno = mobileno.replace(/^\+/, '');
//             formattedMobileno = formattedMobileno.replace(/^91/, '');

//             let query3 = "select kno_no from kno_list_tbl where mobileno = ?";
//             let result3 = await dbpool.query(query3, ['91' + formattedMobileno]);
//             console.log(result3[0][0].kno_no);
//             kno = result3[0][0].kno_no;

//         }

//         // let data = null;
//         let isComplaintExist = null;
//         let complaintNo = null;
//         let message = null;

//         // console.log({ kno, complainttype, mobileno });

//         let complaint_No = null;

//         if (complainttype === "No Power") {
//             complaint_No = 1;
//         }
//         else if (complainttype === "Voltage Problem") {
//             complaint_No = 3;
//         }
//         // else if (complainttype === "3") {
//         //     complaint_No = 12;
//         // }
//         // else if (complainttype === "4") {
//         //     complaint_No = 13;
//         // }


//         let config = {
//             method: "post",
//             url: "https://cescrajasthan.co.in/mobapi/generateDocketNo.php",
//             headers: {},
//             data: {
//                 kno: kno,
//                 complaint_type: complaint_No,
//                 mobileno: formattedNumber
//             }
//         };

//         let result = await axios(config);
//         console.log(result.data);
//         data = result.data;

//         isComplaintExist = data.isexists;
//         console.log({ isComplaintExist });

//         complaintNo = data.docket;
//         console.log({ complaintNo });

//         if (isComplaintExist === 'y') {
//             message = "Regret for the inconvenience caused Your Complaint is already registered with us\n\n" + "Complaint no: " + complaintNo + "\n\n";
//             console.log(message);
//         }
//         else if (isComplaintExist === 'n') {
//             message = "Your Complaint is registered successfully\n\n" + "Complaint no: " + complaintNo + "\n\n";
//             console.log(message);
//         }

//         return res.send({
//             code: 200,
//             status: "SUCCESS",
//             type: "text",
//             data: message
//         });

//     } catch (err) {
//         console.log(err);

//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong"
//         });
//     }

// });

// // generate docket hindi

// router.post('/hindi/checkdocket/:kno/:complainttype/:mobileno', async (req, res) => {

//     try {

//         let kno = req.params.kno;
//         let complainttype = req.params.complainttype;
//         let mobileno = req.params.mobileno;

//         let data = null;
//         let isComplaintExist = null;
//         let complaintNo = null;
//         let message = null;

//         console.log({ kno, complainttype, mobileno });

//         let complaint_No = null;

//         if (complainttype === "1") {
//             complaint_No = 1;
//         }
//         else if (complainttype === "2") {
//             complaint_No = 3;
//         }
//         else if (complainttype === "3") {
//             complaint_No = 12;
//         }
//         else if (complainttype === "4") {
//             complaint_No = 13;
//         }



//         let config = {
//             method: "post",
//             url: "https://cescrajasthan.co.in/mobapi/generateDocketNo.php",
//             headers: {},
//             data: {
//                 kno: kno,
//                 complaint_type: complaint_No,
//                 mobileno: mobileno
//             }
//         };

//         let result = await axios(config);
//         console.log(result.data);
//         data = result.data;

//         isComplaintExist = data.isexists;
//         console.log({ isComplaintExist });

//         complaintNo = data.docket;
//         console.log({ complaintNo });

//         if (isComplaintExist === 'y') {
//             message = "आपको हुई असुविधा के लिए खेद है, आपकी शिकायत हमारे पास पहले से ही दर्ज है\n\n" + "शिकायत संख्या: " + complaintNo + "\n\n" + "मेन मेन्यू में जाने के लिए *M* टाइप करें";
//             console.log(message);
//         }
//         else if (isComplaintExist === 'n') {
//             message = "आपकी शिकायत सफलतापूर्वक पंजीकृत किया गया है\n\n" + "शिकायत संख्या: " + complaintNo + "\n\n" + "मेन मेन्यू में जाने के लिए *M* टाइप करें";
//             console.log(message);
//         }

//         return res.send({
//             code: 200,
//             status: "SUCCESS",
//             type: "text",
//             data: message
//         });

//     } catch (err) {
//         console.log(err);

//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong"
//         });
//     }

// });

// // check mobno present or not

// router.post('/checkmobnopresent/:kno', async (req, res) => {
//     try {
//         let kno = req.params.kno;
//         let data = null;
//         let result = null;
//         let mobileno = null;

//         let config = {
//             method: "post",
//             url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
//             headers: {},
//             data: data
//         };

//         let response = await axios(config);
//         console.log(response.data.KNOPROFILEDET);

//         result = response.data.KNOPROFILEDET;
//         console.log({ result });

//         mobileno = result.mobno;
//         console.log({ mobileno });

//         if (result === 'NODATA') {
//             return res.send({
//                 code: 400,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: "No data found"
//             });
//         }
//         else {
//             if (mobileno) {
//                 return res.send({
//                     code: 200,
//                     status: "SUCCESS",
//                     type: "text",
//                     data: "mobile number is present"
//                 });
//             }
//             else if (mobileno === '') {
//                 return res.send({
//                     code: 300,
//                     status: "SUCCESS",
//                     type: "text",
//                     data: "mobile number is not present"
//                 });
//             }
//         }

//     } catch (err) {
//         console.log(err);
//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong"
//         });
//     }
// });

// // match mobile number

// router.post('/comparemobno/:mobno/:kno', async (req, res) => {
//     try {
//         let mobno = req.params.mobno;
//         let kno = req.params.kno;
//         let data = null;
//         let result = null;

//         let formattedNumber = mobno.replace(/^\+/, '');
//         formattedNumber = formattedNumber.replace(/^91/, '');

//         // console.log({ formattedNumber });

//         let config = {
//             method: "post",
//             url: "https://cescrajasthan.co.in/kotawebserviceMC/getProfilemobapp_live.jsp?kno=" + kno,
//             headers: {},
//             data: data
//         };

//         let response = await axios(config);
//         console.log(response.data.KNOPROFILEDET);

//         result = response.data.KNOPROFILEDET;
//         mobilenoResult = result.mobno;

//         console.log({ formattedNumber, mobilenoResult });

//         if (formattedNumber === mobilenoResult) {
//             return res.send({
//                 code: 200,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: "mobile number matched"
//             });
//         }
//         else if (formattedNumber !== result.mobileno) {
//             return res.send({
//                 code: 300,
//                 status: "SUCCESS",
//                 type: "text",
//                 data: "mobile number not matched"
//             });
//         }

//     } catch (err) {
//         console.log(err);
//         return res.send({
//             code: 100,
//             status: "FAILED",
//             type: "text",
//             data: "Something went wrong"
//         });
//     }
// });




module.exports = router;
