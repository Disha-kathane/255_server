var mysql2 = require('mysql2');
const config = require('/home/config');

const connection = mysql2.createPool({
    
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

    connectionLimit: 50,
    waitForConnections: true,
    charset: 'utf8mb4_unicode_ci'
});

connection.getConnection(function (error, connection) {
    if (error)
        return error;
    return connection;
});

connection.on('acquire', function (connection) {
    // console.log('Connection %d acquired', connection.threadId);
})

connection.on('connection', function (connection) {
    // console.log('Database Connected');
    // connection.query('SET SESSION auto_increment_increment=1')
})

connection.on('enqueue', function () {
    // console.log('Waiting for available connection slot');
})

connection.on('release', function (connection) {
    // console.log('Connection %d released', connection.threadId);
});

module.exports = connection.promise();
