var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const multer = require("multer") ;
const path = require("path"); 
const { remove } = require('../models/User');
const Shipment = mongoose.model('Shipment');
const ShipDoc = mongoose.model('ShipDoc');
var storage = multer.diskStorage({ 
    destination: function (req, file, cb) { 
  
        // Uploads is the Upload_folder_name 
        cb(null, "uploads") 
    }, 
    filename: function (req, file, cb) { 
      cb(null, file.fieldname + "-" + Date.now()) 
    } 
  }) 

  const maxSize = 1 * 1000 * 1000; 
    
var upload = multer({  
    storage: storage, 
    limits: { fileSize: maxSize }, 
    fileFilter: function (req, file, cb){ 
    
        // Set the filetypes, it is optional 
        var filetypes = /json/; 
        // var mimetype = filetypes.test(file.mimetype); 
  
        var extname = filetypes.test(path.extname( 
                    file.originalname).toLowerCase()); 
        
        if (!extname) { 
            return cb(null, true); 
        } 
      
        cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes); 
      }  
  
// mypic is the name of file attribute 
}).single("myfile");   

router.post('/addShipment', async function (req, res) {
    let body = req.body;
    body.shipmentNO = makeid(4).toUpperCase() + Math.floor(100000 + Math.random() * 900000);
    let toSave = new Shipment(body);
    let saved  = await toSave.save();
    if(saved){
        res.status(200).json(saved);
    }else{
    res.status(500).json({ status: 500, data: null, message: "Error with saving Shipment" });
    }
 });
function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

router.get('/getAllShipment', async function (req, res) {
    let found = await Shipment.find({}).populate('vendor_id modeType');
     if(found && found.length){
        res.status(200).json(found);
     }else{
         res.status(500).json({ status: 500, data: null, message: "No data exist" });
     }

 });


 router.get('/getShipmentById/:id', async function (req, res) {
    try {
      var shipmentId = req.params.id
      let shipment = await Shipment.aggregate([
          {"$match" : { "_id" : ObjectId(shipmentId)}},
          {$lookup: {
            from:"shipmentmodes",
            localField: "modeType",
            foreignField: "_id",
            as: "modeData"
           }},
           {$lookup: {
            from:"users",
            localField: "vendor_id",
            foreignField: "_id",
            as: "vendorData"
           }},
           {$lookup: {
            from:"shipdocs",
            localField: "_id",
            foreignField: "shipment_id",
            as: "docData"
           }},
      ]);
      if (shipment && shipment.length) {
        res.status(200).send({ status: 200, data: shipment }).end()
      } else {
        res.status(500).send({ status: 500, data: null, message: "Shipment not  found" }).end()
      }
    }
    catch (e) {
      console.log("exception with GetUserById: ", e)
    }
  });
 
 router.post('/uploadShipdoc',upload, async (req,res)=>{
    if (!req.file) {
        res.status(500).send({status :500, data: null,  message: 'no file recieved' });
    } else {
        if(req.body){

            res.status(200).send({status : 200, data : req.file.path, message : "File Upload Succesfull"})
     }
   }
 });

  
 router.get('/removeAllShipment',  async (req,res)=>{
  let removed  = await Shipment.remove({});
  if(removed){
    res.send(removed);  }
});
 router.post('/editShipment', async (req,res)=>{
   let body = req.body;
   if(body && body.shipmentId){
    let updated =  await Shipment.findByIdAndUpdate(body.shipmentId,{
       $set:body.data
     },{
       new : true
     });
     if(updated){
      res.status(200).send({status:404, data : updated});
     }else{
      res.status(404).send({status:404, message: "Problem with Update"});

     }
   }else{
     res.status(404).send({status:404, message: "Please send ShipmentDetail"})
   }
});
  router.post('/saveShipdoc', async (req,res)=>{

        if(req.body){
        let toSave = new ShipDoc(req.body);
        let saved = await toSave.save();
        if(saved){
            res.status(200).send({status : 200, data : saved, message : "Save Doc Detail Succesfull"})
        }else{
            res.status(500).send({status :500, data: null,  message: 'Problem with Saving Upload Data' });
        }
        }else{
          res.status(500).send({status :500, data: null,  message: 'Please send data to save' });
        
        }
    });




 

module.exports = router;
