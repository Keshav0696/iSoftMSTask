var createError = require('http-errors');
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
require('./models');
require('./models/User');
require('./models/ShipmentMode');
require('./models/Shipment');
require('./models/ShipDoc');
require('./models/destination');
require('./models/vendorRate');
require('./models/arrivingPort');
require('./models/companyDetail');
require('./models/vendorBizInfo');
require('./models/paymentInfo');
require('./models/location');
require('./models/accessoriesRate');


const config = require('./config');
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
        return User.findOne({_id : jwtPayload.user._id})
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
  secret: config.sessionSecret,
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

app.get('/',  function(req, res){
res.send("SUCCESS")
}
);
app.get('/api/auth/google/callback', function(req, res){
  res.send("Success")
})
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var vendorRouter = require('./routes/vendor');
var operatorRouter = require('./routes/operator');
var shipmentModeRouter = require('./routes/shipmentMode');
var shipmentRouter = require('./routes/shipment');
var accessoriesRouter = require('./routes/accessoriesRate');

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


app.use('/api', indexRouter);
app.use('/api/user', jwt, usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/vendor',jwt, vendorRouter);
app.use('/api/operator',jwt, operatorRouter);
app.use('/api/shipmode',jwt, shipmentModeRouter);
app.use('/api/shipment',jwt, shipmentRouter);
app.use('/api/accessories', accessoriesRouter);

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
































  

