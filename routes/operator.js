var express = require('express');
var router = express.Router();
var passport = require('passport');
const mongoose = require('mongoose');

var Operator = mongoose.model('Operator');


router.post('/addOperator', async function (req, res) {

   let body = req.body;
   let found = await Operator.findOne({email : body.email})
   if(body){
    if(!found){
        let toSave = new Operator(body);
        let saved  = await toSave.save()
        if(saved){
            res.status(200).json(saved);
        }else{
         res.status(500).json({message : "Error with saving Operators"});
        }
    }else{
        res.status(500).json({message : "Operator already Exist"});
    }
   }else{
    res.status(500).json({message : "Data not validated"});
   } 
});

router.post('/editOperator', async function (req, res) {
    let body  = req.body;
    if(body && body.data && body.operatorId){
    let edited = await  Operator.findByIdAndUpdate(body.operatorId, {
       $set: body.data
   },
   {
       new: true
   }) 
   if(edited){
    res.send(edited);
}else{
   res.status(500).json({ message: 'Problem with Update' });
}
    }else{
        res.status(500).json({ message: 'Please send valid data' });
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
        res.status(500).send("{errors: \"Operator not  foundh\"}").end()
      }
    }
  })

router.get('/deleteOperator/:id', async function (req, res) {
    if (req.params.id) {
      var operatorId = req.params.id;
      var removed = await Operator.remove({ _id: operatorId });
      if (removed.deletedCount) {
        res.send(removed);
      } else {
        res.status(500).send("{errors: \"Operator Id does not exist\"}").end()
      }
    } else {
      res.status(500).send("{errors: \"Please send Operator Id\"}").end()
    }
  })


module.exports = router;
