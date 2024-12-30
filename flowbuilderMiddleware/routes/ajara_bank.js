let express = require('express');
let router = express.Router();
let async = require('async');
var Buffer = require('buffer/').Buffer;
let dbpool = require('../db/ajaraDb');
let axios = require('axios');

router.post('/account/test', async (req, res) => {
    try {
        // let param = req.wanumber;
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++   WORKING ON AJARA BANK          +++++++++++++++++++++++++++++++++++++++++++++++++++++");
        return res.send({ code: 200, status: "Success", type: "text", data: "Your api working fine as of now..." });
    } catch (error) {
        console.log(error.message);
        return res.send({ code: 100, status: "Failed", type: "text", data: "Something Went Wrong..." });
    }
});

router.post('/account/:wanumber', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }
        query = "DELETE FROM ezb_ajara_bank_accounts_master WHERE mobileno = ? AND type = ?";
        values = [wanumber, "Account"];
        s = await dbpool.query(query, values);
        // console.log("Delete data from db regarding no", s);

        var config = {
            method: 'post',
            url: `https://www.ajarabank.org:9192/whatsappbanking/wabanking/GetAccounts/${wanumber}/Account`,
            headers: {}
        };
        let result = await axios(config);
        let data = result.data.data;
        console.log(data);
        // let accArray = data.split('~SB!');
        // // console.log(accArray);
        // let typeArr = data.replace(/[0-9~]/g, '').split("!");
        // console.log(typeArr);
        const accArray = data.split(/\D+/).filter(Boolean);


        let temp = "Please select from below mentioned account number👇 \n\n";

        // console.log("finaldata_Arr =---------------------> ", finaldata_Arr);
        for (let i = 0; i < accArray.length; i++) {
            console.log(`${i + 1}`, "--------------> ", accArray[i]);
            query = "INSERT INTO ezb_ajara_bank_accounts_master (mobileno, accountno,type,serial_no) VALUES (?,?,?,?)";
            values = [wanumber, accArray[i], "Account", i + 1];
            s = await dbpool.query(query, values);
            temp += `Type ${i + 1} 👉 for  ${accArray[i]} \n`;
            // console.log("Type", i + 1, "👉 for", accArray[i]);
            // if (i == accArray.length) {
            //     console.log("inside if");
            //     temp = +  `Type ${i + 1} 👉 for  accArray[i] \n`;

            // }
        }
        console.log(temp);
        if (result.data.code == 100) {
            return res.send({ code: 100, status: "Failed", type: "text", data: data });

        } else {

            return res.send({ code: 200, status: "Success", type: "text", data: temp });
        }
    } catch (error) {
        console.log(error);
        return res.send({ code: 100, status: "Failed", type: "text", data: "Something Went Wrong..." });
    }
});

router.post('/BalanceInquiry/:wanumber/:type', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        let type = req.params.type;
        console.log(type, wanumber);
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }
        query = "SELECT accountno FROM ezb_ajara_bank_accounts_master WHERE mobileno =? AND type = 'Account' AND serial_no = ?";
        values = [wanumber, type];
        s = await dbpool.query(query, values);

        let accNo = s[0][0].accountno;
        console.log("Accountno", s[0][0].accountno);
        // return res.send("ok");

        if (accNo != undefined && accNo != "") {
            var config = {
                method: 'post',
                url: `https://www.ajarabank.org:9192/whatsappbanking/wabanking/BalanceInquiry/${wanumber}/${accNo}`,
                headers: {}
            };
            let result = await axios(config);
            let data = result.data.data;
            console.log(data);
            return res.send({ code: 200, status: "success", type: "text", data: data });

        } else {
            return res.send({ code: 100, status: "failed", type: "text", data: "Account not found" });

        }

    } catch (error) {
        console.log(error);
        return res.send({ code: 100, status: "failed", type: "text", data: "Something Went Wrong..." });
    }
});

