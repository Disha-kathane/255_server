let express = require('express');
let router = express.Router();
let async = require('async');
let mysql = require('mysql');

let db;

let db_config = {
    host: 'localhost',
    user: 'root',
    password: 'cj*:gCfus6!5',
    database: 'ezeebot_new',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8'
};

router.post('/feedback/:fname/:email/:cnumber',function (req,res,next) {
    let fname = (typeof req.params.fname != 'undefined') ? req.params.fname+'' : '';
    let email = (typeof req.params.email != 'undefined') ? req.params.email+'' : '';
    let cnumber = (typeof req.params.cnumber != 'undefined') ? req.params.cnumber+'' : '';

    if(fname == "" || email=="" || cnumber==""){
        res.send({
            code: 100,
            status: 'FAILED',
            data: "Something went wrong"
        });
        return;
    }

    let data = {
        question5:fname,
        question7:email,
        question6:cnumber
    };
    let base64encodedstr = Buffer.from(JSON.stringify(data)).toString('base64');

    let instanceUrl = "https://gpitdemo.app.qaizenx.in/feedback/1f0c4958-2b7d-496c-8c73-a38c97254628/91d53fd5-0cfa-4356-b13e-d9a271117cf7" +
        "?identifiers="+base64encodedstr;
    let text = "Please click on this link to give your feedback \n"+instanceUrl+"\nType *B* to go back to main menu";
    let resposeBody = "<p>"+text+"</p>";
    let response = {
        code: 200,
        status: "success",
        type: "text",
        data: text
    };
    res.status(200).json(response);
    return; 
});


module.exports = router;