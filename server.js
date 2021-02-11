const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const log = require('simple-node-logger').createSimpleFileLogger('auth.log','YYYY-MM-DD HH:mm:ss.SSS');

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// database stup
const db = require("./app/models");
const Role = db.role;


// force: true will drop the table if it already exists
db.sequelize.sync({force: true}).then(() => {
  console.log('Drop and Resync Database with { force: true }');
  initial();
});

// Base Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Job Search Portal." });
});

// Import RBA routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

//define roles
function initial() {
  Role.create({
    id: 1,
    name: "user"
  });
 
  Role.create({
    id: 2,
    name: "recruiter"
  });
 
  Role.create({
    id: 3,
    name: "seeker"
  });
}