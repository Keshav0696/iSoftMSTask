var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const Destination = mongoose.model("Destination");
// const VendorRate = mongoose.model('VendorRate');
const {ObjectId} = require('mongodb');
const nodemailer = require('nodemailer');
const zipcodes = require('zipcodes');
const config = require('../config')
const Shipment = mongoose.model('Shipment');
const FbaPalletRate = mongoose.model("FbaPalletRate");
const FbaContainerRate = mongoose.model('FbaContainerRate');
const FbaFtlRate =  mongoose.model('FbaFtlRate');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/getAllDestination', async function(req, res){
      let destinations =  await Destination.find({});
      if(destinations.length){
        res.send({status : 200, data : destinations});
      }else{
        res.send({status : 500, data : null, message : "No destinations Found"});

      }
})

router.get('/getAllArrivingPort', async function (req, res) {
  let found = await ArrivingPort.find({});
   if(found){
      res.status(200).json(found);
   }else{
       res.status(500).json({ status: 500, data: null, message: "No data exist" });
   }

});


router.post('/dashboard', async function(req, res) {
  if(!req.body.user_id && !req.body.vendor_id){
  var active_vendor = await User.find({status : 'active', role : "VENDOR"}, {status:1}).count();
  var customer_count = await User.find({role : "MEMBER"}, {email : 1}).count();
  }
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), 0, 1);
  var lastDay = new Date(date.getFullYear(), 12, 0);
  for(var p in req.body){
    req.body[p] = ObjectId(req.body[p]);
  }
  let total_billing_price = await Shipment.aggregate([{
    $match : req.body},
    {
    $group:
    {
      _id: {  year: { $year: "$create_at" } },
      totalAmount: { $sum:  "$price"},
      count:{$sum:1}
    }
    }]);
  if(total_billing_price && total_billing_price.length){
  res.status(200).send({status : 200, data :
     {shipment_count : total_billing_price[0].count,
      active_vendor: active_vendor || 0, 
      customer_count: customer_count ||0,
      total_billing_price }
    })
}else{
    res.status(200).send({status : 200, data :
     {shipment_count : 0,
      active_vendor: active_vendor || 0, 
      customer_count: customer_count ||0}
    })
}
});

// router.get('/getAllVendorRates',async function(req,res){
//   let allRates = await VendorRate.find({}).populate('vendor_id');
//   if(allRates.length){
//     res.status(200).send({status:200, data:allRates});
//   }else{
//     res.status(500).send({status:500, message: 'No Rates Exist'})
//   }
// })

router.post('/getVendorRates',async function(req, res){
  let origin_zip = req.body.origin;
  let destination = req.body.destination;
  let mode = req.body.mode;
  let vendor_rates = [];
  if(mode){
  if(mode ==="fbaPallet"){
   getPalletRates(destination, origin_zip, vendor_rates).then(function(result,err){
    if(result == '501'){
      res.status(500).send({status :500, message : 'No Quotes Found'});
    }else if(result == '502'){
      res.status(500).send({status :500, message : 'No Rates for Destination'});
    }else{
      res.status(200).send(result);
    }

   });
  }else if(mode ==="fbaContainer"){
    getContainerRates(destination, origin_zip, vendor_rates).then(function(result,err){
      if(result == '501'){
        res.status(500).send({status :500, message : 'No Quotes Found'});
      }else if(result == '502'){
        res.status(500).send({status :500, message : 'No Rates for Destination'});
      }else{
        res.status(200).send(result);
      }
  
     });
  }else{
    getFtlRates(destination, origin_zip, vendor_rates).then(function(result,err){
      if(result == '501'){
        res.status(500).send({status :500, message : 'No Quotes Found'});
      }else if(result == '502'){
        res.status(500).send({status :500, message : 'No Rates for Destination'});
      }else{
        res.status(200).send(result);
      }
  
     });
  }
}else{
    res.status(500).send({status :500, message : 'Please send the selected Mode'});
}
})

function getTodayDate(){
  return `${new Date().getMonth() + 1}/${new Date().getDate()}/${new Date().getFullYear()}`
}

async function getFtlRates(destination, origin_zip, vendor_rates){
  return new Promise(async (resolve, rejects)=>{

    vendor_rates['fbaftl'] = [];
    let date =  getTodayDate();
    // let allRates = await FbaPalletRate.find({}).populate('vendor_id').populate('fbaPallet.rates.wareHouse').populate('fbaPallet.rates.location');
    let allRates = await FbaFtlRate.find({ wareHouse: destination , expDate : {$gte : new Date(date)}}).populate('vendor_id wareHouse');

    if (origin_zip && destination) {
      if (allRates.length) {
        for (var i = 0; i < allRates.length; i++) {
          let freePickupRadius = allRates[i].freeRadius;
          if (allRates[i].pickupRangeCode === origin_zip) {
            let obj = {
              vendor: allRates[i].vendor_id,
              rate: allRates[i]
            }
            vendor_rates['fbaftl'].push(obj)
          } else {
            let zip_codes = zipcodes.radius(origin_zip, freePickupRadius);
            if (zip_codes.includes(allRates[i].pickupRangeCode)) {
              let obj = {
                vendor: allRates[i].vendor_id,
                rate: allRates[i]
              }
              vendor_rates['fbaftl'].push(obj);
            }
          }
        }
        if (vendor_rates['fbaftl'].length) {
          resolve({ fbaftl: vendor_rates['fbaftl'] });
        } else {
          resolve('501');
        }

      }
      else {
        resolve('502');
      }

    }
  })
  }

