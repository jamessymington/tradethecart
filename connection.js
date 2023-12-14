//MAMP
let mysql = require('mysql2');
let db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'pokemon_js',
    port: '8889'
});

db.connect((err) => {
    if (err) throw err;
});

module.exports = db;