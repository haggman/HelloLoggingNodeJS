//Load the express server
const express = require('express');
const app = express();

//setup a Winston logger adding GCP support
const winston = require('winston');
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

//Generate an exception 
app.get('/error', (req, res) => {
 logger.error("Something blew up!")

 res.send("Broken now, come back later.")
});


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Hello world listening on port', port);
});