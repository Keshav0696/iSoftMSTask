var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

var Shipment = mongoose.model('Shipment');

router.post('/addShipment', async function (req, res) {
    let body = req.body;
         let toSave = new Shipment(body);
         let saved  = await toSave.save()
         if(saved){
             res.status(200).json(saved);
         }else{
          res.status(500).json({ status: 500, data: null, message: "Error with saving Shipment" });
         }
 });

router.get('/getAllShipment', async function (req, res) {
    let found = await Shipment.find({});
     if(found && found.length){
        res.status(200).json(found);
     }else{
         res.status(500).json({ status: 500, data: null, message: "No data exist" });
     }

 });
 


module.exports = router;
