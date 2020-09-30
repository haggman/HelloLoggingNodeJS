//Load the express server
const express = require('express');
const app = express();
app.disable('etag'); //so it will return 200 and 304 etc. codes.

//Enable Debugger
require('@google-cloud/debug-agent').start(
  {serviceContext: {enableCanary: false}});

//Enable Error Reporting
// Import the GCP ErrorReporting library
const {ErrorReporting} = require('@google-cloud/error-reporting');

// Get ready to talk to the Error Reporting GCP Service
const errors = new ErrorReporting({
  reportMode: 'always' //as opposed to only while in production
});

//Setup a listener to catch all uncaught exceptions
process.on('uncaughtException', (e) => {
    // Write the error to stderr.
    console.error(e);
    // Report that same error the Error Service
    errors.report(e);
});

const { v1: uuidv1 } = require('uuid');
const containerID = uuidv1();

const funFactor = Math.floor(Math.random() * 5) + 1; //just for fun

//A classic Hello World, not using our logger
//but it is doing a classic console.log
app.get('/', (req, res) => {
  console.log('/ version of Hello world received a request');

  const target = process.env.TARGET || 'World';
  res.send(`Hello ${target}!`);
});

//Another classic Hello World, this one using Winston to GCP
app.get('/log', (req, res) => {
  console.log("/log version of Hello World received a request")
  const target = process.env.TARGET || 'World';
  res.send(`Hello ${target}, from /log!`);
});

//Basic NodeJS app built with the express server
app.get('/score', (req, res) => {
  //Random score, the contaierID is a UUID unique to each
  //runtime container (testing was done in Cloud Run). 
  //funFactor is a random number 1-100
  let score = Math.floor(Math.random() * 100) + 1;
  
  console.log(`/score called, score:${score}, containerID:${containerID}, funFactor:${funFactor}`);
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
    console.error("Error processing /error " + e);
    //Let's manually pass it to Error Reporter
    errors.report("Error processing /error " + e);
  }
 res.send("Broken now, come back later.")
});

//Uncaught exception, auto reported
app.get('/uncaught', (req, res) => {
  doesNotExist();
  //won't ever get to:
  res.send("Broken now, come back later.")
});

//Generates an uncaught exception every 1000 requests
app.get('/random-error', (req, res) => {
  let errorNum = (Math.floor(Math.random() * 1000) + 1);
  if (errorNum==13) {
    doesNotExist();
  }
 res.send("Worked this time.")
});

// Note that express error handling middleware should be attached after all
// the other routes and use() calls. 
app.use(errors.express);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Hello world listening on port', port);
});
