const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const port = 3000;

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});


const wss = new WebSocket.Server({ server });

// Serve the Client html and scripts
app.use(express.static('./client'));

let questions = [];
fs.readFile('./config/questions.json', 'utf8', (err, data) => {
  if (err) {
    console.error("Failed to load questions:", err);
  } else {
    questions = JSON.parse(data).questions;
  }
});

wss.on('connection', ws => {
  console.log('New client connected');
  
  ws.on('message', message => {
    console.log('Received:', message);
    // Handle incoming messages and send quiz data
    ws.send(JSON.stringify(questions));
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});