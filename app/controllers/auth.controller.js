const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath:'mylogfile.log',
        timestampFormat:'YYYY-MM-DD HH:mm:ss'
    },
log = SimpleNodeLogger.createSimpleLogger( opts );
const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken"); //to generate access tokens
var bcrypt = require("bcryptjs"); //to hash passwords
const { Subsribe, login } = require("../config/auth.config");


//define Signup
exports.signup = (req, res) => {
  // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8) //hash and add salt to hashed string to prevent same hash being created when same passwd used
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.status(201).send({ message: "User registered successfully!" });
            //console.log("New User Registration Successful  :" + req.body.username + " - "+ req.body.roles)
            log.info(Subsribe+" Success New User Registration: " + req.body.username + " as "+ req.body.roles +" roles")
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.status(201).send({ message: "User registered successfully!" });
          //console.log("New User Registration Successful  :" + req.body.username + " - "+ req.body.roles)
          log.info(Subsribe+" Success New User Registration: " + req.body.username + " as "+ req.body.roles +" roles")
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
      console.log(Subsribe+" Error Signing up for  :" + req.body.username + " - "+ req.body.roles + "error message is" + err.message)
    });
};


//define SignIn
exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        //console.log("Error Signing in for  :" + req.body.username  + "Error Message: User not found" )
        log.warn(login+" Error Signing in for: " + req.body.username  + "  Error Message: User not found")
        return res.status(404).send({ message: "User Not found." });  
      }
      //compare hashed passwd stored in DB with the one that user entered. Returns True or False
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        //console.log("Error Signing in for  :" + req.body.username  + "Error Message: Invalid Password Entered" )
        log.warn(login+" Error Signing in for: " + req.body.username  + "  Error Message: Invalid Password Entered")
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });


      var authorities = []; //in case the user has two roles (normal+premium_user)
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token
        });
        //console.log("Successfully Signed in for  :" + req.body.username  + "   as:  " + user.roles )
        log.info(login+ " Success! Signed in for: " + req.body.username  + " as: " + authorities)
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
