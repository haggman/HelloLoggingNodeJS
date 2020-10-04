//Setup for tracing
const tracer = require('@google-cloud/trace-agent').start();

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

//setup a Winston logger adding GCP support
const winston = require('winston');
//Here's the GCP addon
const {LoggingWinston} = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();

// Create a Winston logger that streams to GCP Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
const logger = winston.createLogger({
  level: 'info', //default logging level
  transports: [
    // Add GCP Logging
    loggingWinston,
  ],
});


//Setup some values used later in code
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
  logger.info("/log version of Hello World received a request")
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

//Generates a slow request
app.get('/slow', (req, res) => {
    let pi1=slowPi();

    let pi2=slowPi2();
    res.send(`Took it's time. pi to 1,000 places: ${pi1}, pi to 100,000 places: ${pi2}`);
});

function slowPi(){
    let pi = piCalc(1000n);
    console.log(`How's this pi? ${pi}`);
    return pi;
}

function slowPi2(){
    let pi = piCalc(100000n);
    console.log(`A better pi? ${pi}`)
    return pi;
}

//Use one of the many techniques to calculate 
//pi to "count" places. This is a variation of
//Ramanujan's formula.
function piCalc(count){
    let i = 1n;
    count = count + 20n
    let x = 3n * (10n ** count);
    let pi = x;
    while (x > 0) {
            x = x * i / ((i + 1n) * 4n);
            pi += x / (i + 2n);
            i += 2n;
    }
    pi = pi / (10n ** 20n);
    console.log(pi);
    return pi;
}

// Note that express error handling middleware should be attached after all
// the other routes and use() calls. 
app.use(errors.express);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Hello world listening on port', port);
});