router.post('/ministatement/:wanumber/:type', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        let type = req.params.type;
        console.log(type, wanumber);
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }
        query = "SELECT accountno FROM ezb_ajara_bank_accounts_master WHERE mobileno =? AND type = 'Account' AND serial_no = ?";
        values = [wanumber, type];
        s = await dbpool.query(query, values);
        let accNo = s[0][0].accountno;
        console.log(s[0][0].accountno);
        // return res.send("ok");

        if (accNo != undefined && accNo != "") {
            var config = {
                method: 'post',
                url: `https://www.ajarabank.org:9192/whatsappbanking/wabanking/MiniStatement/${wanumber}/${accNo}`,
                headers: {}
            };
            let result = await axios(config);
            let data = result.data.data;
            console.log(data);

            let interactiveData = JSON.stringify({
                "from": "918087779337",  //918087779337  855b111a-50a4-11ee-9582-92672d2d0c2d
                "to": wanumber,
                "type": "interactive",
                "message": {
                    "interactive": {
                        "type": "button",
                        "body": {
                            "text": "Go to main menu"
                        },
                        "action": {
                            "buttons": [
                                {
                                    "type": "reply",
                                    "reply": {
                                        "id": "1",
                                        "title": "Yes"
                                    }
                                },
                                {
                                    "type": "reply",
                                    "reply": {
                                        "id": "2",
                                        "title": "No"
                                    }
                                }
                            ]
                        }
                    }
                }
            });

            let configInteractive = {
                method: 'post',
                url: 'https://api.pinbot.ai/v2/wamessage/send',
                headers: {
                    'apikey': '855b111a-50a4-11ee-9582-92672d2d0c2d',
                    'Content-Type': 'application/json'
                },
                data: interactiveData
            };

            setTimeout(async()=>{
                let interactiveResult = await axios(configInteractive);
                console.log("interactiveResult.data--------------------", interactiveResult.data);
            }, 5000);


            return res.send({ code: 200, status: "success", type: "text", data: data });

        } else {
            return res.send({ code: 100, status: "failed", type: "text", data: "Account not found" });

        }

    } catch (error) {
        console.log("7410733771-------------------------", error, error.message);
        return res.send({ code: 100, status: "failed", type: "text", data: "Something Went Wrong..." });
    }
});

router.post('/ChequeBookReq/:wanumber/:type', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        let type = req.params.type;
        console.log(type, wanumber);
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }
        query = "SELECT accountno FROM ezb_ajara_bank_accounts_master WHERE mobileno =? AND type = 'Account' AND serial_no = ?";
        values = [wanumber, type];
        s = await dbpool.query(query, values);
        let accNo = s[0][0].accountno;
        console.log(s[0][0].accountno);
        // return res.send("ok")

        if (accNo != undefined && accNo != "") {
            var config = {
                method: 'post',
                url: `https://www.ajarabank.org:9192/whatsappbanking/wabanking/ChequeBookReq/${wanumber}/${accNo}`,
                headers: {}
            };
            let result = await axios(config);
            let data = result.data.data;
            console.log(data);
            return res.send({ code: 200, status: "success", type: "text", data: data });

        } else {
            return res.send({ code: 100, status: "failed", type: "text", data: "Account not found" });

        }

    } catch (error) {
        console.log(error);
        return res.send({ code: 100, status: "failed", type: "text", data: "Something Went Wrong..." });
    }
});

router.post('/ChequeStatus/:wanumber/:type/:otp', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        let type = req.params.type;
        let otp = req.params.otp;
        console.log(type, wanumber);
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }
        query = "SELECT accountno FROM ezb_ajara_bank_accounts_master WHERE mobileno =? AND type = 'Account' AND serial_no = ?";
        values = [wanumber, type];
        s = await dbpool.query(query, values);
        let accNo = s[0][0].accountno;
        console.log(s[0][0].accountno);
        // return res.send("ok");

        if (accNo != undefined && accNo != "") {
            var config = {
                method: 'post',
                url: `https://www.ajarabank.org:9192/whatsappbanking/wabanking/ChequeStatus/${wanumber}/${accNo}/${otp}`,
                headers: {}
            };
            let result = await axios(config);
            let data = result.data.data;
            console.log(data);
            return res.send({ code: 200, status: "success", type: "text", data: data });

        } else {
            return res.send({ code: 100, status: "failed", type: "text", data: "Account not found" });

        }

    } catch (error) {
        console.log(error);
        return res.send({ code: 100, status: "failed", type: "text", data: "Something Went Wrong..." });
    }
});

