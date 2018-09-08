var connection = require('./dbconnection');
var dateFormat = require('dateformat');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
const axios = require('axios');
var port = process.env.PORT || 8000;
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use("/uploads",express.static(__dirname + '/uploads'));
var routes = require('./api/routes/chatRoutes');
routes(app);

var user = {};
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

io.sockets.on('connection', function (socket) {

    socket.on("request", function (res) {
        try {
            switch (res.action) {
                case "Connection":
                    Connection(res.data);
                    break;
                case "GetChatUserList":
                    getUserList(res.data);
                    break;
                case "GetChatMsg":
                    GetChatMsg(res.data);
                    break;
                case "Typing":
                    Typing(res.data);
                    break;
                case "SendMsg":
                    SendMsg(res.data);
                    break;
                case "Demorclick":
                    Demorclick(res.data);
                    break;
                case "Demouclick":
                    Demouclick(res.data);
                    break;
                default:
                    console.log("default case is call");
            }
        } catch (err) {
            var response = {
                "action": "ERROR",
                data: {
                    "code": 500,
                    "msg": "Error In request " + err
                }
            };
            socket.emit("response", response);
        }
    });

    socket.on('disconnect', function () {
        delete user[socket.nickname];
        connection.query('UPDATE user SET login_status = 0 WHERE user_id = ?', [socket.nickname])
    });

    function Connection(data) {
        if (data.userid != "") {
            delete user[data.userid];
            if (!(data.userid in user)) {
                socket.nickname = data.userid;
                user[data.userid] = socket;
                console.log("Connection Create " + data.userid);
            }

            connection.query('UPDATE user SET login_status = 1 WHERE user_id = ?', [data.userid]);

            var response = {
                "action": "Connection",
                data: {
                    "code": 812,
                    "msg": "Success"
                }
            };
            socket.emit("response", response);
        } else {
            var response = {
                "action": "ERROR",
                data: {
                    "code": 812,
                    "msg": "Error In request 'Cannot Get User Id'"
                }
            };
            socket.emit("response", response);
        }
    }

    function getUserList(data)  {
console.log(data);
        if (!(data.userid in user)) {
            socket.nickname = data.userid;
            user[data.userid] = socket;
            console.log("Connection Create again at " + data.userid);
        }

        if (data.userid != "") {
            connection.query('select * from user where user_id in (select if(sid=' + data.userid + ',rid,sid) friend_it from friends_list WHERE (sid=' + data.userid + ' or rid=' + data.userid + ') and friend_status="A")', function (err, rows, fields) {
                if (err) {
                    var response = {
                        "action": "ERROR",
                        data: {
                            "code": 500,
                            "msg": "Error In request " + err
                        }
                    };
                    socket.emit("response", response);
                } else {
                    if (rows.length == 0) {
                        socket.emit('response', {
                            "action": "GetChatUserList",
                            'status': '0',
                            'data': rows
                        });
                    } else {
                        socket.emit('response', {
                            "action": "GetChatUserList",
                            'status': '1',
                            'data': rows
                        });
                    }
                }
            });
        } else {
            var response = {
                "action": "ERROR",
                data: {
                    "code": 812,
                    "msg": "Error In request 'Cannot Get User Id'"
                }
            };
            socket.emit("response", response);
        }
    }

    function GetChatMsg(data) {
        // if (!(data.reciverid in user)) {
        //     socket.nickname=data.reciverid;
        //     user[data.reciverid] = socket;
        //     console.log("Connection Create again at end user "+data.reciverid);
        // }
        if (!(data.userid in user)) {
            socket.nickname = data.userid;
            user[data.userid] = socket;
            console.log("Connection Create again at " + data.userid);
        }
        if (data.userid != "") {
            if (data.reciverid != "") {
                connection.query('UPDATE user SET msg_status = 1 WHERE user_id = ?', [data.userid])
                connection.query('select fm.sender_id,if(fm.type="Media",CONCAT("http://192.168.0.89:8000/uploads/",fm.msg),fm.msg) msg,fm.date,fm.type from frds_msg fm LEFT JOIN user u ON u.user_id=fm.sender_id LEFT JOIN user u1 ON u1.user_id=fm.receiver_id where  fm.clear=0 and fm.sender_id in (' + data.userid + ',' + data.reciverid + ') and fm.receiver_id in (' + data.userid + ',' + data.reciverid + ') order by frds_msg_id asc', function (err, rows, fields) {
                    if (err) {
                        var response = {
                            "action": "ERROR",
                            data: {
                                "code": 500,
                                "msg": "Error In request " + err
                            }
                        };
                        socket.emit("response", response);
                    } else {
                        if (rows.length == 0) {
                            socket.emit('response', {
                                "action": "GetChatMsg",
                                'status': '0',
                                'data': rows
                            });
                        } else {
                            socket.emit('response', {
                                "action": "GetChatMsg",
                                'status': '1',
                                'data': rows
                            });
                        }
                    }
                });
            } else {
                var response = {
                    "action": "ERROR",
                    data: {
                        "code": 812,
                        "msg": "Error In request 'Cannot Get Reciver Id'"
                    }
                };
                socket.emit("response", response);
            }
        } else {
            var response = {
                "action": "ERROR",
                data: {
                    "code": 812,
                    "msg": "Error In request 'Cannot Get User Id'"
                }
            };
            socket.emit("response", response);
        }
    }

    function Typing(data) {
        if (data.userid != "") {
            if (data.receiverid != "") {
                if (data.typestatus != "") {
                    if (user[data.receiverid]) {
                        user[data.receiverid].emit('response', {
                            "action": "Typing",
                            'status': '0',
                            'data': {
                                'typeuserid': data.userid,
                                'typesendid': data.receiverid,
                                'typestatus': data.typestatus
                            }
                        });
                    } else {
                        socket.nickname = data.receiverid;
                        user[data.receiverid] = {'ori_socket': socket, 'socket_id': socket.id};
                        user[data.receiverid].emit('response', {
                            "action": "Typing",
                            'status': '0',
                            'data': {
                                'typeuserid': data.userid,
                                'typesendid': data.receiverid,
                                'typestatus': data.typestatus
                            }
                        });
                    }
                } else {
                    var response = {
                        "action": "ERROR",
                        data: {
                            "code": 812,
                            "msg": "Error In request 'Cannot Get Type Status'"
                        }
                    };
                    socket.emit("response", response);
                }
            } else {
                var response = {
                    "action": "ERROR",
                    data: {
                        "code": 812,
                        "msg": "Error In request 'Cannot Get Receiver Id'"
                    }
                };
                socket.emit("response", response);
            }
        } else {
            var response = {
                "action": "ERROR",
                data: {
                    "code": 812,
                    "msg": "Error In request 'Cannot Get Sender Id'"
                }
            };
            socket.emit("response", response);
        }
    }

    function SendMsg(data) {

        // if (!(data.receiverid in user)) {
        //     socket.nickname=data.receiverid;
        //     user[data.receiverid] = socket;
        //     console.log("Connection Create again at send msg end user "+data.receiverid);
        // }

        if (!(data.userid in user)) {
            socket.nickname = data.userid;
            user[data.userid] = socket;
            console.log("Connection Create again at send msg " + data.userid);
        }

        if (data.userid != "") {
            if (data.receiverid != "") {
                if (data.msg != "") {
                    if (data.type != "") {
                        var datetime = new Date();
                        datetime = dateFormat(datetime, "yyyy-mm-d h:MM:ss");
                        var indata = {
                            sender_id: data.userid,
                            receiver_id: data.receiverid,
                            msg: data.msg,
                            date: datetime,
                            type: data.type
                        };
                        connection.query('insert into frds_msg SET ?', indata, function (err, rows, fields) {
                            if (err) {
                                var response = {
                                    "action": "ERROR",
                                    data: {
                                        "code": 500,
                                        "msg": "Error In request " + err
                                    }
                                };
                                socket.emit("response", response);
                            } else {

                                io.sockets.emit('response', {
                                    "action": "SendMsg",
                                    'status': '0',
                                    'data': {'sender_id': data.userid, 'receiver_id': data.receiverid, 'msg': data.msg,'type':data.type}
                                });
                                /*if (data.receiverid in user) {

                                }*/
                            }
                        });
                    } else {
                        var response = {
                            "action": "ERROR",
                            data: {
                                "code": 812,
                                "msg": "Error In request 'Cannot Get Msg Type Data'"
                            }
                        };
                        socket.emit("response", response);
                    }
                } else {
                    var response = {
                        "action": "ERROR",
                        data: {
                            "code": 812,
                            "msg": "Error In request 'Cannot Get Msg Data'"
                        }
                    };
                    socket.emit("response", response);
                }
            } else {
                var response = {
                    "action": "ERROR",
                    data: {
                        "code": 812,
                        "msg": "Error In request 'Cannot Get Receiver Id'"
                    }
                };
                socket.emit("response", response);
            }
        } else {
            var response = {
                "action": "ERROR",
                data: {
                    "code": 812,
                    "msg": "Error In request 'Cannot Get Sender Id'"
                }
            };
            socket.emit("response", response);
        }
    }

    function Demouclick(data) {
        socket.nickname = data.userid;
        user[socket.nickname] = {'ori_socket': socket, 'socket_id': socket.id};
    }

    function Demorclick(data) {
        console.log(data);
        if (data.reciverid == "" || data.userid == "") {

        } else {
            socket.nickname = data.reciverid;

            // console.log(user[data.userid].socket_id);
            // console.log(user[data.userid].ori_socket);

            connection.query('SELECT * FROM user', function (err, rows, fields) {
                if (err) {
                    var response = {
                        "action": "ERROR",
                        data: {
                            "code": 500,
                            "msg": "Error In request " + err
                        }
                    };
                    socket.emit("response", response);
                } else {
                    user[socket.nickname].ori_socket.emit('response', {
                        'status': '1',
                        'data': rows
                    });
                }
            });
        }
    }

});

var phpScriptPath = "http://localhost:88/chatApi/voip.php";
app.get('/voip', function (req, res) {
    axios.get(phpScriptPath+'?dt='+req.query.dt).then(response => {
        console.log(response.data);
        res.status(404).send({
            url: response.data
        })
    }).catch(error => {
        console.log(error);
        res.status(812).send({
            url: 'Error not found'
        });
    });
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/chat', function (req, res) {
    res.sendFile(__dirname + '/chat.html');
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