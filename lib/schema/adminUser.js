var mongoose = require('mongoose');  
var adminUser = new mongoose.Schema({  
  name: {type:String,index:true},
  user_id: {type:String,index:true},
  email: {type:String,index:true},
  password: {type:String,index:true},
  userRoles: {type:[],index:true}
});
mongoose.model('adminUser', adminUser);

module.exports = mongoose.model('adminUser');