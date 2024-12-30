const mysql2 = require('mysql2');

const db = mysql2.createPool({
    host: '10.139.244.211',
    port: '3306',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'ezeebot',
    connectionLimit: 50,
    waitForConnections: true,
    charset: 'utf8mb4_unicode_ci'
});

const selectQuery = `SELECT CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(wabapayload, '"to":"', -1), '"', 1) AS CHAR) AS extracted_number FROM 
    ezb_message_sent_master WHERE userid = ? AND wabapayload LIKE '%Microsoft.Extensions.Configuration.ConfigurationSection%'`;


const updateQuery = `UPDATE ezb_message_sent_master SET mobileno = ? WHERE id = ?`;

const getQuery = `SELECT id FROM ezb_message_sent_master WHERE id = 3214959039 AND userid = ? AND wabapayload LIKE '%Microsoft.Extensions.Configuration.ConfigurationSection%'`;


const fetchDataAndUpdate = async () => {
    try {
        const data = await db.promise().query(getQuery, [1230]);
        console.log("get data id 1", data[0].length);

        for (let index = 0; index < data[0].length; index++) {
            console.log("get data id 1", data[0][index].id);

            const [rows] = await db.promise().query(selectQuery,[1230]);
            // let extractedNumber = rows[index].extracted_number.toString('utf8')
            const extractedNumber = rows[index].extracted_number.replace(/[^0-9]/g, '');
            try {
                // Perform the database update
                await db.promise().query(updateQuery, [extractedNumber, data[0][index].id]);
                console.log(`Updated row with mobileno: ${extractedNumber}`);
            } catch (err) {
                console.error('Error updating data:', err);
            }

        }


    } catch (err) {
        console.error('Error selecting data:', err);
        db.end();
    }
};
fetchDataAndUpdate();
