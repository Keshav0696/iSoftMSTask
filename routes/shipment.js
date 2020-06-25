var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const multer = require("multer") ;
const path = require("path") 
var Shipment = mongoose.model('Shipment');

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
    body.shipmentNO = Math.floor(100000 + Math.random() * 900000);
    let toSave = new Shipment(body);
    let saved  = await toSave.save();
    if(saved){
        res.status(200).json(saved);
    }else{
    res.status(500).json({ status: 500, data: null, message: "Error with saving Shipment" });
    }
 });

router.get('/getAllShipment', async function (req, res) {
    let found = await Shipment.find({}).populate('vendor_id modeType');
     if(found && found.length){
        res.status(200).json(found);
     }else{
         res.status(500).json({ status: 500, data: null, message: "No data exist" });
     }

 });
 
 router.post('/uploadShipdoc',upload, (req,res)=>{
    if (!req.file) {
        res.status(404).send({ message: 'no file recieved' });
    } else {
    }

 });


module.exports = router;
