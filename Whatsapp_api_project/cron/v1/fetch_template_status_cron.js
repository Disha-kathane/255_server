const schedule = require('node-schedule');
const mysql = require('mysql2');
const axios = require('axios');
const { fetch_waba_approval_id_1, fetch_Access_Token, update_waba_status, fetch_waba_approval_id_2 } = require('../../services/v1/fetch_template_Services.js');
const { log } = require('console');

const template_status_update = schedule.scheduleJob('*/1 * * * *', async () => {
    let waba_approval_response_id = null;
    try {
        let response_q1 = await fetch_waba_approval_id_1();
        // // console.log(response_q1,"query_1")
        // console.log(response_q1[0][0].waba_approval_response_id, "response_q1[0][0].waba_approval_response_id");
        if (response_q1[0][0] != undefined && response_q1[0][0].waba_approval_response_id != null) {
            waba_approval_response_id = response_q1[0][0].waba_approval_response_id;

            let access_token = await fetch_Access_Token();
            // console.log(access_token, "accesToken")
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: 'https://graph.facebook.com/v16.0/' + waba_approval_response_id + '?access_token=' + access_token[0][0].value + '',
                headers: {}
            };

            let r = await axios.request(config);
            console.log(r, "r");
            let status;
            if (r.data.status.toLowerCase() === "PENDING".toLowerCase()) {
                status = 0;
            }
            else if (r.data.status.toLowerCase() === "REJECTED".toLowerCase()) {
                status = 2;
            }
            else if (r.data.status.toLowerCase() === "APPROVED".toLowerCase()) {
                status = 1;
            }
            else if (r.data.status.toLowerCase() === "FLAGGED".toLowerCase()) {
                status = 5;
            }
            else if (r.data.status.toLowerCase() === "BAD REQUEST".toLowerCase()) {
                status = 3;
            }
            else if (r.data.status.toLowerCase() === "INVALID REQUEST".toLowerCase()) {
                status = 4;
            }
            else if (r.data.status.toLowerCase() === "IN REVIEW".toLowerCase()) {
                status = 6;
            }
            else if (r.data.status.toLowerCase() === "ACTIVE - QUALITY PENDING".toLowerCase()) {
                status = 7;
            }
            else if (r.data.status.toLowerCase() === "ACTIVE - HIGH QUALITY".toLowerCase()) {
                status = 8;
            }
            else if (r.data.status.toLowerCase() === "ACTIVE - MEDIUM QUALITY".toLowerCase()) {
                status = 9;
            }
            else if (r.data.status.toLowerCase() === "ACTIVE - LOW QUALITY".toLowerCase()) {
                status = 10;
            }
            else if (r.data.status.toLowerCase() === "PAUSED".toLowerCase()) {
                status = 11;
            }
            else if (r.data.status.toLowerCase() === "DISABLED".toLowerCase()) {
                status = 12;
            }
            else if (r.data.status.toLowerCase() === "APPEAL REQUESTED".toLowerCase()) {
                status = 13;
            }
            let update_waba_response = await update_waba_status(status, waba_approval_response_id);
            console.log({ message: 'Data is updates sucessfully', data: update_waba_response });
        } else {
            let response_q1 = await fetch_waba_approval_id_2();
            if (response_q1[0][0] != undefined && response_q1[0][0].waba_approval_response_id != null) {
                waba_approval_response_id = response_q1[0][0].waba_approval_response_id;
                let access_token = await fetch_Access_Token();
                // console.log(access_token, "accesToken")
                let config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: 'https://graph.facebook.com/v16.0/' + waba_approval_response_id + '?access_token=' + access_token[0][0].value + '',
                    headers: {}
                };

                let r = await axios.request(config);
                console.log(r, "r");
                let status;
                if (r.data.status.toLowerCase() === "PENDING".toLowerCase()) {
                    status = 0;
                }
                else if (r.data.status.toLowerCase() === "REJECTED".toLowerCase()) {
                    status = 2;
                }
                else if (r.data.status.toLowerCase() === "APPROVED".toLowerCase()) {
                    status = 1;
                }
                else if (r.data.status.toLowerCase() === "FLAGGED".toLowerCase()) {
                    status = 5;
                }
                else if (r.data.status.toLowerCase() === "BAD REQUEST".toLowerCase()) {
                    status = 3;
                }
                else if (r.data.status.toLowerCase() === "INVALID REQUEST".toLowerCase()) {
                    status = 4;
                }
                else if (r.data.status.toLowerCase() === "IN REVIEW".toLowerCase()) {
                    status = 6;
                }
                else if (r.data.status.toLowerCase() === "ACTIVE - QUALITY PENDING".toLowerCase()) {
                    status = 7;
                }
                else if (r.data.status.toLowerCase() === "ACTIVE - HIGH QUALITY".toLowerCase()) {
                    status = 8;
                }
                else if (r.data.status.toLowerCase() === "ACTIVE - MEDIUM QUALITY".toLowerCase()) {
                    status = 9;
                }
                else if (r.data.status.toLowerCase() === "ACTIVE - LOW QUALITY".toLowerCase()) {
                    status = 10;
                }
                else if (r.data.status.toLowerCase() === "PAUSED".toLowerCase()) {
                    status = 11;
                }
                else if (r.data.status.toLowerCase() === "DISABLED".toLowerCase()) {
                    status = 12;
                }
                else if (r.data.status.toLowerCase() === "APPEAL REQUESTED".toLowerCase()) {
                    status = 13;
                }
                let update_waba_response = await update_waba_status(status, waba_approval_response_id);
                console.log({ message: 'Data is updates sucessfully', data: update_waba_response });

                console.log('No records found');
            }

        }
    } catch (error) {
        console.log('Error block Nishant : ' + error, waba_approval_response_id);
        console.log(error.message);
        let update_waba_response = await update_waba_status(14, waba_approval_response_id);
        console.log({ message: 'Data is updates sucessfully in Error Block', data: update_waba_response });
    }

});