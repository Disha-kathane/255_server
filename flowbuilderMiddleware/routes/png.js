let express = require('express');
let app = express();
let router = express.Router();
let async = require('async');
let axios = require('axios');
const { CLIENT_RENEG_LIMIT } = require('tls');


// router.post('/Metalrate', (req, res) => {
//     let MetalRate = (callback) => {
//         let PlatinumPurity = '';
//         let MessageContent = '';
//         let PlatinumRate = '';
//         var config = {
//             method: 'get',
//             url: 'https://app6.pngjpl.com:8443/acme-document-web/doc/whatsapppWebHooksMetalRate?authorization=jdO4jCFnTnOPA5VnQHOmgLhnTnONZeZcRnO3.jdO4EB9mgsWIg6WqNotcQHOmhMGIg6WqNotcQHOog65bV63pEXN0RXbniCSqhpSaELZnToNeReFxNrcaE4SaELZnToV6SeD9SHbnD7AdhrAziKOagLAIg6WqNot6SXbniMOmXBVnTnNnQHOrfCOyWrqzBBAmhpqpNotdkV.YFvg9xTFKJEnLepkHa5-vM22WfkfOjHObyC1YWljl64QuCQMCqn6kajFHhWtjl-Fe0GsnVI--6m9aByYB5BaQb&sProgramKey=25438546789662975&X-key=zVhY2RjNGFormBoWI4LWE3YmYtZmY2MzVh&Content-Type=application/json',
//             headers: {
//                 'authorization': 'jdO4jCFnTnOPA5VnQHOmgLhnTnONZeZcRnO3.jdO4EB9mgsWIg6WqNotcQHOmhMGIg6WqNotcQHOog65bV63pEXN0RXbniCSqhpSaELZnToNeReFxNrcaE4SaELZnToZcReldSHbnD7AdhrAziKOagLAIg6WqNot9SHbniMOmXBVnTnNnQHOrfCOyWrqzBBAmhpqpNot5kV.yLsFKEAjzKPG1Iqj89vxqsOBT7nqJ2oDqb_Ecfe17JhydPLNSq_ahyJTApYvNVyttlkII-EfNAG4gZsFKy07LV',
//                 'sProgramKey': '25459229707993088',
//                 'X-key': 'zVhY2RjNGFormBoWI4LWE3YmYtZmY2MzVh',
//                 'Content-Type': 'application/json'
//             }
//         };

//         axios(config)
//             .then(function (response) {
//                 if (response.data.code == '100') {
//                     callback(response.data)
//                 } else {
//                     let MessageContent = '*Here is Todays metal rate*\n\n';
//                     let data = response.data.data;
//                     console.log("data", data)

//                     if (data.PlatinumRate == undefined) {
//                         PlatinumPurity = 'NA';
//                         PlatinumRate = 'NA';
//                         let Gold = data.GoldRate;
//                         for (i = 0; i < Gold.length; i++) {
//                             GoldRatePurity = Gold[i].purity;
//                             GoldRate = Gold[i].rate;
//                             MessageContent += '*Gold* :' + GoldRatePurity + 'kt  ' + GoldRate + '/gm\n';

//                         }

//                         MessageContent += '*Platinum* :' + PlatinumPurity + 'kt ' + PlatinumRate + '/gm\n';
//                         callback(null, MessageContent)
//                     } else {

//                         PlatinumPurity = data.PlatinumRate[0].purity;
//                         PlatinumRate = data.PlatinumRate[0].rate;
//                         let Gold = data.GoldRate;
//                         for (i = 0; i < Gold.length; i++) {
//                             GoldRatePurity = Gold[i].purity;
//                             GoldRate = Gold[i].rate;
//                             MessageContent += '*Gold* :' + GoldRatePurity + 'kt  ' + GoldRate + '/gm\n';

//                         }

//                         MessageContent += '*Platinum* :' + PlatinumPurity + 'kt ' + PlatinumRate + '/gm\n';
//                         callback(null, MessageContent)

//                     }
//                 }

//             })
//             .catch(function (error) {
//                 console.log(error);
//             });
//     }

//     async.waterfall([MetalRate], (err, result) => {

//         if (err) {
//             res.send({
//                 code: 100,
//                 status: 'FAILED',
//                 data: err.data
//             });
//         } else {
//             let response = {
//                 code: 200,
//                 status: "success",
//                 type: "text",
//                 data: result
//             };
//             res.status(200).json(response);
//         }
//     })
// })


