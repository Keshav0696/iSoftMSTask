var express = require('express');
var router = express.Router();
var passport = require('passport');
const mongoose = require('mongoose');

var Operator = mongoose.model('Operator');


router.post('/addOperator', async function (req, res) {

   let body = req.body;
   let found = await Operator.findOne({email : body.email})
   if(body && req.user.role=='ADMIN'){
    if(!found){
        let toSave = new Operator(body);
        let saved  = await toSave.save()
        if(saved){
            res.status(200).json(saved);
        }else{
         res.status(500).json({ status : 500, message: 'Error with saving Operators' });
        }
    }else{
        res.status(500).json({ status : 500, message: 'Operator already Exist' });
    }
   }else{
    res.status(500).json({status : 500, message : "Data not validated"});
   } 
});

router.post('/editOperator', async function (req, res) {
    let body  = req.body;
    if(body && body.data && body.operatorId && req.user.role=='ADMIN'){
    let edited = await  Operator.findByIdAndUpdate(body.operatorId, {
       $set: body.data
   },
   {
       new: true
   }) 
   if(edited){
    res.send(edited);
}else{
   res.status(500).json({status : 500, message: 'Problem with Update' });
}
    }else{
        res.status(500).json({status : 500, message: 'Please send valid data' });
    }
});

router.post('/activeDeactivate', async function (req, res) {
    if (req.body.operatorId) {
      let operatorId = req.body.operatorId;
      var edited = await Operator.findByIdAndUpdate(operatorId, {
        $set: {status : req.body.status}
      },
        {
          new: true
        })
      if (edited) {
        res.send(edited);
      } else {
        res.status(500).json({status : 500, message: 'Operator not  found' }).end()
      }
    }
  })

router.get('/deleteOperator/:id', async function (req, res) {
    if (req.params.id && req.user.role=='ADMIN') {
      var operatorId = req.params.id;
      var removed = await Operator.remove({ _id: operatorId });
      if (removed.deletedCount) {
        res.send(removed);
      } else {
        res.status(500).json({status : 500, message: 'Operator Id does not exist' }).end()
      }
    } else {
      res.status(500).json({status : 500, message: 'Please send Operator Id' }).end()
    }
  })


module.exports = router;
