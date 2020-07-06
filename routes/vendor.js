var express = require('express');
var router = express.Router();
var passport = require('passport');
const mongoose = require('mongoose');

    User = mongoose.model('User');


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

router.post('/addVendor', async function (req, res) {

   let body = req.body;
   body.status = body.status || 'active';
   body.role = body.role || 'VENDOR';
   if(emailValidator(req.body.email) && phoneNoValidator(req.body.phoneNo)){
   let found = await User.findOne({ email : body.email})
   if(body ){
    if(req.user.role!='ADMIN'){
      res.status(500).json({status : 500, message: 'Role do not have access' }).end()  
    }
    if(!found){
      try{
        let toSave = new User(body);
        let saved  = await toSave.save()
        if(saved){
            res.status(200).json(saved);
        }else{
         res.status(500).json({ status: 500, data: null, message: "Error with saving Vendors" });
        }
      }catch(e){
        console.log(e);
      }
    }else{
        res.status(500).json({ status: 500, data: null, message: "Vendor already Exist" });
    }
   }else{
    res.status(500).json({ status: 500, data: null, message: "Please send data" });
   } 
  }else{
    res.status(500).json({ status: 500, data: null, message: "Vendor Data Not Validated" }); 
  }
});

router.get('/getAllVendor', async function (req, res) {
  try{
  if(req.user.role!='ADMIN'){
    res.status(500).json({status : 500, message: 'Role do not have access' }).end()  
  }
  let found = await User.find({role : "VENDOR"});
   if(found && found.length){
      res.status(200).json(found);
   }else{
       res.status(500).json({ status: 500, data: null, message: "No data exist" });
   }
  }
  catch(e){
    console.log(e)
  }
});

router.post('/editVendor', async function (req, res) {
    let body  = req.body;
   if(emailValidator(body.data.email) && phoneNoValidator(body.data.phoneNo)){

    if(body  && body.data && body.vendorId ){
      if(req.user.role!='ADMIN'){
        res.status(500).json({status : 500, message: 'Role do not have access' }).end()  
      }
   let edited = await User.findByIdAndUpdate(body.vendorId, {
       $set: body.data
   },
   {
       new: true
   }
 ) 
 if(edited){
     res.send(edited);
 }else{
    res.status(500).json({status: 500, data: null, message: 'Problem with Update' });
 }
    }else{
        res.status(500).json({status: 500, data: null, message: 'Please send vendor Id' });
    }
  }
  else{
    res.status(500).json({status: 500, data: null, message: 'Vendor Data not Validated' });

  }
});

router.get('/deleteVendor/:id', async function (req, res) {
    if (req.params.id) {
      var vendorId = req.params.id;
      if(req.user.role== 'ADMIN'){
      var removed = await User.remove({ _id: vendorId });
      }else{
        res.status(500).send("{errors: \"User Role Not Valid\"}").end()
      }
      if (removed.deletedCount) {
        res.send(removed);
      } else {
        res.status(500).send({status: 500, data: null, message: 'Vendor Id does not exist' }).end()
      }
    } else {
      res.status(500).send({status: 500, data: null, message: 'Please send Vendor Id' }).end()
    }
  })


  router.post('/activeDeactivate', async function (req, res) {
    if (req.body.vendorId) {
      let vendorId = req.body.vendorId;
      var edited = await User.findByIdAndUpdate(vendorId, {
        $set: {status : req.body.status}
      },
        {
          new: true
        })
      if (edited) {
        res.send(edited);
      } else {
        res.status(500).send({status: 500, data: null, message: 'Vendor not  found' }).end()
      }
    }
  })

module.exports = router;
