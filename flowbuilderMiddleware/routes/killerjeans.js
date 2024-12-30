const express = require('express');
const router = express.Router();
let mysql = require('mysql2');

let db_config = {
    host: '10.139.244.211',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'ezeebot',
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};

let dbpool = mysql.createPool(db_config).promise();


router.post('/manageCoupon/:wanumber', async (req, res) => {
    let mobileno = req.params.wanumber;

    let checkWanumberResult = await checkWanumber(mobileno);

    if (checkWanumberResult.length > 0) {
        if (checkWanumberResult[0].C == 0) {
            let fetchAvailableCouponResult = await fetchAvailableCoupon(mobileno);
            console.log(fetchAvailableCouponResult);
            if (fetchAvailableCouponResult.length > 0) {
                if (fetchAvailableCouponResult[0].couponcode) {
                    let saveAllottedCouponResult = await saveAllottedCoupon(mobileno, fetchAvailableCouponResult[0].couponcode);
                    console.log({ saveAllottedCouponResult });

                    let updateCouponResult = await updateCoupon(fetchAvailableCouponResult[0].couponcode);
                    console.log({ updateCouponResult });

                    res.send({
                        code: 200,
                        type: 'text',
                        status: 'success',
                        data: '✨ Season’s Hottest Offers at Killer! ✨\n\n' +
                            'The Autumn-Winter Collection is here, and so are killer\'s exclusive deal only for you.\n\n' +
                            '*Apply code: ' + fetchAvailableCouponResult[0].couponcode + '*\n\nAnd get Rs. 500 off on any merchandise in the store, whether it\'s a single bottom wear or top wear!\n\n' +
                            'Find your nearest Killer store and elevate your style with the best deal of the season! 🛍️\n\n' +
                            'Killer - this is us\n' +
                            'T&C Apply'
                    });
                }
            } else {
                res.send({
                    code: 200,
                    type: 'text',
                    status: 'success',
                    data: 'Thank you for showing interest in obtaining a coupon.\n\nDue to the rising demand in this festive season,' +
                        ' we could not find any coupon available for you at the moment. We will keep you notified once we are back with the new offers.\n\nRegards,\nKiller Jeans'
                });
            }
        } else {
            let fetchAllottedCouponResult = await fetchAllottedCoupon(mobileno);
            console.log({ fetchAllottedCouponResult });

            if (fetchAllottedCouponResult.length > 0) {
                res.send({
                    code: 200,
                    type: 'text',
                    status: 'success',
                    data: 'Hi,\n\n👉 You\'ve already requested a coupon code from this number. Your exclusive coupon code is *' + fetchAllottedCouponResult[0].couponcode +
                        '*. Enjoy using it at Killer Jeans!'
                });
            } else {
                res.send({
                    code: 200,
                    type: 'text',
                    status: 'success',
                    data: 'Something went wrong'
                });
            }
        }
    } else {
        res.send({
            code: 200,
            type: 'text',
            status: 'success',
            data: 'Something went wrong'
        });
    }
});

let checkWanumber = async (mobileno) => {
    let query = "SELECT COUNT(1) AS C FROM ezb_killerjeans_allotted_coupon_master WHERE mobileno = ?";
    let values = [mobileno];
    let [result] = await dbpool.query(query, values);
    return result;
};

let fetchAllottedCoupon = async (mobileno) => {
    let query = "SELECT couponcode FROM ezb_killerjeans_allotted_coupon_master WHERE mobileno = ?";
    let values = [mobileno];
    let [result] = await dbpool.query(query, values);
    return result;
};

let saveAllottedCoupon = async (mobileno, couponcode) => {
    let query = "INSERT INTO ezb_killerjeans_allotted_coupon_master (mobileno, couponcode) VALUES(?,?)";
    let values = [mobileno, couponcode];
    let [result] = await dbpool.query(query, values);
    return result;
};

let fetchAvailableCoupon = async () => {
    let query = "SELECT couponcode FROM ezb_killerjeans_coupon_master WHERE status = ? LIMIT 1";
    let values = [0];
    let [result] = await dbpool.query(query, values);
    return result;
};

let updateCoupon = async (couponcode) => {
    let query = "UPDATE ezb_killerjeans_coupon_master SET status = ? WHERE couponcode = ? AND status = ?";
    let values = [1, couponcode, 0];
    let [result] = await dbpool.query(query, values);
    return result;
};

module.exports = router;