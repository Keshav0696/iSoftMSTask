var express = require('express');
var router = express.Router();
var passport = require('passport');
const mongoose = require('mongoose');

var Vendor = mongoose.model('Vendor');
    User = mongoose.model('User');


router.post('/addVendor', async function (req, res) {

   let body = req.body;
   let found = await Vendor.findOne({ email : body.email})
   if(body ){
    if(req.user.role!='ADMIN'){
      res.status(500).json({status : 500, message: 'Role do not have access' }).end()  
    }
    if(!found){
        let toSave = new Vendor(body);
        let saved  = await toSave.save()
        if(saved){
            res.status(200).json(saved);
        }else{
         res.status(500).json({ status: 500, data: null, message: "Error with saving Vendors" });
        }
    }else{
        res.status(500).json({ status: 500, data: null, message: "Vendor already Exist" });
    }
   }else{
    res.status(500).json({ status: 500, data: null, message: "Please send data" });
   } 
});

router.get('/getAllVendor', async function (req, res) {
  try{
  if(req.user.role!='ADMIN'){
    res.status(500).json({status : 500, message: 'Role do not have access' }).end()  
  }
  let found = await Vendor.find({});
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
    if(body  && body.data && body.vendorId ){
      if(req.user.role!='ADMIN'){
        res.status(500).json({status : 500, message: 'Role do not have access' }).end()  
      }
   let edited = await Vendor.findByIdAndUpdate(body.vendorId, {
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
});

router.get('/deleteVendor/:id', async function (req, res) {
    if (req.params.id) {
      var vendorId = req.params.id;
      if(req.user.role== 'ADMIN'){
      var removed = await Vendor.remove({ _id: vendorId });
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
      var edited = await Vendor.findByIdAndUpdate(vendorId, {
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
