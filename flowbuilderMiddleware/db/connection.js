const mysql2 = require('mysql2');
const config = require('/home/config');

let db_config = {
    host: config.PROD_DB1_HOST,
    port: config.PROD_DB1_PORT,
    user: config.PROD_DB1_USER,
    password: config.PROD_DB1_PSWD,
    database: config.PROD_DB1_NAME,
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};

let db_config1 = {
    host: config.PROD_DB2_HOST,
    port: config.PROD_DB2_PORT,
    user: config.PROD_DB2_USER,
    password: config.PROD_DB2_PSWD,
    database: config.PROD_DB2_NAME,
    multipleStatements: true,
    port: 3306,
    charset: 'utf8mb4_unicode_ci'
};

let dbpool = mysql2.createPool(db_config).promise();
let dbpool1 = mysql2.createPool(db_config1).promise();


module.exports = {dbpool,dbpool1}


// const db = mysql2.createPool({
    
//     host: '10.139.244.211',
//     port: '3306',
//     user: 'root',
//     password: 'zgk4j9lHS7;c',
//     database: 'ezeebot',
//     connectionLimit: 50,
//     waitForConnections: true,
//     charset: 'utf8mb4_unicode_ci'
// });

// db.on('acquire', function (connection) {
//     // console.log('Connection %d acquired', connection.threadId);
// })

// db.on('connection', function (connection) {
//     // console.log('Database Connected');
//     // connection.query('SET SESSION auto_increment_increment=1')
// })

// db.on('enqueue', function () {
//     // console.log('Waiting for available connection slot');
// })

// db.on('release', function (connection) {
//     // console.log('Connection %d released', connection.threadId);
// });

// module.exports = db.promise();


