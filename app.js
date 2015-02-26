var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session    = require('express-session');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');

var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');

var app = express();
//connect to mongodb
mongoose.connect('mongodb://localhost/'+settings.db, function(err){
    if(!err){
        console.log('connected to mongodb with mongoose!');
    }else{
        throw err;
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: settings.cookie_secret,
    store: new MongoStore({
      db : settings.db,
    }),
    proxy: true,
    resave: true,
    saveUninitialized: true
  }));
// add session to req,user 用于存放用户登录信息，message用于向客户端发送信息，并且在信息取出后清楚message. admin用于存放管理员登录信息
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    res.locals.admin = req.session.admin;
    res.locals.message = req.session.message;
    req.session.message = '';
    next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/admin', admin);   //指定admin的路由解析文件



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
