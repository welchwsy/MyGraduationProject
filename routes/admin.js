var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var Admin = require('../models/admin');
var Message = require('../models/message');
var User = require('../models/user');
var util = require('util');
var url = require('url');
var queryString = require('querystring');

/* GET admin listing. */
router.get('/', function(req, res) {
   if("" == req.session.admin || req.session.admin == null || req.session.admin == undefined){
    req.session.message = new Message({name : 'warning', info : '用户未登录，非法操作。'});
    res.redirect('/admin/adminLogin');
    }else{
  User.getUsersByState('unActive',function(err, users){
    if(err){ 
        console.log(err);
    }else{
        //console.log('users:'+ util.inspect(users));
        return res.render('admin', {title : '管理中心' , users : users});
    }
  });
  //res.render('admin', { title : '管理中心' });
}
});
/* GET adminAllUser listing. */
router.get('/allUser', function(req, res) {
   if("" == req.session.admin || req.session.admin == null || req.session.admin == undefined){
    req.session.message = new Message({name : 'warning', info : '用户未登录，非法操作。'});
    res.redirect('/admin/adminLogin');
    }else{
  User.getUsersByState('active',function(err, users){
    if(err){ 
        console.log(err);
    }else{
        console.log('users:'+ util.inspect(users));
        return res.render('adminAllUser', {title : '管理中心' , users : users});
    }
  });
  //res.render('admin', { title : '管理中心' });
}
});

/* GET adminChange listing. */
router.get('/change', function(req, res) {
   if("" == req.session.admin || req.session.admin == null || req.session.admin == undefined){
    req.session.message = new Message({name : 'warning', info : '用户未登录，非法操作。'});
    res.redirect('/admin/adminLogin');
    }else{
  res.render('adminChange', { title : '管理中心' });
    }
});
/* GET active a user listing.  激活用户操作*/ 
router.get('/activeUser', function(req, res) {
   if("" == req.session.admin || req.session.admin == null || req.session.admin == undefined){
    req.session.message = new Message({name : 'warning', info : '用户未登录，非法操作。'});
    res.redirect('/admin/adminLogin');
    }else{
    var qs = queryString.parse(url.parse(req.url).query);
    var state = 'active';
    //console.log('qs--->'+util.inspect(qs));
    //console.log('qs.email--->'+qs.email);
    User.changeState(qs.email , state , function(err,doc){
        if(err){
            console.log('err-->'+err);
            res.redirect('/');
        }else{
            res.redirect('/admin');       
        }    
    });
    }
});
/* GET unActive a user listing.  拉黑用户操作*/ 
router.get('/unActiveUser', function(req, res) {
   if("" == req.session.admin || req.session.admin == null || req.session.admin == undefined){
    req.session.message = new Message({name : 'warning', info : '用户未登录，非法操作。'});
    res.redirect('/admin/adminLogin');
    }else{
    var qs = queryString.parse(url.parse(req.url).query);
    var state = 'unActive';
    //console.log('qs--->'+util.inspect(qs));
    //console.log('qs.email--->'+qs.email);
    User.changeState(qs.email , state , function(err,doc){
        if(err){
            console.log('err-->'+err);
            res.redirect('/admin/allUser');
        }else{
            res.redirect('/admin/allUser');       
        }    
    });
  }
});
/* GET adminLogin listing. */
router.get('/adminLogin', function(req, res) {
  res.render('adminLogin', { title: '管理员登录' });
});
/* GET adminInit listing. */
router.get('/adminInit', function(req, res) {
  var md5 = crypto.createHash('md5');
  var password = md5.update('password').digest('base64');
  var init = new Admin({name : 'admin' , password : password});
  Admin.get(init.name,function(err,admin){
    if(!err){
        console.log('admin---->'+util.inspect(admin));
        if(admin == null || admin == 'undefind' || admin == '' || admin == "{}"){
            init.save(function(err){if(err)console.log('err----->'+err);});   
            }else{
                admin.name = 'admin';
                admin.password = password;
                admin.save(function(err){if(err)console.log('err----->'+err);});         
            }   
    }else{ 
    }     
    });
  res.render('adminLogin', { title: '管理员登录' });
});
/* GET adminLogin listing. */
router.get('/adminLogout', function(req, res) {
  delete req.session.admin;
  req.session.message = new Message({name : 'success', info : '安全退出成功！'});
  res.render('adminLogin', { title: '管理员登录' });
});
/** admin登录验证*/
router.post('/adminLogin', function(req, res){
    var name = req.body.name;
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    console.log(req.body.password);
    Admin.get(name, function(err, admin){
        if(err){
            req.session.message = new Message({name : 'warning', info : '数据库出错，请检查服务器配置。'});
            return res.redirect('/admin/adminLogin');        
        }
        if(admin){
            if(admin.password != password){
                req.session.message = new Message({name : 'warning' , info : '密码错误，请重新输入。'});
                return res.redirect('/admin/adminLogin');             
            }else{
                req.session.admin = admin;
                return res.redirect('/admin');
            }        
        }else{
            req.session.message = new Message({name : 'warning' , info : '用户不存在，请检查用户名。'});
            res.redirect('/admin/adminLogin');
        }
    });
});
/** admin账号更改*/
router.post('/adminChange', function(req, res){
    var name = req.session.admin.name;
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    var newName = req.body.newName;
    var newPassword = md5.update(req.body.newPassword).digest('base64');
    //验证密码
    if(password == req.session.admin.password){
            Admin.change(name, newName, newPassword,function(err,doc){
                 if(err){
                 }else{
                    req.session.message = new Message({name : 'success', info : '账户修改成功！'});
                    req.session.admin = doc;
                    res.redirect('/admin/change');                  
                 }           
            });
    }else{
          //  console.log("密码错误，请重试");
            req.session.message = new Message({name : 'warning', info : '密码错误，请重试'});
            res.redirect('/admin/change');
    }
});


module.exports = router;
