var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    name : String,
    password : String,
    email : String,
    state : String
});
var userModel = mongoose.model('users',UserSchema);
function User(user){
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
    this.state = user.state;
};
module.exports = User;
/* save user info in mongodb*/
User.prototype.save = function save(callback){
    var user = {
        name: this.name,
        password: this.password,
        email : this.email,
        state : this.state
    };
  var userEntity = new userModel({name: this.name,password: this.password,email:this.email,state:this.state});
  userEntity.save(function(err){
    callback(err, user);
  });
};
/* get a user by email*/
User.get = function get(email, callback) {
  userModel.findOne({email : email},function(err,doc){
    //按email查找用户,findone函数中｛email:email｝第一个email是数据库的key值，第二个email是参数
    if(doc){
      //封装文档为user对象
      var user = new User(doc);
      callback(err, user);
       }else{
      callback(err, null);
       }
  });
};
/* get all state user */
User.getUsersByState = function getUsersByState(state, callback) {
  userModel.find({state : state},function(err,docs){
        if(docs){
      //封装文档为user对象
        var users = [];
        docs.forEach(function(doc, index){
            var user = new User(doc);
            users.push(user);
        });
      callback(err, users);
       }else{
      callback(err, null);
       }
  });
};

/* change state user by email*/
User.changeState = function changeState(email,state, callback) {
  userModel.findOne({email : email},function(err,doc){
    //按email查找用户,findone函数中｛email:email｝第一个email是数据库的key值，第二个email是参数
    if(doc){
      //封装文档为user对象
      doc.state = state;
      doc.save(function(err){
        if(err){callback(err,null)}        
        });
      callback(err, doc);
       }else{
      callback(err, null);
       }
  });
};
