var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const Shipment = mongoose.model("Shipment");
const Destination = mongoose.model("Destination");
const VendorRate = mongoose.model('VendorRate');
const zipcodes = require('zipcodes');
const FbaPalletRate = mongoose.model("FbaPalletRate");
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
router.get('/dashboard', async function(req, res) {
  let shipment_count =	await Shipment.count();
  let active_vendor = await User.find({status : 'active', role : "VENDOR"}, {status:1}).count();
  let customer_count = await User.find({role : "MEMBER"}, {email : 1}).count();
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), 0, 1);
  var lastDay = new Date(date.getFullYear(), 12, 0);
  let total_billing_price = await Shipment.aggregate([{
    $group:
    {
      _id: {  year: { $year: "$create_at" } },
      totalAmount: { $sum:  "$price"},
    }
    }]);
  res.status(200).send({status : 200, data : {shipment_count,active_vendor, customer_count, total_billing_price}})
});

router.get('/getAllVendorRates',async function(req,res){
  let allRates = await VendorRate.find({}).populate('vendor_id');
  if(allRates.length){
    res.status(200).send({status:200, data:allRates});
  }else{
    res.status(500).send({status:500, message: 'No Rates Exist'})
  }
})

router.post('/getVendorRates',async function(req, res){
  let origin_zip = req.body.origin;
  let destination = req.body.destination;
  let mode = req.body.mode;
  let vendor_rates = [];
  vendor_rates['fbaPallet'] = [];
  // let allRates = await FbaPalletRate.find({}).populate('vendor_id').populate('fbaPallet.rates.wareHouse').populate('fbaPallet.rates.location');
  let allRates = await FbaPalletRate.find({wareHouse : destination}).populate('vendor_id wareHouse location');
  if(origin_zip && destination){
    if(allRates.length){
      for(var i=0; i<allRates.length; i++){
        let freePickupRadius = allRates[i].freePickupRadius;
             if(allRates[i].location.zip === origin_zip){
              let obj = {
                vendor : allRates[i].vendor_id,
                rate   :  allRates[i]
              }
              vendor_rates['fbaPallet'].push(obj)
             }else{
               let zip_codes = zipcodes.radius(origin_zip, freePickupRadius);
               if(zip_codes.includes(allRates[i].location.zip)){
                let obj = {
                  vendor : allRates[i].vendor_id,
                  rate : allRates[i]
                }
                vendor_rates['fbaPallet'].push(obj);
               }
             }
      }  
      if(vendor_rates['fbaPallet'].length){
        res.status(200).send({fbaPallet : vendor_rates['fbaPallet']});
      }else{
        res.status(500).send({status :500, message : 'No Quotes Found'})
      }

    }
    else{
      res.status(500).send({status :500, message : 'No Rates for Destination'})
    }

  }
})

// function sendMail(user){
//   var transporter = nodemailer.createTransport({
//     host: config.SMTP_HOST,
//     secure : true,
//     service: 'gmail',
//     port: config.SMTP_PORT,
//     auth: {
//       user: config.SMTP_USER,
//       pass: config.SMTP_PASSWORD
//     }
//   });
//   var mailOptions = {
//     to: user.email,
//     from:  config.SMTP_FROM,
//     subject: 'Welcome to the FBA Delivery',
//     html: `<p> Welcome ${user.firstname} ${user.lastname}</p>
//     <p>Please click the Link Reset The Password </p>
//      <a href ="http://localhost:4200/resetPassword/">Reset Password</a>
//             `
//   };
//   transporter.sendMail(mailOptions, function(err){
//     if(err){  console.log(err)}
    
//   });
// }

// router.get('/editShipper', async function(req,res){
//   if(req.body){
//     let email = req.body.email;
//     let found =  await User.findOne({email : email});
//     if(!found){

//     }
//   }
//   else{
//     res.status(500).send({message : "Please send the required Fields"})
//   }
// })




module.exports = router;

