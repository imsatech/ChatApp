var socket = require('socket.io');
var bodyParser = require('body-parser');
var express = require('express');
var _ = require('underscore');
var app = express();
var port = process.env.PORT || 3000;
var connection = require('./dbconnection');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
var routes = require('./api/routes/chatRoutes');
routes(app);
var server = require('http').createServer(app);
var io = socket.listen(server);

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

io.on('connection', function (socket) {
    console.log('new user connected');


    // connection.query('SELECT * FROM user', function (err, rows, fields) {
    //     _.each(rows, function (one) {
    //         console.log(one);
    //         var label = "Label_" + one.id;
    //     });
    // });

    socket.on('UserList', function (data) {
        connection.query('SELECT * FROM user', function (err, rows, fields) {
            if (err) {
                socket.emit('UserList'+data.reciverid, {
                    'status': '0',
                    'data': err
                });
            } else {
                socket.emit('UserList'+data.reciverid, {
                    'status': '1',
                    'data': rows
                });
            }
        });
    });

    socket.on('adduser', function (data) {
        console.log(data.name);
        var userdata = {
            user_id: 0,
            name: data.name,
            img: data.img
        };
        connection.query('INSERT INTO user SET ?', userdata,
            function (err, result) {
                console.log(result);
            });
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
})
;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(function (req, res) {
    res.status(404).send({
        url: req.originalUrl + ' not found'
    })
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});
