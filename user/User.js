var mongoose = require('mongoose');  
var UserSchema = new mongoose.Schema({  
  name: {type:String,index:true},
  email: {type:String,index:true},
  password: {type:String,index:true},
  userRoles: {type:String,index:true}
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');