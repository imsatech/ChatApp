'use strict';
var connection = require('../../dbconnection');
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '_' + file.originalname);
    }
});
var upload = multer({storage: storage}).single('img');

exports.list_all_tasks = function (req, res) {
    connection.query('SELECT * FROM user', function (err, rows, fields) {
        if (err) {
            throw err;
        } else {
            res.send(rows);
        }
    });
};


exports.send_msg_data = function (req, res) {

    try {
        upload(req, res, function (err) {
            // console.log("body", req.body);
            //console.log("file",req.file.filename);
            if (err) {
                res.send("Error uploading file.");
            }
            if (!("filename" in req.body)) {
                if (typeof req.file != "undefined") {
                    // console.log(req.file);
                    if ("filename" in req.file) {
                        var d = {'status': 1, 'name': req.file.filename};
                        // console.log(d);
                        res.send(d);
                    } else {
                        try {
                            var d = {'status': 0, 'msg': "Image Not Proper"};
                            console.log(d);
                            res.send(d);
                        } catch (err) {
                            console.log("Got Error");
                            return;
                        }
                    }
                } else {
                    try {
                        var d = {'status': 0, 'msg': "Image Not Proper"};
                        console.log(d);
                        res.send(d);
                    } catch (err) {
                        console.log("Got Error");
                        return;
                    }
                }
            } else {
                try {
                    var d = {'status': 0, 'msg': "Image Not Proper"};
                    console.log(d);
                    res.send(d);
                } catch (err) {
                    console.log("Got Error");
                    return;
                }
            }
        });
    } catch (err) {
        console.log("Got Error");
        return;
    }
};

exports.getuser = function (req, res) {
    connection.query('select * from user where status="A"',
        function (err, result) {
            if (!err) {
                res.status(200).send(JSON.stringify(result));
            } else {
                res.status(400).send(err);
            }
        });
};

exports.product_add = function (req, res) {
    var response = [];

    if (
        typeof req.body.name !== 'undefined' &&
        typeof req.body.price !== 'undefined' &&
        typeof req.body.imageUrl !== 'undefined'
    ) {
        var name = req.body.name, price = req.body.price, imageUrl = req.body.imageUrl;

        connection.query('INSERT INTO nd_products (product_name, product_price, product_image) VALUES (?, ?, ?)',
            [name, price, imageUrl],
            function (err, result) {
                if (!err) {

                    if (result.affectedRows != 0) {
                        response.push({'result': 'success'});
                    } else {
                        response.push({'msg': 'No Result Found'});
                    }

                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).send(JSON.stringify(response));
                } else {
                    res.status(400).send(err);
                }
            });

    } else {
        response.push({'result': 'error', 'msg': 'Please fill required details'});
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(response));
    }
};