router.post('/StopWithdrawal/:wanumber/:type', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        let type = req.params.type;
        console.log(type, wanumber);
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }
        query = "SELECT accountno FROM ezb_ajara_bank_accounts_master WHERE mobileno =? AND type = 'Account' AND serial_no = ?";
        values = [wanumber, type];
        s = await dbpool.query(query, values);
        let accNo = s[0][0].accountno;
        console.log(s[0][0].accountno);

        if (accNo != undefined && accNo != "") {
            var config = {
                method: 'post',
                url: `https://www.ajarabank.org:9192/whatsappbanking/wabanking/StopWithdrawal/${wanumber}/${accNo}`,
                headers: {}
            };
            let result = await axios(config);
            let data = result.data.data;
            console.log(data);
            return res.send({ code: 200, status: "success", type: "text", data: data });

        } else {
            return res.send({ code: 100, status: "failed", type: "text", data: "Account not found" });

        }

    } catch (error) {
        console.log(error);
        return res.send({ code: 100, status: "failed", type: "text", data: "Something Went Wrong..." });
    }
});

router.post('/loan/:wanumber', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }
        query = "DELETE FROM ezb_ajara_bank_accounts_master WHERE mobileno = ? AND type = ?";
        values = [wanumber, "Loan"];
        s = await dbpool.query(query, values);
        console.log("Delete data from db regarding no", s);

        var config = {
            method: 'post',
            url: `https://www.ajarabank.org:9192/whatsappbanking/wabanking/GetAccounts/${wanumber}/Loan`,
            headers: {}
        };
        let result = await axios(config);
        let data = result.data.data;
        console.log(data);
        // let accArray = data.replace(/[A-Z~]/g, '').split("!");
        const accArray = data.split(/\D+/).filter(Boolean);

        // console.log(accArray);
        // let typeArr = data.replace(/[0-9~]/g, '').split("!");
        // console.log(typeArr);
        let temp = "Please select from below mentioned loan number👇 \n\n";

        for (let i = 0; i < accArray.length; i++) {
            console.log(`${i+1}`,"--------------> ", accArray[i]);
            query = "INSERT INTO ezb_ajara_bank_accounts_master (mobileno, accountno,type,serial_no) VALUES (?,?,?,?)";
            values = [wanumber, accArray[i], "Loan", i + 1];
            s = await dbpool.query(query, values);
            // console.log("insert data into db accourding to mbl no", i + 1);
            temp += `Type ${i + 1} 👉 for  ${accArray[i]} \n`;

        }
        console.log(temp);
        if (result.data.code == 100) {
            return res.send({ code: 100, status: "Failed", type: "text", data: data });

        } else {

            return res.send({ code: 200, status: "Success", type: "text", data: temp });
        }

    } catch (error) {
        console.log(error);
        return res.send({ code: 100, status: "Failed", type: "text", data: "Something Went Wrong..." });
    }
});

