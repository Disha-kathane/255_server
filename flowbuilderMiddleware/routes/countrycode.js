let express = require('express');
let router = express.Router();
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();


router.post('/countrcode/:mobile', async (req, res) => {

    let mobilenp = req.params.mobile;

    function getCountryCodeNumeric(mobilenp) {
        if (/^\+/.test(mobilenp) == false) {
            mobilenp = '+' + mobilenp;
        }
        var countryCode = '';
        try {
            var mobileNumber = phoneUtil.parse(mobilenp, '');
            countryCode = mobileNumber.getCountryCode();
            console.log({ mobileNumber });
            if (mobileNumber.values_[1] == '91') {
                res.send({
                    code: 200,
                    status: 'success',
                    data: 'INDIA'
                });
            } else {
                res.send({
                    code: 100,
                    status: 'FAILED',
                    data: 'OUT OF INDIA'
                });
            }


        } catch (error) {
            console.log(error);
        }
        return countryCode;
    }

    mobilenp = await getCountryCodeNumeric(mobilenp);
});

module.exports = router;