const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/test/all", controller.allAccess);

  app.get(
    "/api/test/user",
    [authJwt.verifyToken, authJwt.isRecruiterOrSeeker],
    controller.userBoard
  );

  app.get(
    "/api/test/recruiter",
    [authJwt.verifyToken, authJwt.isRecruiter],
    controller.recruiterBoard
  );

  app.get(
    "/api/test/seeker",
    [authJwt.verifyToken, authJwt.isSeeker],
    controller.seekerBoard
  );
};
