//Load the express server
const express = require('express');
const app = express();
app.disable('etag'); //so it will return 200 and 304 etc. codes.

// Import the GCP ErrorReporting library
const {ErrorReporting} = require('@google-cloud/error-reporting');

// Get ready to talk to the Error Reporting GCP Service
const errors = new ErrorReporting({
  reportMode: 'always' //as opposed to only while in production
});

const gcpMetadata = require('gcp-metadata');//make it easy to read GCP metadata

const uuidv1 = require('uuid/v1');//let's build a uuid to identify the Cloud Run container
const containerID = uuidv1();

const funFactor = Math.floor(Math.random() * 5) + 1; //just for fun

//setup a Winston logger adding GCP support
const winston = require('winston');
//Here's the GCP addon
const {LoggingWinston} = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();

// Create a Winston logger that streams to GCP Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
// Note, they will be adding better support for express soon
const logger = winston.createLogger({
  level: 'info',
  transports: [
    // Add GCP Logging
    loggingWinston,
  ],
});

//A classic Hello World, not using our logger
app.get('/', (req, res) => {
  console.log('/ version of Hello world received a request');

  const target = process.env.TARGET || 'World';
  res.send(`Hello ${target}!`);
});

//Another classic Hello World, this one using Winston to GCP
app.get('/log', (req, res) => {
  logger.info("/log version of Hello World received a request")
  const target = process.env.TARGET || 'World';
  res.send(`Hello ${target}!`);
});

//Basic NodeJS app built with the express server
app.get('/score', (req, res) => {
  //Random score, the contaierID is a UUID unique to each
  //runtime container (testing was done in Cloud Run). 
  //funFactor is a random number 1-10
     let score = Math.floor(Math.random() * 100) + 1;
  //Using the Winston logging library with GCP extension
  logger.info(`/score called`, {score:""+score, containerID:containerID, 
    funFactor:""+funFactor });
    //Basic message back to browser
  res.send(`Your score is a ${score}. Happy?`);
  });
  

//Manually report an error
app.get('/error', (req, res) => {
  try{
    doesNotExist();
  }
  catch(e){
    //This is a log, will not show in Error Reporter
    logger.error("Error processing /error " + e);
    //Let's manually pass it to Error Reporter
    errors.report("Error processing /error " + e);
  }
 res.send("Broken now, come back later.")
});

//Uncaught exception, auto reported
app.get('/uncaught', (req, res) => {
  doesNotExist();
 res.send("Broken now, come back later.")
});


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Hello world listening on port', port);
});