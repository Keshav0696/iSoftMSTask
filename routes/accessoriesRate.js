var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

var AccessoriesRate = mongoose.model('accessoriesRate');

router.post('/addAccessoriesRate', async function (req, res) {
  if(req.user.role == 'ADMIN'){
    if(req.body) {
      let toSave = new AccessoriesRate(req.body);
      let saved  = await toSave.save();
      if(saved){
          res.status(200).json(saved);
      }else{
       res.status(500).json({ status: 500, data: null, message: "Error occured. Please try again" });
      }
    } else {
      res.status(500).json({ status: 500, data: null, message: "Please enter all required fields" });
    }
  }else{
    res.status(500).json({ status: 500, data: null, message: "Role don't have access" });
  } 
});

router.put('/editAccessoriesRate/:id', async function (req, res) {
  if(req.user.role == 'ADMIN'){
    if(req.body && req.params.id) {

      var edited = await AccessoriesRate.findOneAndUpdate({ _id: req.params.id }, {
        $set: req.body
      },
        {
          new: true
        });
      if (edited) {
        res.send(edited);
      } else {
        res.status(500).send({status: 500, data: null, message: "Accessories are not available"});
      }
    } else {
      res.status(500).json({ status: 500, data: null, message: "Please enter all required fields" });
    }
  }else{
    res.status(500).json({ status: 500, data: null, message: "Role not have access" });
  } 
});


router.put('/editPalletRate/:id', async function (req, res) {
    if(req.body && req.params.id) {
      var edited = await AccessoriesRate.findOneAndUpdate({ _id: req.params.id }, {
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

router.get('/getPalletRate/:id', async function (req, res) {
  if(req.params.id){
  let found = await AccessoriesRate.findOne({_id: req.params.id})
   if(found){
      res.status(200).json(found);
   }else{
       res.status(500).json({ status: 500, data: null, message: "No data exist" });
   }
  }else{
    res.status(500).json({ status: 500, data: null, message: "Rate id is required" });
  }
});

router.get('/getAllAccessoriesRate', async function (req, res) {

    let found = await AccessoriesRate.find({})
     if(found){
        res.status(200).json(found);
     }else{
         res.status(500).json({ status: 500, data: null, message: "No data exist" });
     }

 });

module.exports = router;
