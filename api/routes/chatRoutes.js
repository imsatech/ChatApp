'use strict';
module.exports = function(app) {
  var chatList = require('../controllers/chatController');

  // chatList Routes
  app.route('/userList').get(chatList.list_all_tasks);
  app.route('/sendmsgdata').post(chatList.send_msg_data);
  app.route('/product_add').post(chatList.product_add);
  app.route('/getuser').get(chatList.getuser);
};
