var express = require('express');
var router = express.Router();
var passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


router.get('/getAllUsers', async function (req, res) {
  let users = await User.find({role : "MEMBER"})

  if (users && users.length) {
    res.status(200).send({ status: 200, data: users }).end()
  } else {
    res.status(500).send({ status: 500, data: null, message: "User not  found" }).end()
  }
});


router.get('/getUserById/:id', async function (req, res) {
  try {
    var userId = req.params.id
    let user = await User.findOne({_id: userId});
    if (user) {
      res.status(200).send({ status: 200, data: user }).end()
    } else {
      res.status(500).send({ status: 500, data: null, message: "User not  found" }).end()
    }
  }
  catch (e) {
    console.log("exception with GetUserById: ", e)
  }
});

function emailValidator(value){
  let pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  let emailVal = pattern.test(value);
  return emailVal;
}
function phoneNoValidator(value){
  let phonePattern =/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  let phoneNOVal = phonePattern.test(value);
  return phoneNOVal;
}
router.post('/createUser', async function(req, res){

    req.body.type = 'local';
    req.body.status = 'active';
    req.body.role = req.body.role || "MEMBER"; 
    if(emailValidator(req.body.email) && phoneNoValidator(req.body.phoneNo)){
    var newUser = new User(req.body);
    var found = await User.findOne({ email: req.body.email})
  if(!found){
    
    User.createUser(newUser, function(err, user){
      try{
      if(err) throw new Error(err);
      res.status(200).send({status: 200, data: newUser}).end()
    }
    catch(e){
      console.log(e)
    }
    });

  }
  else{
    res.status(500).send({status: 500, data: null, message: "User already exist"}).end()
  }
}else{
  res.status(500).send({status: 500, data: null, message: "User data not Validated"}).end()
}

});
router.post('/editUser', async function (req, res) {
  if (req.body.data && req.body._id) {
    let userId = req.body._id;
    let UserSet = req.body.data;
    if(emailValidator(req.body.data.email) && phoneNoValidator(req.body.data.phoneNo)){
    var edited = await User.findByIdAndUpdate(userId, {
      $set: UserSet
    },
      {
        new: true
      })
    if (edited) {
      res.send(edited);
    } else {
      res.status(500).send({status: 500, data: null, message: "User not  found"}).end()
    }
  }else{
    res.status(500).send({status: 500, data: null, message: "User not validated"}).end()
  }
  }
})
router.post('/activeDeactivate', async function (req, res) {
  if (req.body.userId) {
    let userId = req.body.userId;
    var edited = await User.findByIdAndUpdate(userId, {
      $set: {status : req.body.status}
    },
      {
        new: true
      })
    if (edited) {
      res.send(edited);
    } else {
      res.status(500).send({status: 500, data: null, message: "User not  found"}).end()
    }
  }
})

router.get('/deleteUser/:id', async function (req, res) {
  if (req.params.id) {
    var userId = req.params.id;
    var removed = await User.remove({ _id: userId });
    if (removed.deletedCount) {
      res.send(removed);
    } else {
      res.status(500).send({status: 500, data: null, message: "User Id does not exist"}).end()
    }
  } else {
    res.status(500).send({status: 500, data: null, message: "Please send User Id"}).end()
  }
})



// // Endpoint to get current user
router.get('/user', function (req, res) {
  res.send(req.user);
})

module.exports = router;
