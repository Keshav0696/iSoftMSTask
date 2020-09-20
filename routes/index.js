var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const {ObjectId} = require('mongodb');

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
router.post('/createCustomer', async function(req, res){

    if(req.body.email && req.body.phoneNo && emailValidator(req.body.email) && phoneNoValidator(req.body.phoneNo)){
    var newUser = new User(req.body);
    var found = await User.findOne({ email: req.body.email})
  if(!found){
    User.createUser(newUser, function(err, user){
      try{
      if(err) throw new Error(err);
      res.status(200).send({status: 200, data: newUser});
    }
    catch(e){
      console.log(e)
    }
    });

  }
  else{
    res.status(500).send({status: 500, data: null, message: "Customer already exist"}).end()
  }
}else{
  res.status(500).send({status: 500, data: null, message: "Sent Data  not Validated"}).end()
}

});

router.get('/getAllCustomers', async function (req, res) {
  let users = await User.find({});
  if (users && users.length) {
    res.status(200).send({ status: 200, data: users }).end()
  } else {
    res.status(500).send({ status: 500, data: null, message: "Customers not  found" }).end()
  }
});
 

router.put('/updateCustomer/:id', async function (req, res) {
  if (req.body.data && req.params._id) {
    let userId = req.params._id;
    let UserSet = req.body.data;
    if(emailValidator(UserSet.email) && phoneNoValidator(UserSet.phoneNo)){
    var edited = await User.findByIdAndUpdate(userId, {
      $set: UserSet
    },
      {
        new: true
      })
    if (edited) {
      res.send(edited);
    } else {
      res.status(500).send({status: 500, data: null, message: "Customer not  found"}).end()
    }
  }else{
    res.status(500).send({status: 500, data: null, message: "Sent Data not validated"}).end()
  }
  }
})


router.get('/deleteCustomer/:id', async function (req, res) {
  if (req.params.id) {
    var userId = req.params.id;
    var removed = await User.remove({ _id: userId });
    if (removed.deletedCount) {
      res.send(removed);
    } else {
      res.status(500).send({status: 500, data: null, message: "Customer Id does not exist"}).end()
    }
  } else {
    res.status(500).send({status: 500, data: null, message: "Please send Customer Id"}).end()
  }
})

module.exports = router;
