const jwt = require("jsonwebtoken");
const { pageAccess } = require("../config/auth.config.js");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath:'mylogfile.log',
        timestampFormat:'YYYY-MM-DD HH:mm:ss'
    },
log = SimpleNodeLogger.createSimpleLogger( opts );
var our_user = []

//verify token when accessed to secured pages
verifyToken = (req, res, next) => {
  let token = req.headers["access-token"];

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      log.warn(pageAccess+ " Unauthorised attempt to access internal secured page" )
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id; //get the id from DB for the entered token
    next();
  });
};

//if accessed seeker's page
isSeeker = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "seeker") { //make sure role is seeker from DB for that id
          User.findOne({
            where: {
              id : req.userId
            }
          })
          var accessedseeker = user.username; //get the username who is accessing
          our_user.push(accessedseeker);
          log.info(pageAccess+user.username+" accessed Seekers page " )
          next();
          return;
        }
      }

      
      User.findOne({
        where: {
          id : req.userId
        }
      })
        .then(user => {
          var authorities = [];
          user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
              authorities.push("ROLE_" + roles[i].name.toUpperCase());
            }
            res.status(403).send({
              message: "Require Seeker Role!"
            });
            log.warn(pageAccess+user.username+" tried to access Seekers page without Seeker role. User_role: " + authorities )
        })
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
      return;
    });
  });
};

//if accessed recruiter's page
isRecruiter = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "recruiter") { //make sure role is recruiter from DB for that id
          User.findOne({
            where: {
              id : req.userId
            }
          })
          exports.accessedrecruiter = user.username;  //get the username who is accessing
          log.info(pageAccess+user.username+" Accessed Recruiter page " )
          next();
          return;
        }
      }
      User.findOne({
        where: {
          id : req.userId
        }
      })
        .then(user => {
          var authorities = [];
          user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
              authorities.push("ROLE_" + roles[i].name.toUpperCase());
            }
            res.status(403).send({
              message: "Require Recruiter Role!"
            });
            log.warn(pageAccess+user.username+" tried to access Recruiters page without Recruiters role. User_role: " + authorities )
        })
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
      
    });
  });
};

isRecruiterOrSeeker = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "user") {
          User.findOne({
            where: {
              id : req.userId
            }
          })
          log.info(pageAccess+user.username+" accessed user page " )
          next();
          return;
        }

        if (roles[i].name === "seeker") {
          User.findOne({
            where: {
              id : req.userId
            }
          })
          log.info(pageAccess+user.username+" accessed user page " )
          next();
          return;
        }
      }
      User.findOne({
        where: {
          id : req.userId
        }
      })
        .then(user => {
          var authorities = [];
          user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
              authorities.push("ROLE_" + roles[i].name.toUpperCase());
            }
            res.status(403).send({
              message: "Require Seeker or User Role!"
            });
            log.warn(pageAccess+user.username+" tried to access User page without Seeker or User role. User_role:" + authorities )
        })
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
      
    });
  });
};


const authJwt = {
  verifyToken: verifyToken,
  isSeeker: isSeeker,
  isRecruiter: isRecruiter,
  isRecruiterOrSeeker: isRecruiterOrSeeker
};
module.exports = authJwt, our_user;


