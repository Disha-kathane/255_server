const promisePool = require('../../db/wabot');
const mysql = require('mysql2');

let fetch_waba_approval_id_1 = async () => {
    let query = 'SELECT waba_approval_response_id FROM  ezb_wa_templates WHERE status=? AND waba_approval_response_id IS NOT NULL AND userid = ? order by tempid desc limit 1';
    values = [0, 1071];
    let rows = await promisePool.query(query, values);
    return rows;
};

let fetch_waba_approval_id_2 = async () => {
    let query = 'SELECT waba_approval_response_id FROM  ezb_wa_templates WHERE status=? AND waba_approval_response_id IS NOT NULL AND userid = ? order by tempid desc limit 1';
    values = [14, 1071];
    let rows = await promisePool.query(query, values);
    return rows;
};
let fetch_Access_Token = async () => {
    let query = 'SELECT value FROM ezb_system_config where paramname = ?';
    values = ['ACCESS_TOKEN'];
    return access_token = await promisePool.query(query, values);
};

let update_waba_status = async (status, waba_approval_response_id) => {
    let query = 'UPDATE ezb_wa_templates set status=? where waba_approval_response_id=?';
    values = [status, waba_approval_response_id];
    return update_status = await promisePool.query(query, values);
};

module.exports = { fetch_waba_approval_id_1, fetch_Access_Token, update_waba_status, fetch_waba_approval_id_2 };