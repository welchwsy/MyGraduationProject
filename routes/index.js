var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');
var Message = require('../models/message');
var querystring = require('querystring');
var util = require('util');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: '简视会' });
});
/* ppost home page. */
router.post('/', function(req, res) {
  var md5 = crypto.createHash('md5');
  var MD5room = md5.update(req.body.room).digest('base64');
  var room = MD5room.toLowerCase().replace(/\\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
  res.redirect('/room/?'+room);
});
/* GET home page. */
router.get('/simplewebrtc', function(req, res) {
  res.render('simplewebrtc', { title: 'simplewebrtc' });
});
/* GET room page. */
router.get('/room', function(req, res) {
  console.log('username'+req.session.user);
  if("" == req.session.user || req.session.user == null || req.session.user == undefined){
    req.session.message = new Message({name : 'warning', info : '请先登录'});
    res.redirect('/login');
    }else{
    res.render('room', { userNmae: req.session.user.name });
    }
});
/* GET Login page. */
router.get('/login', function(req, res) {
     if("" != req.session.user || req.session.user != null || req.session.user != undefined){
    req.session.message = new Message({name : 'warning', info : '用户已登录，非法操作。'});
    res.redirect('/');
    }else{
    res.render('Login', { title: '用户登录' });
    }
});
/* GET Logout page. */
router.get('/logout', function(req, res) {
  delete req.session.user;
  res.redirect('/');
});
/* GET :user page. */
router.get('/u/:user', function(req, res) {
  //res.render('uzone', { title: '用户中心' });
  res.redirect('/');
    });
/* GET home page. */
router.get('/home', function(req, res) {
  res.render('home', { title: '首页' });
});
/* GET Reg page. */
router.get('/reg', function(req, res) {
  res.render('reg', { title: '用户注册' });
});

/* Post Login page. */
router.post('/Login',function(req, res){
    console.log(req.body);
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    User.get(req.body.email,function(err,user){
        if(err){
            req.session.message = new Message({name : 'warning', info : '数据库出错请联系管理员'});
            return res.redirect('/');
        }
        if(user){
            //判断用户状态，状态未active则进行密码验证，通过密码验证后指定session。uer的对象
            if(user.state == 'active'){    
                if(user.password != password){
                    req.session.message = new Message({name : 'warning', info : '密码错误，请重新输入。'});
                  }else{
                    req.session.user = user;
                    return res.redirect('/');
              }
            }else{
                req.session.message = new Message({name : 'warning', info : '用户未激活，请等待管理员激活。'});
                return res.redirect('/');            
            } 
        }else{
            req.session.message = new Message({name : 'warning', info : '该邮箱尚未注册，请先注册邮箱。'});
            return res.redirect('/');
        }       
    });
   // res.redirect('/home');
});
/* Post reg page. */
router.post('/reg',function(req,res){
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');
  var newUser = new User({
  name : req.body.userName,
  email : req.body.email,
  password : password,
  state : 'unActive'
  });
    //检查email是否已被注册
  User.get(newUser.email,function(err,user){
    if(user)err = '该邮箱已被注册，请使用其他的邮箱注册';
    if(err){
        console.log(err);
        var newMessage = new Message({name : 'warning', info : err});
        req.session.message = newMessage;
        return res.redirect('/reg');
    }
    newUser.save(function(err){
        if(err){
        //newMessage = new Message({name : 'error', info : err,});
        //req.session.message = newMessage;
        //return res.redirect('/ureg');
        console.log(err);
        }else{
            req.session.message = new Message({name : 'success',info : '用户注册成功，请等待管理员激活。'});
            //req.session.user = newUser; //指定session.user 实现用户登录的状态
            return res.redirect('/');
        }
    });
 
  });
  //console.log(req.body.password);
 // console.log('user:'+util.inspect(newUser));
  //res.redirect('/home');
/*    
var post = ''+querystring.parse();
    fs.writeFile('req.txt',util.inspect(req),'UTF-8',function       (err,data){
    if(err){
    console.log(err);
}
});*/
   // console.log('a post , req :'+util.inspect(req.body));
    
});

module.exports = router;
