let express = require('express');
let router = express.Router();
let async = require('async');
let mysql = require('mysql');
let fs = require('fs');
let pdf = require('html-pdf');
var spicejethtml = require('./spicejethtml');
let path = require('path');

router.post('/CreatePdf/:name/:mobileno/:emailid/:firstcity/:secondcity/:firstdate/:adult/:kids', (req, res) => {
    let PdfResponse = '';
   
    let GetValues = (callback) => {
        // console.log(JSON.stringify(req.params))
        let Name = req.params.name;
        let MobileNo = req.params.mobileno;
        let emailid = req.params.emailid;
        let firstcity = req.params.firstcity;
        let firstcity1 = req.params.firstcity;
        let firstcity_2 = req.params.firstcity;
        let secondcity = req.params.secondcity;
        let secondcity1 = req.params.secondcity;
        let secondcity_2 = req.params.secondcity;
        let firstdate = req.params.firstdate;
        let firstdate1 = req.params.firstdate;
        let seconddate = req.params.seconddate;
        let seconddate1 = req.params.seconddate;
        let seconddate_2 = req.params.seconddate;
        let adult = req.params.adult;
        let kids = req.params.kids;
        let date_ob = new Date();
        
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();
        let currentdatetime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
        console.log(currentdatetime);
        
        var str_html = spicejethtml;
        str_html = str_html.replace('{Person_Name}', Name);
        str_html = str_html.replace('{Mobile_No}', MobileNo);
        str_html = str_html.replace('{email_id}', emailid);
        str_html = str_html.replace('{first_city}', firstcity);
        str_html = str_html.replace('{firstcity_1}', firstcity1);
        str_html = str_html.replace('{firstcity_ip}', firstcity_2);
        str_html = str_html.replace('{second_city}', secondcity);
        str_html = str_html.replace('{secondcity_1}', secondcity1);
        str_html = str_html.replace('{secondcity_ip}', secondcity_2);
        str_html = str_html.replace('{first_date}', firstdate);
        str_html = str_html.replace('{first_date1}', firstdate1);
        str_html = str_html.replace('{second_date}', seconddate);
        str_html = str_html.replace('{seconddate_1}', seconddate1);
        str_html = str_html.replace('{seconddate_ip}', seconddate_2);
        str_html = str_html.replace('{adult}', adult);
        str_html = str_html.replace('{kids}', kids);
        str_html = str_html.replace('{currentdate_time}', currentdatetime);

        
        let options = {
            "format": "A4"
        }
        let auto_generated_filename = MobileNo + '_dummy.pdf';

        let IPaddress = req.get('host');
        IPaddress = IPaddress.split(":");
        let addr = IPaddress[0];
        let destination_path = './public/pdf-files/' + auto_generated_filename
       
        pdf.create(str_html, options).toFile(destination_path, (err, res) => {
            if (err) {
                console.log(err);
            }

            let Url = 'http://68.183.90.255:5000/pdf-files/' + auto_generated_filename;
            callback(null, Url)
        })
    }

    async.waterfall([GetValues], (err, result) => {
        console.log("result", result)
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
                type: "document",
                url: result,
                data: ""
            };
            res.status(200).json(response);
        }
    })
})

module.exports = router;