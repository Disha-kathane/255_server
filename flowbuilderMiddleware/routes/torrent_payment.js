let express = require('express');
let router = express.Router();
let mysql = require('mysql');

let dbpool;
let db_config = {
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'ezeebot',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};
dbpool = mysql.createPool(db_config);


router.post('/paymentCallback', async (req, res) => {
    try {
        let query = null;
        let values = null;
        let result = null;

        console.log('TORRENT_GAS_PAYMENT_MIDDLEWARE : ' + JSON.stringify(req.body));
        if (req.body.object === 'whatsapp_business_account'
            && (req.body.entry[0].changes[0].value.hasOwnProperty('contacts')
                && req.body.entry[0].changes[0].value.hasOwnProperty('messages'))) {

        } else if (req.body.object === 'whatsapp_business_account'
            && req.body.entry[0].changes[0].value.hasOwnProperty('statuses')) {
            if (req.body.entry[0].changes[0].value.statuses[0].biz_opaque_callback_data != undefined &&
                req.body.entry[0].changes[0].value.statuses[0].hasOwnProperty('biz_opaque_callback_data')) {
                let recipient_no = req.body.entry[0].changes[0].value.statuses[0].recipient_id;
                let messageid = req.body.entry[0].changes[0].value.statuses[0].id;
                let bizOpaqueCallbackData = JSON.parse(req.body.entry[0].changes[0].value.statuses[0].biz_opaque_callback_data);
                console.log('TORRENT_GAS_PAYMENT_MIDDLEWARE : ' + JSON.stringify(bizOpaqueCallbackData));
                let amount = bizOpaqueCallbackData.amount;
                let billdate = bizOpaqueCallbackData.date;
                let consumer_id = bizOpaqueCallbackData.consumer_id;

                query = "SELECT COUNT(1) AS C FROM ezb_torrent_payment_flow_master WHERE statuses_msgid = ?";
                values = [messageid];
                result = await dbpool.query(query, values);
                // console.log('TORRENT_GAS_PAYMENT_MIDDLEWARE_1 : ' + JSON.stringify(result));


                query = "INSERT INTO ezb_torrent_payment_flow_master(recipient_no,amount,billdate,consumerid,transactionid,statuses_msgid,contacts_msgid)" +
                    " VALUES(?,?,?,?,?,?,?)";
                values = [recipient_no, amount, billdate, consumer_id, null, messageid, null];
                result = await dbpool.query(query, values);
                // console.log('TORRENT_GAS_PAYMENT_MIDDLEWARE_2 : ' + JSON.stringify(result));
            }
        }

        res.send('TORRENT_GAS_PAYMENT_MIDDLEWARE');
    } catch (error) {
        res.send(error);
    }
});

module.exports = router;