//const log = require('simple-node-logger').createSimpleFileLogger('screens.log');

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content. \n Welcome to the Best Job Seek Site. ");

};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content. \n Check Available job posts");
};

exports.seekerBoard = (req, res) => {
  res.status(200).send("Seeker Content.\n -Check Available Job posts \n -Recommended Jobs based on your skillset");
};

exports.recruiterBoard = (req, res) => {
  res.status(200).send("Recruiter Content. \n - Search Seekers \n - Post new Job Opening");
};
