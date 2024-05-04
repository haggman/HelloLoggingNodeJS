//This is a simple NodeJS app designed to explore various Google Cloud
//operations suite products

// ******
// Setting up Cloud Trace
// ******
// If using the older Cloud Trace API
//const tracer = require('@google-cloud/trace-agent').start();

//Using the newer OpenTelemetry API
const opentelemetry = require("@opentelemetry/api");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { SimpleSpanProcessor, BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const {
  TraceExporter,
} = require("@google-cloud/opentelemetry-cloud-trace-exporter");

// Enable OpenTelemetry exporters to export traces to Google Cloud Trace.
const provider = new NodeTracerProvider();
// Initialize the exporter. When your application is running on Google Cloud,
// you don't need to provide auth credentials or a project id.
const exporter = new TraceExporter();
// Configure the span processor to send spans to the exporter
provider.addSpanProcessor(new BatchSpanProcessor(exporter));

// ******
// Enable Error Reporting
// ******
// Import the GCP ErrorReporting library
const {ErrorReporting} = require('@google-cloud/error-reporting');
const errors = new ErrorReporting({
  reportMode: 'always', //as opposed to only while in production
  serviceContext: {
    service: 'hello-logging-js',
    version: '1.0',
  }
});

// ******
// Enable the Profiler
// ******
require('@google-cloud/profiler').start({
  serviceContext: {
    service: 'hello-logging-js',
    version: '1.0',
  },
});

//Setup a listener to catch all uncaught exceptions
process.on('uncaughtException', (e) => {
    // Write the error to stderr.
    console.error(e);
    // Report that same error the Error Service
    errors.report(e);
});

// ******
// Setup a Winston logger adding GCP support
// ******
//Not a best practice, but some coders still prefer
//using logging libraries
const winston = require('winston');
//Here's the GCP addon
const {LoggingWinston} = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: 'info', //default logging level
  transports: [
    // Add GCP Logging
    loggingWinston,
  ],
});

// ******
//Load the express server
// ******
const express = require('express');
const app = express();
app.disable('etag'); //so it will return 200 and 304 etc. codes.

//Setup some values used later in code
const { v1: uuidv1 } = require('uuid');
const containerID = uuidv1();
const funFactor = Math.floor(Math.random() * 5) + 1; //just for fun

// ******
// The web routes start here
// ******

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
  





//Generates an uncaught exception every 1000 requests
app.get('/random-error', (req, res) => {
  error_rate = parseInt(req.query.error_rate) || 20
  let errorNum = (Math.floor(Math.random() * error_rate) + 1);
  if (errorNum==1) {
    console.log("Called /random-error, and it's about to error");
    doesNotExist();
  }
 console.log("Called /random-error, and it worked");
 res.send("Worked this time.");
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

//Generates a slow request
//If you wanted more trace detail, you could use tracer and create some 
//extra spans, like
//const customSpan1 = tracer.createChildSpan({name: 'slowPi'});
//customSpan1.endSpan();
app.get('/slow', (req, res) => {
    let pi1=slowPi();

    let pi2=slowPi2();

    res.send(`Took it's time. pi to 1,000 places: ${pi1}, pi to 10,000 places: ${pi2}`);
});

function slowPi(){
    let pi = piCalc(1000n);
    console.log(`How's this pi? ${pi}`);
    return pi;
}

function slowPi2(){
    let pi = piCalc(10000n);
    console.log(`Here's a bigger pi? ${pi}`)
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

// Expose the environment variables so these can demo ENV variable injection in Cloud Run, GKE etc
app.get('/env', (req, res) => {
  console.log(`Getting env vars`)
  res.setHeader('content-type', 'text/plain');
  res.send(JSON.stringify(process.env, null, 4))
});

// Note that express error handling middleware should be attached after all
// the other routes and use() calls. 
app.use(errors.express);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Hello world listening on port', port);
});
