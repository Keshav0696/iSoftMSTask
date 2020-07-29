var express = require('express');
var router = express.Router();
var passport = require('passport');
const util = require(process.cwd() + '/util');
const upload = util.upload;
const path = require("path");
const mongoose = require('mongoose');
    User = mongoose.model('User');
    BusinessInfo = mongoose.model('VendorBizInfo');
    PaymentInfo = mongoose.model('PaymentInfo');
    CompanyDetail = mongoose.model('CompanyDetail');
    Location = mongoose.model('Location');
    VendorRate = mongoose.model('VendorRate');
    ArrivingPort = mongoose.model('ArrivingPort')


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

  router.post('/saveBizInfo', async function(req, res){
    let body = req.body;
    let found  =  await User.findOne({_id : body.vendor_id});
    if(body && found){
      try{
        let updated =   await BusinessInfo.findByIdAndUpdate(body.vendor_id, {
          $set : body.data
        },
        {
             upsert : true
        });
        if(updated){
          res.send({status : 200, data : updated});
        }else{
          res.send({status : 500, data : null})
        }
      }
      catch(e){
        console.log(e)
      }
    }else{
      res.send({status : 500, data : null, message : "Vendor Not Found"})
    }
  })

  router.get('/getBusinessInfo/:id', async function(req, res){
    let id = req.params.id;
    let found  =  await BusinessInfo.findOne({_id : id});
    if(found){
      res.send({status : 200, data : found});
    }else{
      res.send({status : 500, data : null , message : "Info Not Found"});
    }
  })


  router.get('/getImage/:id', async function(req, res){
    let id = req.params.id;
    let found  =  await BusinessInfo.findOne({_id : id});
    res.sendFile(path.resolve(process.cwd() + '/' + found.shipperLogo));
  })
  

  router.post('/uploadBusinessLogo', upload, async (req, res) => {
    if (!req.file) {
      res.status(500).send({ status: 500, data: null, message: 'no file recieved' });
    } else {
      if (req.body) {
  
        res.status(200).send({ status: 200, data: req.file.path, message: "File Upload Succesfull" })
      }
    }
  });


  router.post('/savePaymentInfo', upload, async (req, res) => {
    let body = req.body;
    if(body){
      try{
        let updated =  await User.findByIdAndUpdate(body.vendor_id, {
          $set : body.data
        },
        {
             new : true
        });
        if(updated){
          res.send({status : 200, data : updated});
        }else{
          res.send({status : 500, data : null})
        }
      }
      catch(e){
        console.log(e)
      }
    }else{
      res.status(500).send({status: 500, data: null, message: 'Vendor not  found' }).end();
    }
  });

  router.get('/getPaymentInfo/:id', async function(req, res){
    let id = req.params.id;
    let found  =  await User.findOne({_id : id});
    if(found){
      res.send({status : 200, data : found});
    }else{
      res.send({status : 500, data : null , message : "Info Not Found"});
    }
  })

  router.put('/editPalletRate/:id', async function (req, res) {
    if(req.body && req.params.id) {
      var edited = await VendorRate.findOneAndUpdate({ vendor_id: req.params.id }, {
        $set: {
          fbaPallet : req.body
        }
        },
        {
          upsert: true
        });
      if (edited) {
        res.send(edited);
      } else {
        res.status(500).send({status: 500, data: null, message: "Accessories are not available"});
      }
    } else {
      res.status(500).json({ status: 500, data: null, message: "Please enter all required fields" });
    }
});

router.put('/editContainerRate/:id', async function (req, res) {
  if(req.body && req.params.id) {
    var edited = await VendorRate.findOneAndUpdate({ vendor_id: req.params.id }, {
      $set: {
        fbaContainer : req.body
      }
    },
      {
        upsert: true
      });
    if (edited) {
      res.send(edited);
    } else {
      res.status(500).send({status: 500, data: null, message: "Accessories are not available"});
    }
  } else {
    res.status(500).json({ status: 500, data: null, message: "Please enter all required fields" });
  }
});

router.get('/getPalletRate/:id', async function (req, res) {
  if(req.params.id){
  let found = await VendorRate.findOne({vendor_id: req.params.id})
   if(found){
      res.status(200).json(found);
   }else{
       res.status(500).json({ status: 500, data: null, message: "No data exist" });
   }
  }else{
    res.status(500).json({ status: 500, data: null, message: "Rate id is required" });
  }
});

router.put('/editFtlRate/:id', async function (req, res) {
  if(req.body && req.params.id) {
    var edited = await VendorRate.findOneAndUpdate({ vendor_id: req.params.id }, {
      $set: {
        fbaftl : req.body
      }
    },
      {
        upsert: true
      });
    if (edited) {
      res.send(edited);
    } else {
      res.status(500).send({status: 500, data: null, message: "Accessories are not available"});
    }
  } else {
    res.status(500).json({ status: 500, data: null, message: "Please enter all required fields" });
  }
});

router.get('/getAllArrivingPort', async function (req, res) {

  let found = await ArrivingPort.find({});
   if(found){
      res.status(200).json(found);
   }else{
       res.status(500).json({ status: 500, data: null, message: "No data exist" });
   }

});

router.post('/saveLocations', async function (req, res) {
  if(req.body) {

    let toSave = new Location(req.body);
    let saved = await toSave.save();
    if(saved){
      res.status(200).json(saved);
    }else{
      
    res.status(500).json({ status: 500, data: null, message: "Problem with saveLocations" });

    }
  } else {
    res.status(500).json({ status: 500, data: null, message: "Please enter all required fields" });
  }
});

router.get('/getAllLocations/:id',async function(req,res){
    if(req.params.id) {
  let allLocations = await Location.find({vendor_id : req.params.id});
  if(allLocations.length){
    res.status(200).send({status:200, data:allLocations});
  }else{
    res.status(500).send({status:500, message: 'No Locations Exist'})
  }
}else{
   res.status(500).send({status:500, message: 'Please Send User Id'})
}
})


router.put('/editLocation/:id', async function (req, res) {
  if(req.body && req.params.id) {
    var edited = await Location.findOneAndUpdate({ _id: req.params.id }, {
      $set:  req.body
       },
      {
        new: true
      });
    if (edited) {
      res.send(edited);
    } else {
      res.status(500).send({status: 500, data: null, message: "Location is not available"});
    }
  } else {
    res.status(500).json({ status: 500, data: null, message: "Please enter all required fields" });
  }
});

router.get('/deleteLocation/:id', async function (req, res) {
    if (req.params.id) {
      var locationId = req.params.id;
      var removed = await Location.remove({ _id: locationId });
      if (removed.deletedCount) {
        res.send(removed);
      } else {
        res.status(500).send({status: 500, data: null, message: 'Location does not exist' }).end()
      }
    } else {
      res.status(500).send({status: 500, data: null, message: 'Please send Vendor Id' }).end()
    }
  })

module.exports = router;
