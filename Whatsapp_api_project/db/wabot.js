const mysql2 = require('mysql2');
const config = require('/home/config');
// const db = mysql2.createPool({
//     database: 'ezeebot',
//     host: '10.139.244.156',
//     user: 'root',
//     password: 'P!Nk%#@k@RQ0K3',
//     port: 3306,
//     connectionLimit: 50,
//     waitForConnections: true,
//     charset : 'utf8mb4_0900_ai_ci'
// });

var db = mysql2.createPool({
    // host: '10.139.244.211',
    // port: '3306',
    // user: 'root',
    // password: 'zgk4j9lHS7;c',
    // database: 'ezeebot',

    host: config.PROD_DB1_HOST,
    port: config.PROD_DB1_PORT,
    user: config.PROD_DB1_USER,
    password: config.PROD_DB1_PSWD,
    database: config.PROD_DB1_NAME,


    connectionLimit: 100,
    waitForConnections: true,
    charset: 'utf8mb4_unicode_ci'
});

db.on('acquire', function (connection) {
    // console.log('Connection %d acquired', connection.threadId);
});

db.on('connection', function (connection) {
    // console.log('Database Connected');
    // connection.query('SET SESSION auto_increment_increment=1')
});

db.on('enqueue', function () {
    // console.log('Waiting for available connection slot');
});

db.on('release', function (connection) {
    // console.log('Connection %d released', connection.threadId);
});

module.exports = db.promise();