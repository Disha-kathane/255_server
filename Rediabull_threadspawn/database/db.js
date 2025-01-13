var mysql2 = require('mysql2');

const db = mysql2.createPool({

    host: '10.139.244.211',
    port: '3306',
    user: 'root',
    password: 'zgk4j9lHS7;c',
    database: 'ezeebot',
    connectionLimit: 250,
    waitForConnections: true,
    charset: 'utf8mb4_unicode_ci'
});

db.getConnection(function (error, connection) {
    if (error)
        return error;
    return connection;
});

module.exports = db.promise();



