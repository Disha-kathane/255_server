const express = require('express');
const router = express.Router();
let async = require('async');
let axios = require('axios');

router.post('/catalogProducts', (req, res) => {
    try {
        let catalogid = req.body.catalogid;
        let token = req.headers.accesstoken;

        console.log({ catalogid });

        console.log({ token });

        let config = {
            method: 'get',
            url: 'https://graph.facebook.com/v17.0/' + catalogid + '/products?access_token=' + token + '&fields=["category","name","retailer_id","price","availability","description","country","brand","image_url","size","color"]&limit=999',
            headers: {}
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                res.send({ code: 200, status: 'success', data: response.data.data });
            })
            .catch(function (error) {
                console.log(error);
                res.send({ code: 100, status: 'failed', data: error.message });
            });

    }
    catch (err) {
        res.send({ code: 100, status: 'failed', data: err.message });
    }
});

router.post('/createCatalog', async (req, res) => {
    try {
        // https://developers.facebook.com/docs/marketing-api/reference/product-catalog/batch/

        let catalogid = req.body.catalogid;
        let token = req.headers.accesstoken;
        let catalogRequest = req.body.request;

        let data = JSON.stringify({
            "access_token": token,
            "requests": catalogRequest
        });

        var config = {
            method: 'post',
            url: 'https://graph.facebook.com/v17.0/' + catalogid + '/batch',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                res.send({ code: 200, status: 'success', data: response.data });
            })
            .catch(function (error) {
                console.log(error);
                res.send({ code: 100, status: 'failed', data: error.message });
            });
    } catch (err) {
        res.send({ code: 100, status: 'failed', data: err.message });
    }

});


router.post('/updateCatalog', async (req, res) => {
    try {
        // https://developers.facebook.com/docs/marketing-api/reference/product-catalog/batch/

        let catalogid = req.body.catalogid;
        let token = req.headers.accesstoken;
        let catalogRequest = req.body.request;

        let data = JSON.stringify({
            "access_token": token,
            "requests": catalogRequest
        });

        var config = {
            method: 'post',
            url: 'https://graph.facebook.com/v17.0/' + catalogid + '/batch',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                res.send({ code: 200, status: 'success', data: response.data });
            })
            .catch(function (error) {
                console.log(error);
                res.send({ code: 100, status: 'failed', data: error.message });
            });
    } catch (err) {
        res.send({ code: 100, status: 'failed', data: err.message });
    }

});

router.post('/deleteCatalog', async (req, res) => {
    try {
        // https://developers.facebook.com/docs/marketing-api/reference/product-catalog/batch/

        let catalogid = req.body.catalogid;
        let token = req.headers.accesstoken;
        let catalogRequest = req.body.request;

        let data = JSON.stringify({
            "access_token": token,
            "requests": catalogRequest
        });

        var config = {
            method: 'post',
            url: 'https://graph.facebook.com/v17.0/' + catalogid + '/batch',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                res.send({ code: 200, status: 'success', data: response.data });
            })
            .catch(function (error) {
                console.log(error);
                res.send({ code: 100, status: 'failed', data: error.message });
            });
    } catch (err) {
        res.send({ code: 100, status: 'failed', data: err.message });
    }

});


module.exports = router;