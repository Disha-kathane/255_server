const dbpool = require('../../db/wabot');
const axios = require('axios');

let update_wa_templates = async () => {
    let query = null;
    let values = null;
    let rows = null;
    let response = null;
    let templateName = null;
    let config = null;
    let WabaApprovalResponse = null;
    let status = null;
    let status_value = null;
    let category = null;
    let userid = null;
    let whatsapp_business_account_id = null;
    let templateid = null;

    // query = "select userid from ezb_wa_templates where waba_approval_response_id is null and category not in('marketing','utility','authentication') order by rand() limit ?";
    query = "select userid from ezb_wa_templates where waba_approval_response_id is not null and category not in('marketing','utility','authentication') order by rand() limit ?";
    values = [1];
    rows = await dbpool.query(query, values);

    userid = rows[0][0].userid;
    console.log({ userid });

    query = 'select whatsapp_business_account_id from ezb_wa_msg_settings where userid = ? limit ?';
    values = [userid, 1];
    rows = await dbpool.query(query, values);
    if(rows[0][0]!=undefined){
        whatsapp_business_account_id = rows[0][0].whatsapp_business_account_id;
        console.log({ whatsapp_business_account_id });
    
        config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://graph.facebook.com/v16.0/' + whatsapp_business_account_id + '/message_templates?access_token=EAAaSEd3mKP8BO723rdGzJlCXSo92l0d7dZA8E0KewDnbrCF9AziPxiPB4nfzYGgtPv6LuMbMu3IqmrURr8iOBkhAhZCjwgkWLOjTLtJ9kZA9SU3iS2kOggtnTJTPSRNKhPU9uwba3UF2hBgkvP4TrBjacLdctPgZBhnTceZCwLfdCwIj0ZCal5RIrT7X7DlBPO&limit=99999'
        };
        try {
            response = await axios.request(config);
            for (let index = 0; index < response.data.data.length; index++) {
                templateName = response.data.data[index].name;
                query = 'SELECT tempid FROM ezb_wa_templates where temptitle=? AND userid = ?';
                values = [templateName, userid];
                rows = await dbpool.query(query, values);
                console.log('tempid : '+JSON.stringify(rows));
                if (rows[0][0] != undefined) {
                    templateid = rows[0][0].tempid;
                    WabaApprovalResponse = response.data.data[index].id;
                    status = response.data.data[index].status;
                    category = response.data.data[index].category;
                    if (status.toLowerCase() === "REJECTED".toLowerCase()) {
                        console.log(templateName, status);
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
                    query = 'UPDATE ezb_wa_templates  SET status = ?,waba_approval_response_id = ?, category = ?  WHERE tempid = ?';
                    values = [status_value, WabaApprovalResponse, category, templateid];
                    rows = await dbpool.query(query, values);
                    console.log("RECORDS ARE SUCCESSFULLY UPDATED :" + JSON.stringify(rows[0]));
                }else{
    
                }
    
            }
            query = null;
            values = null;
            rows = null;
            response = null;
            templateName = null;
            config = null;
            WabaApprovalResponse = null;
            status = null;
            status_value = null;
            category = null;
    
            setTimeout(() => {
                update_wa_templates();
            }, 10000);
        } catch (error) {
            console.log(error);
            setTimeout(() => {
                update_wa_templates();
            }, 10000);
        }
    }else{

    }
};


update_wa_templates();