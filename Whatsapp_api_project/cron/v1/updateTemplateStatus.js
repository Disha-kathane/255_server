const dbpool = require('../../db/wabot');
const axios = require('axios');

let update_wa_templates = async () => {
    let query = null;
    let values = null;
    let rows = null;
    let response = null;
    let templateName = null
    let config = null;
    let WabaApprovalResponse = null;
    let status = null;
    let status_value = null;
    let category = null;
    config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://graph.facebook.com/v16.0/1003072436727643/message_templates?access_token=EAAaSEd3mKP8BO723rdGzJlCXSo92l0d7dZA8E0KewDnbrCF9AziPxiPB4nfzYGgtPv6LuMbMu3IqmrURr8iOBkhAhZCjwgkWLOjTLtJ9kZA9SU3iS2kOggtnTJTPSRNKhPU9uwba3UF2hBgkvP4TrBjacLdctPgZBhnTceZCwLfdCwIj0ZCal5RIrT7X7DlBPO&limit=99999',
        headers: {
            'Cookie': 'ps_l=0; ps_n=0'
        }
    };
    try {
        response = await axios.request(config);
        for (let index = 0; index < response.data.data.length; index++) {
            templateName = response.data.data[index].name;
            query = 'SELECT temptitle FROM ezb_wa_templates where temptitle=? AND userid = ?';
            values = [templateName, 1071];
            rows = await dbpool.query(query, values);
            WabaApprovalResponse = response.data.data[index].id;
            status = response.data.data[index].status;
            category = response.data.data[index].category;
            if (rows[0][0] != undefined) {
                if (status.toLowerCase() === "REJECTED".toLowerCase()) {
                    console.log(status);
                    status_value = 2;
                }
                else if (status.toLowerCase() === "APPROVED".toLowerCase()) {
                    status_value = 1;
                }
                else if (status.toLowerCase() === "FLAGGED".toLowerCase()) {
                    status_value = 5;
                }
                else if (status.toLowerCase() === "BAD REQUEST".toLowerCase()) {
                    status_value = 3;
                }
                else if (status.toLowerCase() === "INVALID REQUEST".toLowerCase()) {
                    status_value = 4;
                }
                else if (status.toLowerCase() === "IN REVIEW".toLowerCase()) {
                    status_value = 6;
                }
                else if (status.toLowerCase() === "ACTIVE - QUALITY PENDING".toLowerCase()) {
                    status_value = 7;
                }
                else if (status.toLowerCase() === "ACTIVE - HIGH QUALITY".toLowerCase()) {
                    status_value = 8;
                }
                else if (status.toLowerCase() === "ACTIVE - MEDIUM QUALITY".toLowerCase()) {
                    status_value = 9;
                }
                else if (status.toLowerCase() === "ACTIVE - LOW QUALITY".toLowerCase()) {
                    status_value = 10;
                }
                else if (status.toLowerCase() === "PAUSED".toLowerCase()) {
                    status_value = 11;
                }
                else if (status.toLowerCase() === "DISABLED".toLowerCase()) {
                    status_value = 12;
                }
                else if (status.toLowerCase() === "APPEAL REQUESTED".toLowerCase()) {
                    status_value = 13;
                };
                console.log(WabaApprovalResponse, status_value, category + "Data");
                query = 'UPDATE ezb_wa_templates  SET status = ?,waba_approval_response_id = ?, category = ?  WHERE temptitle = ?'
                values = [status_value, WabaApprovalResponse, category, templateName];
                rows = await dbpool.query(query, values);
                console.log("RECORDS ARE SUCCESSFULLY UPDATED :"+JSON.stringify(rows[0]));
            }

        }
        query = null;
        values = null;
        rows = null;
        response = null;
        templateName = null
        config = null;
        WabaApprovalResponse = null;
        status = null;
        status_value = null;
        category = null;
    } catch (error) {
        console.log(error.message);
    }



}
update_wa_templates();