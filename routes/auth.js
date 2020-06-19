
var express = require('express');
var router = express.Router();
const User = require('../models/User')
const crypto = require('crypto');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var bcrypt = require('bcryptjs');

const nodemailer = require('nodemailer');
const passwordResetToken = require('../models/ResetPassword');
const jwt = require('jsonwebtoken');




passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
 
  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });

// Register User
router.post('/register', async function(req, res){
    var password = req.body.password;
    var password2 = req.body.password2;
  
    if (password == password2){
      var newUser = new User({
        fullname: req.body.fullname,
        email: req.body.email,
        password: req.body.password,
        roleId: req.body.roleId,
        status : req.body.status,
        type :'local'
      });
      var found = await User.findOne({ email: req.body.email})
    if(!found){
      User.createUser(newUser, function(err, user){
        if(err) throw err;
        res.status(200).send({status: 200, data: newUser}).end()
      });
    }
    else{
      res.status(500).send({status: 500, data: null, message: "User already exist"}).end()
    }
    } else{
      res.status(500).send({status: 500, data: null, message: "Password not match"}).end()
    }
  });


  //   // Endpoint to login
// /* POST login. */
router.post('/login', function (req, res, next) {
  passport.authenticate('local', {session: false}, (err, user, info) => {
      if (err || !user) {
          return res.status(400).json({
              status : 400,
              message: 'Something is not right',
              user   : user
          });
      }
     req.login(user, {session: false}, (err) => {
         if (err) {
             res.send(err);
         }
         // generate a signed son web token with the contents of user object and return it in the response
         const token = jwt.sign({user}, '8A169E5DFB4F18C678DBAD19A4B4A17F1F8154713192E618DCDBF7D8C9E9ABA4');
         return res.json({ status : 200, user, token});
      });
  })(req, res);
});


    var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByEmail(username, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Unknown User'});
      }
      User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
     	if(isMatch){
     	  return done(null, user);
     	} else {
     	  return done(null, false, {message: 'Invalid password'});
     	}
     });
   });
  }
));

router.get('/logout', function(req, res){
req.logout();
res.send(null)
});

passport.use(new FacebookStrategy({
    clientID: "142388747089656",
    clientSecret: "d84c0f739aae53aa4249ea79c8ee53aa",
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
      if (err) return done(err);
      if (user) return done(null, user);
      else {
        // if there is no user found with that facebook id, create them
        var newUser = new User();
  
        // set all of the facebook information in our user model
        newUser.facebookId = profile.id;
        newUser.token = accessToken;
        newUser.fullname  = profile.displayName;
        newUser.type  = 'facebook';
        if (typeof profile.emails != 'undefined' && profile.emails.length > 0)
          newUser.facebook.email = profile.emails[0].value;
  
        // save our user to the database
        newUser.save(function(err) {
          if (err) throw err;
          return done(null, newUser);
        });
      }
    });
  }));


  passport.use(new GoogleStrategy({
    clientID: "930205980963-dhp4ejdi8kfmer9ttt9h534flfu1efv1.apps.googleusercontent.com",
    clientSecret: "awKNylRbknwg-U5qZcUlmH_u",
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return done(err, user);
      });
  }
));

router.get('/facebook',
  passport.authenticate('facebook'));

  router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log(req.user)
    res.redirect('/');
  }
);

router.get('/google',
passport.authenticate('google', { scope: 'https://www.google.com/m8/feeds' }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });




  router.post('/forgot-password', async function (req, res) {
    if (!req.body.email) {
        return res
        .status(500)
        .json({ status : 500, message: 'Email is required' });
        }
        const user = await User.findOne({
        email:req.body.email
        });
        if (!user) {
        return res
        .status(409)
        .json({  status : 409, message: 'Email does not exist' });
        }
        var resettoken = new passwordResetToken({ _userId: user._id, resettoken: crypto.randomBytes(16).toString('hex') });
        resettoken.save(async function (err) {
        if (err) { return res.status(500).send({ msg: err.message }); }
        passwordResetToken.find({ _userId: user._id, resettoken: { $ne: resettoken.resettoken } }).remove().exec();
        res.status(200).json({ status : 200, message: 'Reset Password successfully.' });
        let testAccount = await nodemailer.createTestAccount();
        var transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          secure : true,
          port: 465,
          auth: {
            user: "testerpraveen01@gmail.com",
            pass: "Praveen@123"
          }, 
          tls: {
            rejectUnauthorized: false
          }
        });
        var mailOptions = {
        to: user.email,
        from: 'testerpraveen01@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://localhost:4200/resetPassword/' + resettoken.resettoken + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if(!err){
                console.log("Email sent")
            }
        })
        })
 })



 router.post('/valid-password-token', async function (req, res) {
  if (!req.body.resettoken) {
  return res
  .status(500)
  .json({ message: 'Token is required' });
  }
  const user = await passwordResetToken.findOne({
  resettoken: req.body.resettoken
  });
  if (!user) {
  return res
  .status(409)
  .json({ message: 'Invalid URL' });
  }
  User.findOne({ _id: user._userId }).then(() => {
  res.status(200).json({ message: 'Token verified successfully.' });
  }).catch((err) => {
  return res.status(500).send({ msg: err.message });
  });
})

router.post('/new-password', async function (req, res) {
     await  passwordResetToken.findOne({ resettoken: req.body.resettoken },async function (err, userToken, next) {
        if (!userToken) {
          return res
            .status(409)
            .json({ message: 'Token has expired' });
        }
  
        await  User.findOne({
          _id: userToken._userId
        }, async function (err, userEmail, next) {
          if (!userEmail) {
            return res
              .status(409)
              .json({ message: 'User does not exist' });
          }
          return bcrypt.hash(req.body.newPassword, 10, async (err, hash) => {
            if (err) {
              return res
                .status(400)
                .json({ message: 'Error hashing password' });
            }
            userEmail.password = hash;
            await userEmail.save(function (err) {
              if (err) {
                return res
                  .status(400)
                  .json({ message: 'Password can not reset.' });
              } else {
                userToken.remove();
                return res
                  .status(201)
                  .json({ message: 'Password reset successfully' });
              }
  
            });
          });
        });
  
      })
  })
  module.exports = router;