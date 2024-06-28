const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const port = 3000;

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const wss = new WebSocket.Server({ server });

// Serve the Client html and scripts
app.use(express.static('./client'));

// Use JSON middleware for parsing JSON data
app.use(express.json());

// Use decode middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

// readJsonFile and writeJsonFile functions
function readJsonFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        console.log(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

function writeJsonFile(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        reject(err);
        console.log(err);
      } else {
        resolve();
      }
    });
  });
}

function broadcastMessage(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// (Optional) Let user upload questions file
  // Load the uploaded quiz file into memory

app.post('master/upload', upload.single('quizFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Load the uploaded quiz file into JSON
  const quizFile = req.file;
  writeJsonFile('./game_data/questions.json', JSON.parse(quizFile.buffer.toString()))
});

// Load questions from file
questions = await readJsonFile('./game_data/questions.json').questions;

// Create game room with master player
wss.on('connection', (ws) => {
  console.log('Client connected');
  if (players.length == 0) {
    // Show master player screen
  }
  else {
    // Show player screen
  }
});

// Initially set on False when no room has been created
game_created = false;

app.post('master/create_game', async (req, res) => {
  // Create game room with master player
  if (game_created === true) {
    res.status(400).json({ message: 'Game room already created' });
  }
  else{
    try{
      // Add master player to JSON file
      players = await readJsonFile('./game_data/players.json');
      if (!players.master) players.master = [];
      players.master.push(req.body.name);
      await writeJsonFile('./game_data/players.json', players);
      // Set game_created to true
      game_created = true;
      res.status(200).json({ message: 'Game room created' });
    } catch (err) {
      console.error('Failed to create game:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

app.post('player/join_game', async (req, res) => {
  // Add User to JSON file
  const playerName = req.body.name
  
  if (game_created === false) {
    res.status(400).json({ message: 'Game room not created' });
  }
  else if (players.length >= 40) {
    res.status(400).json({ message: 'Game room full' });
  }
  else {
    try{
    players = await readJsonFile('./game_data/players.json').players;
    // Add player to players list and set score to 0
    players.push(playerName);
    players[playerName] = { score: 0 };
    await writeJsonFile('./game_data/players.json', players);
    res.status(200).json({ message: 'Player added' });
    
    } catch (err) {
      console.error(`Failed to add player ${playerName}:`, error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

app.post('master/start_game', async (req, res) => {
  // Start the game
  if (game_created === false) {
    res.status(400).json({ message: 'Game room not created' });
  }
  else if (players.length < 1) {
    res.status(400).json({ message: 'Not enough players' });
  }
  else {
      // Send questions to all players
      res.status(200).json({ message: 'Game started' });
      //broadcastMessage('./game_data/questions.json');
      await game_loop();
      broadcastMessage('./game_data/players.json');
  }
});

let answersReceived; // Declare answersReceived variable globally
let timeoutId; // Declare timeoutId variable globally

async function game_loop(){
  for (let i = 0; i < questions.length; i++) {
    // Show question to all players
    const message = {
      type: 'next-question',
      question: questions[i],
    };
    broadcastMessage(JSON.stringify(message));
    // Start timer for 30 seconds and wait for all players to send response
    answersReceived = 0;
    await new Promise((resolve) => timeoutId = setTimeout(resolve, 30000)); 
    broadcastMessage('./game_data/players.json')
  }
}

function handleAnswer(players) {
  answersReceived ++;
  if (answersReceived === players.length) {
    // Cancel game loop timer
    clearTimeout(timeoutId);
  }
}

app.post('player/score', async (req, res) => {
  // Get score from player
  if (game_created === false) {
    res.status(400).json({ message: 'Game room not created' });
  }
  else {
    try{
      // Add score to player
      players = await readJsonFile('./game_data/players.json');
      const playerName = req.body.name;
      const score = req.body.score;
      players[playerName].score += score;
      await writeJsonFile('./game_data/players.json', players);
      res.status(200).json({ message: 'Score added' });

      // Check if all players have answered
      handleAnswer(players);
    } catch (err) {
      
      console.error(`Failed to add score to player ${playerName} :`, error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

app.post('master/end_game', async (req, res) => {
  // End the game
  if (game_created === false) {
    res.status(400).json({ message: 'Game room not created' });
  }
  else {
    // Delete all players
    game_created = false;
    await writeJsonFile('./game_data/players.json', {"master": [], "players": []});
    res.status(200).json({ message: 'Game ended' });
  }
});