async function getContainerRates(destination, origin_zip, vendor_rates){
  return new Promise(async(resolve, rejects)=>{

    let date =  getTodayDate();
  vendor_rates['fbaContainer'] = [];
  // let allRates = await FbaPalletRate.find({}).populate('vendor_id').populate('fbaPallet.rates.wareHouse').populate('fbaPallet.rates.location');
  let allRates = await FbaContainerRate.find({ wareHouse: destination, expDate : {$gte : new Date(date)} }).populate('vendor_id wareHouse arrivingPort');

  if (origin_zip && destination) {
    if (allRates.length) {
      for (var i = 0; i < allRates.length; i++) {
        if (allRates[i].arrivingPort.zip_code === origin_zip) {
          let obj = {
            vendor: allRates[i].vendor_id,
            rate: allRates[i]
          }
          vendor_rates['fbaContainer'].push(obj)
        } 
      }
      if (vendor_rates['fbaContainer'].length) {
        resolve({ fbaContainer: vendor_rates['fbaContainer'] });
      } else {
        resolve('501');
      }

    }
    else {
      resolve('502');
    }

  }
})
}
  async function getPalletRates(destination, origin_zip, vendor_rates){
  return new Promise(async (resolve, rejects)=>{
    let date =  getTodayDate();
    vendor_rates['fbaPallet'] = [];
    // let allRates = await FbaPalletRate.find({}).populate('vendor_id').populate('fbaPallet.rates.wareHouse').populate('fbaPallet.rates.location');
    let allRates = await FbaPalletRate.find({ wareHouse: destination, expDate : {$gte : new Date(date) }}).populate('vendor_id wareHouse location');

    if (origin_zip && destination) {
      if (allRates.length) {
        for (var i = 0; i < allRates.length; i++) {
          let freePickupRadius = allRates[i].freePickupRadius;
          if (allRates[i].location.zip === origin_zip) {
            let obj = {
              vendor: allRates[i].vendor_id,
              rate: allRates[i]
            }
            vendor_rates['fbaPallet'].push(obj)
          } else {
            let zip_codes = zipcodes.radius(origin_zip, freePickupRadius);
            if (zip_codes.includes(allRates[i].location.zip)) {
              let obj = {
                vendor: allRates[i].vendor_id,
                rate: allRates[i]
              }
              vendor_rates['fbaPallet'].push(obj);
            }
          }
        }
        if (vendor_rates['fbaPallet'].length) {
          resolve({ fbaPallet: vendor_rates['fbaPallet'] });
        } else {
          resolve('501');
        }

      }
      else {
        resolve('502');
      }

    }
  })
  }

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

function sendMail(user){
    var transporter = nodemailer.createTransport({
          host: config.SMTP_HOST,
          secure : true,
          port: config.SMTP_PORT,
            //  service: 'gmail',
          auth: {
            user: config.SMTP_USER,
            pass: config.SMTP_PASSWORD
          }
        });
  var mailOptions = {
    to: user.email,
    from:  config.SMTP_FROM,
    subject: 'Welcome to the FBA Delivery',
    html: `<p> Welcome ${user.firstname} ${user.lastname}</p>
    <p>Please click the Link Reset The Password </p>
     <a href ="http://localhost:4200/resetPassword/">Reset Password</a>
            `
  };
  transporter.sendMail(mailOptions, function(err){
    if(err){  console.log(err)}
    
  });
}



router.post('/editShipper', async function(req,res){
  if(req.body.email && req.body.phoneNo && emailValidator(req.body.email) && phoneNoValidator(req.body.phoneNo)){
  var newUser = new User(req.body);
  var found = await User.findOne({ email: req.body.email});
  let shipment = {};
if(!found){
  req.body.type = 'local';
  req.body.status = 'active';
  req.body.role = req.body.role || "MEMBER"; 
  User.createUser(newUser,async  function(err, user){
    try{
    if(err) throw new Error(err);
    if(user){
    sendMail(user);
    res.status(201).send({status: 201, data: newUser }).end();
    }else{
      res.status(500).send({status: 500, data: null, message: "Problem with save shipment"}).end()

    }
  }
  catch(e){
    console.log(e)
  }
  });

}
else{
   User.findOneAndUpdate({email: req.body.email},{
     $set : req.body
   },{
     new : true
   }, async function(err, result){
     if(err){
      res.status(500).send({status :500, message : 'Probem with Update Shipper'})
     }else{
       if(result){
      res.status(200).send({status: 200, data: result}).end();
      }else{
        res.status(500).send({status: 500, data: null, message: "Problem with save shipment"}).end()
      }
     }
   })
}
}else{
res.status(500).send({status: 500, data: null, message: "User data not Validated"}).end()
}
})


router.post('/saveShipperDetail', async function(req,res){
if(req.body){
  req.body.data.shipmentNO = makeid(4).toUpperCase() + Math.floor(100000 + Math.random() * 900000);
  let toSave = new Shipment(req.body.data);
  let saved =  await toSave.save();
  if(saved){
    res.status(200).send({status: 200, data: saved}).end();
  }else{
    res.status(500).send({status: 500, data: null, message: "Problem with save shipment Detail"}).end()
  }
}else{
  res.status(500).send({status: 500, data: null, message: "Please send all required fields"}).end()

}
})

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// async function saveShipment(data){
//   return new Promise(async (resolve, reject)=>{
//   if(!data.shipment_id){
//     let toSave = new Shipment({user_id : data.user_id});
//     let saved =  await toSave.save();
//     if(!saved){
//       reject();
//     }
//     resolve(toSave.id);
//     }
//   else{
//   Shipment.findOneAndUpdate({_id : data.shipment_id},{
//      $set : data.data
//   }, {
//     new: true
//   } ,function(err, result){

//     if(err){
//       reject();
//     }
//     resolve( result);
//   })
//   }
// })
// }

module.exports = router;
