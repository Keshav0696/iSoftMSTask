var express = require('express');
var router = express.Router();
var passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Role = mongoose.model('Role');
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


router.get('/getAllUsers', async function (req, res) {
  let users = await User.aggregate([{
    "$lookup": {
      "from": "roles",
      "localField": "roleId",
      "foreignField": "_id",
      "as": "roleObject"
    }
  }])

  if (users && users.length) {
    res.status(200).send({ status: 200, data: users }).end()
  } else {
    res.status(500).send("{errors: \"Users not  found\"}").end()
  }
});


router.get('/getUserById/:id', async function (req, res) {
  try {
    var userId = req.params.id
    let user = await User.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(userId) }
      },
      {
        "$lookup": {
          "from": "roles",
          "localField": "roleId",
          "foreignField": "_id",
          "as": "roleObject"
        }
      }]);
    if (user && user.length) {
      res.status(200).send({ status: 200, data: user }).end()
    } else {
      res.status(500).send({ status: 500, data: null, message: "User not  found" }).end()
    }
  }
  catch (e) {
    console.log("exception with GetUserById: ", e)
  }
});


router.post('/createUser', async function(req, res){
    req.body.type = 'local'
    var newUser = new User(req.body);
    var found = await User.findOne({ email: req.body.email})
  if(!found){
    User.createUser(newUser, function(err, user){
      if(err) throw err;
      res.status(200).send({status: 200, data: newUser}).end()
    });
  }
  else{
    res.status(500).send({status: 500, data: null, message: "User already exist"}).end()
  }

});
router.post('/editUser', async function (req, res) {
  if (req.body.data && req.body._id) {
    let userId = req.body._id;
    let UserSet = req.body.data;
    var edited = await User.findByIdAndUpdate(userId, {
      $set: UserSet
    },
      {
        new: true
      })
    if (edited) {
      res.send(edited);
    } else {
      res.status(500).send("{errors: \"User not  foundh\"}").end()
    }
  }
})
router.post('/activeDeactivate', async function (req, res) {
  if (req.body.userId) {
    let userId = req.body.userId;
    var edited = await User.findByIdAndUpdate(userId, {
      $set: {status : req.body.status}
    },
      {
        new: true
      })
    if (edited) {
      res.send(edited);
    } else {
      res.status(500).send("{errors: \"User not  foundh\"}").end()
    }
  }
})

router.get('/deleteUser/:id', async function (req, res) {
  if (req.params.id) {
    var userId = req.params.id;
    var removed = await User.remove({ _id: userId });
    if (removed.deletedCount) {
      res.send(removed);
    } else {
      res.status(500).send("{errors: \"User Id does not exist\"}").end()
    }
  } else {
    res.status(500).send("{errors: \"Please send User Id\"}").end()
  }
})


router.post('/addRoles', async function (req, res) {
  if (req.body) {
    let dataSet = req.body;
    let found = await Role.findOne({name : dataSet.name});
    if(!found){
      var roleToSave = new Role(dataSet);
      if (roleToSave) {
        var saved = await roleToSave.save()
      }
      if (saved) {
        res.send(saved);
      } else {
        res.status(500).send("{errors: \"Error with saving Roles\"}").end()
      }
    }else{
      res.status(500).send("{errors: \"Role already Exist\"}").end()
    }

  }
})

router.get('/getAllRoles',  async function (req, res) {
  let allROles = await Role.find({});
  if (allROles && allROles.length) {
    res.send(allROles);
  } else {
    res.status(500).send("{errors: \"No Roles Found\"}").end()
  }
})


router.post('/editRole', async function (req, res) {
  if (req.body.data && req.body._id) {
    let roleId = req.body._id;
    let roleSet = req.body.data;
    var edited = await Role.findByIdAndUpdate(roleId, {
      $set: roleSet
    },
      {
        new: true
      })
    if (edited) {
      res.send(edited);
    } else {
      res.status(500).send("{errors: \"Role not  foundh\"}").end()
    }
  }
})

router.get('/deleteRole/:id', async function (req, res) {
  if (req.params.id) {
    var roleId = req.params.id;
    var removed = await Role.remove({ _id: roleId });
    if (removed.deletedCount) {
      res.send(removed);
    } else {
      res.status(500).send("{errors: \"Role Id does not exist\"}").end()
    }
  } else {
    res.status(500).send("{errors: \"Please send Role Id\"}").end()
  }
})


// // Endpoint to get current user
router.get('/user', function (req, res) {
  res.send(req.user);
})

module.exports = router;
