const express = require('express')
const app = express()
var pg = require('pg')
var format = require('pg-format')
var config = {
    user: 'postgres',
    database: 'lawyerapp',
    password: "multipz@123",
    max: 10,
    idleTimeoutMillis: 30000
}
app.listen(3000, function () {
    console.log('listening on 3000')
})

var pool = new pg.Pool(config)
/*var myClient*/
var results = []

/*pool.connect(function (err, client, done) {
    if (err) console.log(err)
    myClient = client
    var data = {
        age : 25
    };
    var ageQuery = format('SELECT * from numbers WHERE age = %L', [data.age])
    myClient.query(ageQuery, function (err, result) {
        if (err) {
            console.log(err)
        }
        console.log(result.rows)
    })
})*/

pool.connect(function (err, client, done) {
    if (err) console.log(err);
    results = [];
    var data = {
        age : 25
    };
    client.query("INSERT INTO numbers(age) values($1)", [data.age]);
    var query = client.query(format("SELECT * FROM numbers ORDER BY numbers_id ASC"));
    query.on('row', function (row) {
        results.push(row);
    });
    query.on('end', function () {
        client.end();
        /*return res.json(results);*/
    });
});

pool.connect(function (err, client, done) {
    if (err) console.log(err);
    results = [];
    var data = {
        numbers_id : 4
    };
    client.query("update numbers set age=10 where numbers_id=$1", [data.numbers_id]);
    var query = client.query(format("SELECT * FROM numbers ORDER BY numbers_id ASC"));
    query.on('row', function (row) {
        results.push(row);
    });
    query.on('end', function () {
        client.end();
        /*return res.json(results);*/
    });
});

pool.connect(function (err, client, done) {
    if (err) console.log(err);
    results = [];
    var data = {
        numbers_id : 5
    };
    client.query("delete from numbers where numbers_id=$1", [data.numbers_id]);
    var query = client.query(format("SELECT * FROM numbers ORDER BY numbers_id ASC"));
    query.on('row', function (row) {
        results.push(row);
    });
    query.on('end', function () {
        client.end();
        /*return res.json(results);*/
    });
});