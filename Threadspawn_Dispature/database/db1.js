var mysql2 = require('mysql2');
const config = require('/home/config');

const db = mysql2.createPool({

    // host: '10.139.244.211',
    // port: '3306',
    // user: 'root',
    // password: 'zgk4j9lHS7;c',
    // database: 'ezeebot',

    host: config.PROD_DB2_HOST,
    port: config.PROD_DB2_PORT,
    user: config.PROD_DB2_USER,
    password: config.PROD_DB2_PSWD,
    database: config.PROD_DB2_NAME,
    
    connectionLimit: 100,
    waitForConnections: true,
    charset: 'utf8mb4_unicode_ci'
});

db.getConnection(function (error, connection) {
    if (error)
        return error;
    return connection;
});

module.exports = db.promise();