router.post('/LoanAPI/:wanumber/:type', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        let type = req.params.type;
        console.log(type, wanumber);
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
        }
        console.log({ wanumber });
        query = "SELECT accountno FROM ezb_ajara_bank_accounts_master WHERE mobileno =? AND type = 'Loan' AND serial_no = ?";
        values = [wanumber, type];
        s = await dbpool.query(query, values);
        let accNo = s[0][0].accountno;
        console.log(s[0][0].accountno);
        // return res.send("ok");

        if (accNo != undefined && accNo != "") {
            var config = {
                method: 'post',
                url: `https://www.ajarabank.org:9192/whatsappbanking/wabanking/LoanAPI/${wanumber}/${accNo}`,
                headers: {}
            };
            let result = await axios(config);
            let data = result.data.data;
            console.log(data);
            return res.send({ code: 200, status: "success", type: "text", data: data });

        } else {
            return res.send({ code: 100, status: "failed", type: "text", data: "Account not found" });

        }

    } catch (error) {
        console.log(error);
        return res.send({ code: 100, status: "failed", type: "text", data: "Something Went Wrong..." });
    }
});

router.post('/deposit/:wanumber', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
            console.log({ wanumber });
        }
        query = "DELETE FROM ezb_ajara_bank_accounts_master WHERE mobileno = ? AND type =?";
        values = [wanumber, "Deposit"];
        s = await dbpool.query(query, values);
        console.log("Delete data from db regarding no", s);

        var config = {
            method: 'post',
            url: `https://www.ajarabank.org:9192/whatsappbanking/wabanking/GetAccounts/${wanumber}/Deposit`,
            headers: {}
        };
        let result = await axios(config);
        let data = result.data.data;
        console.log(data);
        // let accArray = data.split('~!');
        // let depositArr = data.replace(/[A-Z~]/g, '').split("!");

        // let typeArr = data.replace(/[0-9~]/g, '').split("!");
        const depositArr = data.split(/\D+/).filter(Boolean);


        let temp = "Please select from below mentioned Deposit number👇 \n\n";

        for (let i = 0; i < depositArr.length; i++) {

            console.log(`${i + 1}`, "--------------> ", depositArr[i]);
            query = "INSERT INTO ezb_ajara_bank_accounts_master (mobileno, accountno,type,serial_no) VALUES (?,?,?,?)";
            values = [wanumber, depositArr[i], "Deposit", i + 1];
            s = await dbpool.query(query, values);
            // console.log("insert data into db accourding to mbl no", i + 1);
            // temp += `${i + 1}). 👉  ${depositArr[i]} \n`;
            temp += `Type ${i + 1} 👉 for  ${depositArr[i]} \n`;


        }

        console.log(temp);
        if (result.data.code == 100) {
            return res.send({ code: 100, status: "Failed", type: "text", data: data });

        } else {

            return res.send({ code: 200, status: "Success", type: "text", data: temp });
        }
    } catch (error) {
        console.log(error);
        return res.send({ code: 100, status: "Failed", type: "text", data: "Something Went Wrong..." });
    }
});

router.post('/DepositAPI/:wanumber/:type', async (req, res) => {
    try {
        let wanumber = req.params.wanumber;
        let type = req.params.type;
        console.log(type, wanumber);
        if (wanumber.length == 12) {
            wanumber = wanumber.substring(2, 12);
        }
        console.log({ wanumber });
        query = "SELECT accountno FROM ezb_ajara_bank_accounts_master WHERE mobileno =? AND type = 'Deposit' AND serial_no = ?";
        values = [wanumber, type];
        s = await dbpool.query(query, values);
        let accNo = s[0][0].accountno;
        console.log(s[0][0].accountno);
        // return res.send("ok");

        if (accNo != undefined && accNo != "") {
            var config = {
                method: 'post',
                url: `https://www.ajarabank.org:9192/whatsappbanking/wabanking/DepsitAPI/${wanumber}/${accNo}`,
                headers: {}
            };
            let result = await axios(config);
            let data = result.data.data;
            console.log(data);
            return res.send({ code: 200, status: "success", type: "text", data: data });

        } else {
            return res.send({ code: 100, status: "failed", type: "text", data: "Account not found" });

        }

    } catch (error) {
        console.log(error);
        return res.send({ code: 100, status: "failed", type: "text", data: "Something Went Wrong..." });
    }
});


module.exports = router;