var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const Shipment = mongoose.model("Shipment");
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

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

module.exports = router;
