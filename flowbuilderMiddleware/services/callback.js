let { dbpool } = require('../db/connection');


let fetchcallbackUrl = async (userid) => {
    let query = 'SELECT callback_url, methodtype FROM  ezb_custome_callback_master WHERE userid = ? order by id desc';
    let value = [userid];
    let [result] = await dbpool.query(query, value);
    return result;
}

module.exports = {
    fetchcallbackUrl
}