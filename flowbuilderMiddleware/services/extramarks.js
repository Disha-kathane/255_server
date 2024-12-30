const pool = require('../db/extramarks');
// const ezeepool = require('../db/connection');
const { dbpool, dbpool1 } = require('../db/connection');



const InsertData = async (mobileno, contextid, nextnodeid) => {
    let query = "INSERT INTO ext_schedule_cta (mobile_no,context_id,node_id,createdate) VALUES (?,?,?,Now())";
    let values = [mobileno, contextid, nextnodeid];
    let [result] = await pool.query(query, values);
    return result;
};



const InsertCallbackData = async (wabanumber, mobileno, messageid, type, contextid) => {
    // console.log({ wabanumber, mobileno, contextid, type, messageid })
    let query4 = "Select count(1) AS total FROM callback_message_entries where mobileno=? and flag=1 AND type =1";
    let values4 = [mobileno];
    let [result4] = await pool.query(query4, values4);
    let count = result4[0].total;
    if (count > 0) {
        let query5 = "UPDATE callback_message_entries SET flag = 4 WHERE mobileno=? AND type = 1 AND flag =1";
        let values5 = [mobileno];
        let [result5] = await pool.query(query5, values5);
    }
    //console.log({ contextid })
    if (contextid == null) {
        let query1 = "INSERT INTO callback_message_entries (wabanumber,mobileno,contextid,type,messageid,createdate, flag, targetdate) VALUES (?,?,?,?,?,Now(),?,DATE_ADD(NOW(), INTERVAL 2 DAY))";
        // let query1 = "INSERT INTO callback_message_entries (wabanumber,mobileno,contextid,type,messageid,createdate, flag, targetdate) VALUES (?,?,?,?,?,DATE_ADD( NOW(), INTERVAL -2 DAY),?,Now())";
        let values1 = [wabanumber, mobileno, contextid, type, messageid, 1];
        let [result1] = await pool.query(query1, values1);

    }
    else {
        let query3 = "INSERT INTO callback_message_entries (wabanumber,mobileno,contextid,type,messageid,createdate, flag, targetdate) VALUES (?,?,?,?,?,Now(),?,DATE_ADD(NOW(), INTERVAL 1 DAY))";
        // let query3 = "INSERT INTO callback_message_entries (wabanumber,mobileno,contextid,type,messageid,createdate, flag, targetdate) VALUES (?,?,?,?,?,DATE_ADD(NOW(), INTERVAL -1 DAY),?,Now())";
        let values3 = [wabanumber, mobileno, contextid, type, messageid, 1];
        let [result3] = await pool.query(query3, values3);
    }



    let query2 = "UPDATE callback_message_entries SET flag = ? WHERE messageid = (SELECT msgid FROM last_msg_master WHERE msgid = ? AND issessionend = ?)";
    let values2 = [3, messageid, 3];
    let [result2] = await pool.query(query2, values2);

    return result2;

};


const InsertWebhookData = async (mobileno, messageid, type, contextid) => {
    let query = "INSERT INTO callback_message_entries (mobileno,contextid,type,messageid,createdate) VALUES (?,?,?,?,Now())";
    let values = [mobileno, contextid, type, messageid];
    let [result] = await pool.query(query, values);
    return result;
};

const FetchUserid = async (wabanumber) => {
    let query = "SELECT userid FROM ezb_wa_msg_settings WHERE wanumber = ?";
    let values = ["+" + wabanumber];
    let [result] = await dbpool.query(query, values);
    return result;
};


const FetchNextNodeId = async (mobileno, userid) => {
    let query = "SELECT id, next_message_id ,current_message_id FROM ezb_flowbuilder_session WHERE mobileno= ? AND is_session_end = 0 AND userid = ?";
    let values = [mobileno, userid];
    let [result] = await dbpool.query(query, values);
    return result;
};



const FetchNodeId = async () => {
    let query = "SELECT MAX(node_id) AS nodeid FROM `ext_schedule_cta`";
    let [result] = await pool.query(query);
    return result;
};



// let FetchTemplateId = async (nodeid) => {
//     let query = "SELECT templateid FROM `template_master` WHERE node_id = ?";
//     let values = [nodeid];
//     let [result] = await pool.query(query, values);
//     return result;
// };


const CheckContextId = async (mobileno) => {
    let query = "SELECT * FROM `callback_message_entries`  WHERE id = (SELECT MAX(id) FROM `callback_message_entries` where type = 1 AND flag = 1 AND mobileno =?)";
    let values = [mobileno]
    let [result] = await pool.query(query, values);
    return result;
};


const SetTargetDate = async (targetdate, mobileno, id) => {
    let query = "UPDATE callback_message_entries SET targetdate = DATE_ADD(?, INTERVAL 2 DAY) WHERE mobileno = ? AND id =? ";
    let values = [targetdate, mobileno, id];
    let [result] = await pool.query(query, values);
    return result;
};


