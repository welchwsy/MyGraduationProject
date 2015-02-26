var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AdminSchema = new Schema({
    name : String,
    password : String
});
var adminModel = mongoose.model('admin',AdminSchema);
function Admin(admin){
    this.name = admin.name;
    this.password = admin.password;
};
module.exports = Admin;
/* save admin info in mongodb*/
Admin.prototype.save = function save(callback){
    var admin = {
        name: this.name,
        password: this.password
    };
  var adminEntity = new adminModel({name: this.name,password: this.password});
  adminEntity.save(function(err){
    callback(err, admin);
  });
};
/* get a admin by name*/
Admin.get = function get(name, callback) {
  adminModel.findOne({name : name},function(err,doc){
    if(doc){
      //封装文档为admin对象
      var admin = new Admin(doc);
      callback(err, admin);
       }else{
      callback(err, null);
       }
  });
};
/* change admin by name*/
Admin.change = function change(name, newName , newPassword, callback) {
  adminModel.findOne({name : name},function(err,doc){
    if(doc){
      doc.name = newName;
      doc.password = newPassword;
      doc.save(function(err){
        if(err){callback(err,null)}        
        });
      callback(err, doc);
       }else{
      callback(err, null);
       }
  });
};