router.post('/Metalrate', (req, res) => {
    let MetalRate = (callback) => {
        let PlatinumPurity = '';
        let MessageContent = '';
        let PlatinumRate = '';
        var config = {
            method: 'get',
            url: 'https://app6.pngjpl.com:8443/acme-document-web/doc/whatsapppWebHooksMetalRate?authorization=jdO4jCFnTnOPA5VnQHOmgLhnTnONZeZcRnO3.jdO4EB9mgsWIg6WqNotcQHOmhMGIg6WqNotcQHOog65bV63pEXN0RXbniCSqhpSaELZnToR5RoDxNrcaE4SaELZnToJbSYV6SIFxNrS5hsOqgsWXg6cqV63pEXN0RYDbQHO4hrKOEHN0NnNxNrEuhr5LfB9EEBKdXBVnToS3.Sp4Tkvt8c-3Z_3cEdvPJCbN5ZIXZyMAsb3l6QXMdj0txPzaN2oeIZJMPDwRGi8sBP6yy38EbtBxP2Naptz19ql&sProgramKey=25438546789662975&X-key=zVhY2RjNGFormBoWI4LWE3YmYtZmY2MzVh&Content-Type=application/json',
            headers: {
                'authorization': 'jdO4jCFnTnOPA5VnQHOmgLhnTnONZeZcRnO3.jdO4EB9mgsWIg6WqNotcQHOmhMGIg6WqNotcQHOog65bV63pEXN0RXbniCSqhpSaELZnToR5RoDxNrcaE4SaELZnToJbSYV6SIFxNrS5hsOqgsWXg6cqV63pEXN0RYDbQHO4hrKOEHN0NnNxNrEuhr5LfB9EEBKdXBVnToS3.Sp4Tkvt8c-3Z_3cEdvPJCbN5ZIXZyMAsb3l6QXMdj0txPzaN2oeIZJMPDwRGi8sBP6yy38EbtBxP2Naptz19ql',
                'sProgramKey': '25459229707993088',
                'X-key': 'zVhY2RjNGFormBoWI4LWE3YmYtZmY2MzVh',
                'Content-Type': 'application/json'
            }
        }

        axios(config)
            .then(function (response) {
                if (response.data.code == '100') {
                    callback(response.data)
                } else {
                    let MessageContent = '*Here is Todays metal rate*\n\n';
                    let data = response.data.data;
                    if (data.PlatinumRate != undefined && data.GoldRate != undefined && data.GoldRate != undefined) {
                        PlatinumPurity = data.PlatinumRate[0].purity;
                        PlatinumRate = data.PlatinumRate[0].rate;
                        SilverPurity = data.SilverRate[0].purity;
                        SilverRate = data.SilverRate[0].rate;
                        let Gold = data.GoldRate;
                        for (i = 0; i < Gold.length; i++) {
                            GoldRatePurity = Gold[i].purity;
                            GoldRate = Gold[i].rate;
                            MessageContent += '*Gold* : ' + GoldRatePurity + 'kt  ' + GoldRate + '/gm\n';

                        }

                        MessageContent += '*Platinum* : ' + PlatinumPurity + 'kt  ' + PlatinumRate + '/gm\n*Silver* : ' + SilverPurity + 'kt  ' + SilverRate + '/gm\n';
                        callback(null, MessageContent)

                    } else {

                        PlatinumPurity = 'NA';
                        PlatinumRate = 'NA';
                        GoldRatePurity = 'NA';
                        GoldRate = 'NA';
                        SilverPurity = 'NA';
                        SilverRate = 'NA';

                        MessageContent += '*Platinum* : ' + PlatinumPurity + 'kt  ' + PlatinumRate + '/gm\n*Silver* : ' + SilverPurity + 'kt ' + SilverRate + '/gm\n';
                        callback(null, MessageContent)

                    }

                }

            })
            .catch(function (error) {
                console.log(error);
            });
    }

    async.waterfall([MetalRate], (err, result) => {

        if (err) {
            res.send({
                code: 100,
                status: 'FAILED',
                data: err.data
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
    })
})



router.post('/OderStatus/:wanumber/:orderno', (req, res) => {
    let OrderStatus = (callback) => {
        let MobileNo = req.params.wanumber;
        console.log(MobileNo)
        let OrderNo = req.params.orderno;
        var data = JSON.stringify({
            "mobileNo": MobileNo,
            "orderNo": OrderNo
        });



        var config = {
            method: 'get',
            url: 'https://app6.pngjpl.com:8443/acme-document-web/doc/whatsappWebHooksOrderStatus?authorization=jdO4jCFnTnOPA5VnQHOmgLhnTnONZeZcRnO3.jdO4EB9mgsWIg6WqNotcQHOmhMGIg6WqNotcQHOog65bV63pEXN0RXbniCSqhpSaELZnToR5RoDxNrcaE4SaELZnToJbSYV6SIFxNrS5hsOqgsWXg6cqV63pEXN0RYDbQHO4hrKOEHN0NnNxNrEuhr5LfB9EEBKdXBVnToS3.Sp4Tkvt8c-3Z_3cEdvPJCbN5ZIXZyMAsb3l6QXMdj0txPzaN2oeIZJMPDwRGi8sBP6yy38EbtBxP2Naptz19ql&sProgramKey=25438546789662975&X-key=zVhY2RjNGFormBoWI4LWE3YmYtZmY2MzVh&Content-Type=application/json',
            headers: {
                'authorization': 'jdO4jCFnTnOPA5VnQHOmgLhnTnONZeZcRnO3.jdO4EB9mgsWIg6WqNotcQHOmhMGIg6WqNotcQHOog65bV63pEXN0RXbniCSqhpSaELZnToR5RoDxNrcaE4SaELZnToJbSYV6SIFxNrS5hsOqgsWXg6cqV63pEXN0RYDbQHO4hrKOEHN0NnNxNrEuhr5LfB9EEBKdXBVnToS3.Sp4Tkvt8c-3Z_3cEdvPJCbN5ZIXZyMAsb3l6QXMdj0txPzaN2oeIZJMPDwRGi8sBP6yy38EbtBxP2Naptz19ql',
                'sProgramKey': '25459229707993088',
                'X-key': 'zVhY2RjNGFormBoWI4LWE3YmYtZmY2MzVh',
                'Content-Type': 'application/json'
            },
            data: data
        };


        axios(config)
            .then(function (response) {
                console.log(response)
                if (response.data.code == 100) {
                    callback(response.data)
                } else {
                    if (response.data.data != undefined && response.data.data != null) {
                        let MessageContent = response.data.data;
                        callback(null, MessageContent)
                    } else {
                        callback(1)
                    }
                }

            })
            .catch(function (error) {
                console.log(error);
            });


    }

    async.waterfall([OrderStatus], (err, result) => {
        if (err) {
            res.send({
                code: 100,
                status: 'FAILED',
                data: err.data
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
    })
})

module.exports = router;
