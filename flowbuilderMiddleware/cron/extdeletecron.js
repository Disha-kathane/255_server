const cron = require('node-cron');
const async = require('async');
const extramarksSevices = require('../services/extramarks');
const axios = require('axios');
const { errorLogger, infoLogger } = require('../applogger');

module.exports = cron.schedule('0 0 */3 * * *', async () => {
    try {
        console.log("deleting flag 2 and flag 3 entries after 2 days");
        let DeleteFlag_2Result = extramarksSevices.DeleteFlag_2();
        console.log("Delete Cron", { DeleteFlag_2Result })


    } catch (error) {
        console.log({ error });
        console.log({
            code: 'WA101',
            status: 'FAILED',
            message: error.message,
            data: []
        });
    }

});
















