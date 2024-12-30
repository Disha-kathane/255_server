
let express = require('express');
let router = express.Router();
let callbackService = require('../services/callback.js');
const axios = require('axios');
router.use(express.json());
const { errorLogger, infoLogger } = require('../applogger');

router.post('/:userid', async (req, res) => {
    let UserId = req.params.userid;
    let data = JSON.stringify(req.body);
    console.log("REQUEST_BODY:", JSON.stringify(req.body));
    console.log({ data, UserId });
    infoLogger.info("REQUEST_BODY:", JSON.stringify(req.body));
    let counter = 0;
    let fetchcallbackUrlResult = await callbackService.fetchcallbackUrl(UserId);
    console.log("fetchcallbackUrlResult", { fetchcallbackUrlResult });
    if (fetchcallbackUrlResult.length > 0) {
        for (let i = 0; i < fetchcallbackUrlResult.length; i++) {
            counter++;
            let callbackurl = fetchcallbackUrlResult[i].callback_url;
            let methodtype = fetchcallbackUrlResult[i].methodtype;
            let config = {
                method: methodtype,
                maxBodyLength: Infinity,
                url: callbackurl,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };

            console.log("confing -------------------------> ", config)
            await axios.request(config)
                .then((response) => {
                    if (counter === fetchcallbackUrlResult.length) {
                        infoLogger.info("**********************************");
                        infoLogger.info("response", response.data);
                        console.log({ "code": "200", "status": "success", "data": response.data, callbackurl: callbackurl });
                        // return res.send({ "code": "200", "status": "success" });
                    }
                })
                .catch((error) => {
                    errorLogger.error("**********************************");
                    errorLogger.error("ERROR", error);
                    console.log(error);
                });
        }
        return res.send({ "code": "200", "status": "success" });
    } else {
        return res.send({ "code": "200", "status": "success" });
    }
});

module.exports = router;