const CheckMobileNo = async (mobileno) => {
    let query = "SELECT COUNT(mobileno) as c FROM `callback_message_entries` WHERE mobileno = ?";
    let values = [mobileno];
    let [result] = await pool.query(query, values);
    return result;
};


const ReplaceCallbackData = async (mobileno, messageid, type, contextid) => {
    let query = "INSERT INTO callback_message_entries (mobileno,contextid,type,messageid,createdate, flag, targetdate) VALUES (?,?,?,?,Now(),?,DATE_ADD(NOW(), INTERVAL 1 DAY)) WHERE mobileno =?";
    let values = [contextid, mobileno, type];
    let [result] = await pool.query(query, values);
    return result;
};


const SelectFlagOne = async () => {
    let query = "SELECT * FROM `callback_message_entries` WHERE flag = 1";
    let [result] = await pool.query(query);
    // console.log({ result });
    return result;
};


const FetchCurrentTempName = async (messageid) => {
    let query = "SELECT wabapayload FROM ezb_message_sent_master WHERE messageid = ?";
    let values = [messageid];
    let [result] = await dbpool1.query(query, values);
    // console.log(result);
    return result;
};


const FetchCurrentTemplateId = async (tempname) => {
    let query = "SELECT * FROM ezb_wa_templates where temptitle = ?";
    let values = [tempname];
    let [result] = await dbpool.query(query, values);
    return result;

};


// let inserttempid = async (messageid, tempid) => {
//     let query = "update callback_message_entries  set current_templateid = ? where messageid = ?";
//     let values = [tempid, messageid];
//     let [result] = await pool.query(query, values);
//     return result;

// };



const FetchNextTempId = async (tempid) => {
    // console.log({ tempid });
    let query = "select next_templateid, issessionend from template_master where current_templateid = ?";
    let values = [tempid];
    let [result] = await pool.query(query, values);
    // console.log({ result });
    return result;
};


const getTemplateData = async (tempid) => {
    let query = "SELECT * FROM ezb_wa_templates where tempid = ?";
    let values = [tempid];
    let [result] = await dbpool.query(query, values);
    return result;
};


const SelectMediaUrl = async (tempid) => {
    let query = "SELECT * FROM template_master where next_templateid = ?";
    let values = [tempid];
    let [result] = await pool.query(query, values);
    return result;
};


const updateFlag = async (messagid) => {
    // console.log({ messagid });
    let query = "UPDATE callback_message_entries SET flag = 2 WHERE messageid = ?";
    let values = [messagid];
    let [result] = await pool.query(query, values);
    // console.log("updated successfully");

    return result;
};

const updateFlag_3 = async (messagid) => {
    let query = "UPDATE callback_message_entries SET flag = 3 WHERE messageid = ?";
    let values = [messagid];
    let [result] = await pool.query(query, values);
    return result;
};

const lastsession = async (messagid) => {
    let query = "INSERT INTO last_msg_master (msgid,issessionend) VALUES (?,?)";
    let values = [messagid, 3];
    let [result] = await pool.query(query, values);
    return result;
};

const SelectContexIdData = async (mobileno) => {
    let query = "SELECT * FROM `callback_message_entries` WHERE id = (SELECT MAX(id) FROM `callback_message_entries` where type = 2 AND flag =1 AND mobileno = ?)";
    let values = [mobileno];
    let [result] = await pool.query(query, values);
    return result;
};


const ReplaceTemplateIdData = async (id, contextid) => {
    let query = "UPDATE callback_message_entries SET targetdate  = DATE_ADD(NOW(), INTERVAL 1 DAY) WHERE id = ? AND contextid = ?";
    let values = [id, contextid];
    let [result] = await pool.query(query, values);
    return result;

}


const GetMobileNo = async () => {
    let query = "SELECT DISTINCT  mobileno FROM callback_message_entries WHERE TIMESTAMPDIFF(MINUTE,createdate,NOW()) > 1 AND flag=1";
    let [result] = await pool.query(query);
    // console.log({ result })
    return result;

}


const DeleteFlag_2 = async () => {
    let query = "DELETE FROM `callback_message_entries` WHERE flag IN (2, 3, 4) AND NOW() >= DATE_ADD(targetdate, INTERVAL 2 DAY)";
    // let query = "DELETE FROM `callback_message_entries`WHERE flag IN (2, 3, 4) AND NOW() >= targetdate";
    let [result] = await pool.query(query);
    return result;
}

module.exports = {
    InsertData,
    InsertCallbackData,
    FetchUserid,
    CheckContextId,
    SetTargetDate,
    CheckMobileNo,
    ReplaceCallbackData,
    SelectFlagOne,
    FetchCurrentTempName,
    FetchNextTempId,
    FetchCurrentTemplateId,
    getTemplateData,
    SelectMediaUrl,
    updateFlag,
    updateFlag_3,
    lastsession,
    FetchNodeId,
    SelectContexIdData,
    ReplaceTemplateIdData,
    GetMobileNo,
    DeleteFlag_2
};