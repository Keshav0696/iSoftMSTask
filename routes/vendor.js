var express = require('express');
var router = express.Router();
var passport = require('passport');
const mongoose = require('mongoose');

var Vendor = mongoose.model('Vendor');
    User = mongoose.model('User');


router.post('/addVendor', async function (req, res) {

   let body = req.body;
   let found = await Vendor.findOne({ email : body.email})
   if(body && req.user.roleId && req.user.roleId._doc.name == 'VENDOR'){
    if(!found){
        let toSave = new Vendor(body);
        let saved  = await toSave.save()
        if(saved){
            res.status(200).json(saved);
        }else{
         res.status(500).json({message : "Error with saving Vendors"});
        }
    }else{
        res.status(500).json({message : "Vendor already Exist"});
    }
   }else{
    res.status(500).json({message : "Data not validated"});
   } 
});

router.post('/editVendor', async function (req, res) {
    let body  = req.body;
    if(body  && body.data && body.vendorId && 
        req.user.roleId && req.user.roleId._doc.name == 'VENDOR'){
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
    res.status(500).json({ message: 'Problem with Update' });
 }
    }else{
        res.status(500).json({ message: 'Please send valid data' });
    }
});

router.get('/deleteVendor/:id', async function (req, res) {
    if (req.params.id) {
      var vendorId = req.params.id;
      if(req.user.roleId && req.user.roleId._doc.name == 'VENDOR'){
      var removed = await Vendor.remove({ _id: vendorId });
      }else{
        res.status(500).send("{errors: \"User Role Not Valid\"}").end()
      }
      if (removed.deletedCount) {
        res.send(removed);
      } else {
        res.status(500).send("{errors: \"Vendor Id does not exist\"}").end()
      }
    } else {
      res.status(500).send("{errors: \"Please send Vendor Id\"}").end()
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
        res.status(500).send("{errors: \"Vendor not  foundh\"}").end()
      }
    }
  })

module.exports = router;
