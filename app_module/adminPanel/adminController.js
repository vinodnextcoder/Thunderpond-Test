var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

var VerifyToken = require(__root + 'auth/VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../../config'); // get config file

var Roles = require('../../lib/schema/Roles');
var adminUser = require('../../lib/schema/adminUser');
var User = require('../../lib/schema/adminUser');

// CREATES A NEW USER
router.post('/createRoles', function (req, res) {
    Roles.create({
        display_name : req.body.display_name,
        RolesType : req.body.RolesType,
        role_id : uuidv4(),
        }, 
        function (err, user) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(user);
        });
});
// RETURNS ALL THE USERS IN THE DATABASE
router.get('/readRoles', function (req, res) {
    Roles.find({}, function (err, users) {
        if (err) return res.status(500).send("There was a problem finding the users.");
        res.status(200).send(users);
    });
});



// #############################user

router.post('/createUser', VerifyToken, function (req, res) {
    console.log(req.userRoles)
    async.waterfall([
        function (callback) {
            if (req && Array.isArray(req.userRoles)) {
                Roles.findOne({ role_id: req.userRoles }, function (err, user) {
                    if (err) return res.status(500).send('Error on the server.');
                    if (!user) return res.status(404).send('No user found.');

                    callback(null, user);
                }).lean();
            }
            else if (req && req.userRoles == "support") {
                callback(null, { RolesType: "support" });
            }
            else{
                
                res.status(401).send({ status: 401, msg: "Access Dennied to create user", data: null });
            }
        },
        function (value, callback) {
            console.log(value)
            if (value &&   value == "support" || value.RolesType == "admin" ||  value == "support" || value.RolesType == "support") {
                var hashedPassword = bcrypt.hashSync(req.body.password, 8);
                adminUser.create({
                    name: req.body.name,
                    user_id: uuidv4(),
                    email: req.body.name,
                    password: hashedPassword,
                    userRoles: req.body.userRoles
                },
                    function (err, user) {
                        if (err) return res.status(500).send("There was a problem adding the information to the database.");
                        {
                            res.status(200).send({ status: 200, msg: "Sucess created user", data: user })
                        }
                    });
            }
            else {
                res.status(401).send({ status: 401, msg: "Access Dennied to create user", data: null });
            }
        }
    ], function (err, result) {
        // result now equals to 'Task1 and Task2 completed'
        res.status(200).send(result);
        console.log(result);
    });
});

router.post('/read', VerifyToken,function (req, res) {
    async.waterfall([
        function (callback) {
            
            if (req && Array.isArray(req.userRoles)) {
                Roles.findOne({ role_id: req.userRoles }, function (err, user) {
                    if (err) return res.status(500).send('Error on the server.');
                    if (!user) return res.status(404).send('No user found.');

                    callback(null, user);
                }).lean();
            }
            else if (req && req.userRoles == "support") {
                callback(null, { RolesType:  req.userRoles });
            }
            else{
                res.status(401).send({ status: 401, msg: "Access Dennied to create user s", data: null });
            }
        },
        function (value, callback) {
            if (value && value.RolesType == "admin" || value.RolesType == "viewer" || value.RolesType == "editor"   || value.RolesType == "support") {
                let pipeline=[
                    {
                        '$match': {}
                    }, {
                        '$lookup': {
                            'from': 'roles', 
                            'localField': 'userRoles', 
                            'foreignField': 'role_id', 
                            'as': 'Role'
                        }
                    }, {
                        '$project': {
                            'name': 1, 
                            'email': 1, 
                            'UserRole': 1, 
                            'Role.display_name': 1, 
                            'Role.RolesType': 1,
                            user_id:1
                        }
                    }
                ]
                adminUser.aggregate(pipeline, function (err, users) {
                    if (err) return res.status(500).send("There was a problem finding the users.");
                    res.status(200).send({ status: 401, msg: "read user data",data:users});
                });
            }
            else {
                res.status(401).send({ status: 401, msg: "Access Dennied to create user", data: null });
            }
        }
    ], function (err, result) {
        // result now equals to 'Task1 and Task2 completed'
        res.status(200).send(result);
        console.log(result);
    });
   
});




router.post('/updateuser', VerifyToken,function (req, res) {
    async.waterfall([
        function (callback) {
            
            if (req && Array.isArray(req.userRoles)) {
                Roles.findOne({ role_id: req.userRoles }, function (err, user) {
                    if (err) return res.status(500).send('Error on the server.');
                    if (!user) return res.status(404).send('No user found.');

                    callback(null, user);
                }).lean();
            }
            else if (req && req.userRoles == "support") {
                callback(null, { RolesType:  req.userRoles });
            }
            else{
                res.status(401).send({ status: 401, msg: "Access Dennied to create user s", data: null });
            }
        },
        function (value, callback) {
            if (value && value.RolesType == "admin" || value.RolesType == "editor"  || value.RolesType == "support") {
                console.log(req.body)
                let find={
                    user_id:req.body.user_id
                }
                let updateObj={
                    name: req.body.name,
                    email: req.body.email,
                  
                }
                console.log(find)
                adminUser.update(find, updateObj, function (err, user) {
                    console.log(err)
                    if (err) return res.status(500).send("There was a problem updating the user.");
                    res.status(200).send(user);
                });
            }
            else {
                res.status(401).send({ status: 401, msg: "Access Dennied to create user", data: null });
            }
        }
    ], function (err, result) {
        // result now equals to 'Task1 and Task2 completed'
        res.status(200).send(result);
        console.log(result);
    });

});

router.post('/login', function(req, res) {

    adminUser.findOne({ email: req.body.email }, function (err, user) {
      if (err) return res.status(500).send('Error on the server.');
      if (!user) return res.status(404).send('No user found.');
      
      // check if the password is valid
      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
  
      // if user is found and password is valid
      // create a token
      var token = jwt.sign({ id: user._id ,userRoles:user.userRoles}, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
  
      // return the information including token as JSON
      res.status(200).send({ auth: true, token: token });
    }).lean();
  });

module.exports = router;