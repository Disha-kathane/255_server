let express = require('express');
let app = express();
let router = express.Router();
let async = require('async');
let axios = require('axios');
const moment = require('moment');



router.post('/Venulook/:servicetype/:usercity/:userlocality/:uservenuetype/:username/:useremail/:userphone/:useroccasion/:userguest/:userfoodtype/:userdrinktype/:userbudgetrange/:usereventdate', (req, res) => {

    let ServiceType = req.params.servicetype;
    let UserCity = req.params.usercity;
    let UserLocality = req.params.userlocality;
    let UserVenuType = req.params.uservenuetype;
    let UserName = req.params.username;
    let UserEmail = req.params.useremail;
    let UserPhone = req.params.userphone;
    let UserOccasion = req.params.useroccasion;
    let UserGuest = req.params.userguest;
    let UserFoodType = req.params.userfoodtype;
    let UserDrinkType = req.params.userdrinktype;
    let UserBudgetRange = req.params.userbudgetrange;
    let UserEventDate = req.params.usereventdate;

    // added by khushal to handle incorrect date formats
    UserEventDate = moment(UserEventDate, ["YYYY-MM-DD", "DD-MM-YYYY", "YYYY/MM/DD", "DD/MM/YYYY"]).format('YYYY-MM-DD');


    // let firstindex = date.charAt(0);

    regExp = /^[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    let isMatchfirst = regExp.test(UserEventDate.charAt(0));
    let isMatchlast = regExp.test(UserEventDate.charAt(UserEventDate.length - 1));
    console.log(isMatchfirst, isMatchlast);
    if (isMatchfirst == false && isMatchlast == false) {
        UserEventDate = UserEventDate.replace(/\b(\d{1})\b/g, '0$1');

        // commented by khushal as incorrect date format check already added above
        //var yourdate = UserEventDate.split("-").reverse().join("-")

        var yourdate = UserEventDate;

        var config = {
            method: 'post',
            url: 'https://admin.venuelook.com/website/api/whatsapp/userdetails?apikey=vlk94wts56app40sec42key43&service_type=' + ServiceType + '&user_city=' + UserCity + '&user_locality=' + UserLocality + '&user_venue_type=' + UserVenuType + '&user_name=' + UserName + '&user_email=' + UserEmail + '&user_phone=' + UserPhone + '&user_occasion=' + UserOccasion + '&user_guest=' + UserGuest + '&user_food_type=' + UserFoodType + '&user_drink_type=' + UserDrinkType + '&user_budget_range=' + UserBudgetRange + '&user_event_date=' + yourdate + '',
            headers: {
                'Cookie': 'PHPSESSID=5808s0v0ue9r7qp9kkg7fccsr4'
            }
        };

        console.log(config);

        axios(config)
            .then(function (response) {
                if (response.data.code == 100) {
                    res.send({
                        code: 100,
                        status: 'FAILED',
                        // data: "Something went wrong"
                        data: response.data.data

                    });
                } else {

                    let result = response.data.data;
                    let tempresult = result.replace(/\r/g, '\n');
                    let response1 = {
                        code: 200,
                        status: "success",
                        type: "text",
                        data: tempresult
                    };
                    res.status(200).json(response1);

                }
            })
            .catch(function (error) {
                console.log(error);
            });
    } else {
        res.send({
            code: 100,
            status: 'FAILED',
            data: "date format in not correct"
        });

    }

});





router.post('/VendorVenulook/:servicetype/:usercity/:uservendortype/:username/:useremail/:userphone/:useroccasion/:userguest/:userbudgetrange/:usereventdate', (req, res) => {

    let ServiceType = req.params.servicetype;
    let UserCity = req.params.usercity;

    let UserVendorType = req.params.uservendortype;
    let UserName = req.params.username;
    let UserEmail = req.params.useremail;
    let UserPhone = req.params.userphone;
    let UserOccasion = req.params.useroccasion;
    let UserGuest = req.params.userguest;
    let UserBudgetRange = req.params.userbudgetrange;
    let UserEventDate = req.params.usereventdate;

    UserEventDate = moment(UserEventDate, ["YYYY-MM-DD", "DD-MM-YYYY", "YYYY/MM/DD", "DD/MM/YYYY"]).format('YYYY-MM-DD');
    let EventDate = UserEventDate.replace(/\b(\d{1})\b/g, '0$1');

    var config = {
        method: 'get',
        url: 'https://admin.venuelook.com/website/api/whatsapp/userdetails?apikey=vlk94wts56app40sec42key43&service_type=' + ServiceType + '&user_city=' + UserCity + '&user_vendor_type=' + UserVendorType + '&user_name=' + UserName + '&user_email=' + UserEmail + '&user_phone=' + UserPhone + '&user_occasion=' + UserOccasion + '&user_guest=' + UserGuest + '&user_budget_range=' + UserBudgetRange + '&user_event_date=' + EventDate + '',
        headers: {
            'Cookie': 'PHPSESSID=5808s0v0ue9r7qp9kkg7fccsr4'
        }
    };

    console.log(config);

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            if (response.data.code == 100) {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    // data: "Something went wrong"
                    data: response.data.data

                });
            } else {

                let result = response.data.data;
                // console.log("result data",result)
                let tempresult = result.replace(/\r/g, '\n');
                console.log(tempresult);
                let response1 = {
                    code: 200,
                    status: "success",
                    type: "text",
                    data: tempresult
                };
                res.status(200).json(response1);

            }
        })
        .catch(function (error) {
            console.log(error);
        });

});

module.exports = router;