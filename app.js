var createError = require('http-errors');
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
require('./models/User');
require('./models/Role');
require('./models/Vendor');
require('./models/Operator');
const User = mongoose.model('User')
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : '8A169E5DFB4F18C678DBAD19A4B4A17F1F8154713192E618DCDBF7D8C9E9ABA4'
    },
    function (jwtPayload, cb) {

        //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
        return User.findOne({_id : jwtPayload.user._id}).populate("roleId")
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
));

var cors = require('cors');

var app = express();

app.use(cors())

// // Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));


// Passport init
app.use(passport.initialize());
app.use(passport.session());

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var vendorRouter = require('./routes/vendor');
var operatorRouter = require('./routes/operator');

function jwt (req, res, next){
  passport.authenticate('jwt', { session: false }, function(err, user, info) { 
      if (err) { return next(err); } 
      if (!user) { return res.send("Custom Unauthorised").end(); } 
      // edit as per comment
      //return res.send("Test Route Accessed").end();
      req.user = user;   // Forward user information to the next middleware
      next();
  })(req, res, next);
}
app.get('/auth/facebook/callback', function(req, res){
  res.send("Success")
})
app.use('/', indexRouter);
app.use('/user', jwt, usersRouter);
app.use('/auth', authRouter);
app.use('/vendor',jwt, vendorRouter);
app.use('/operator',jwt, operatorRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
































  

