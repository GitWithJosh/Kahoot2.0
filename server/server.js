const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;
const upload = multer();

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const wss = new WebSocket.Server({ server });
wss.on('listening', () => {
  console.log('WebSocket server started');
});

// Initially set on False when no room has been created
let game_created = false;

// Serve the Client html and scripts
app.use(express.static('./client'));

// Manually handle requests to the root path
app.get('/', (req, res) => {
  console.log('GET request to /');
  if (game_created === false) {
    // Show master player screen
    res.sendFile(path.join(__dirname, '../client/master/start_screen/start.html'));
  } else {
    // Show player screen
    res.sendFile(path.join(__dirname, '../client/player/start_screen/start.html'));
  }
});

// Create game room with master player
wss.on('connection', (ws) => {
  console.log('Client connected');
});

// Use JSON middleware for parsing JSON data
app.use(express.json());

// Use decode middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

function generateID() {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substr(2, 9);
  return timestamp + randomString;
}

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
app.post('/master/upload', upload.single('quizFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Load the uploaded quiz file into JSON
  const quizFile = req.file;
  await writeJsonFile('./game_data/questions.json', JSON.parse(quizFile.buffer.toString()))
  res.status(200).json({message: 'File uploaded'});
});

// Load questions from file
questions = readJsonFile('./game_data/questions.json');

app.post('/master/create_game', async (req, res) => {
  // Create game room with master player
  if (game_created == true) {
    res.status(400).json({ message: 'Game room already created' });
  }
  else{
    try{
      // Set game_created to true
      game_created = true;
      res.status(200).json({ message: 'Game room created' });
    } catch (err) {
      console.error('Failed to create game:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

app.get('/master/get_players', async (req, res) => {
  // Get all players
  if (game_created === false) {
    res.status(400).json({ message: 'Game room not created' });
  }
  else {
    try{
      const players = await readJsonFile('./game_data/players.json');
      const playerNames = Object.keys(players).map((id) => players[id].name);
      res.status(200).json({ players: playerNames });
    } catch (err) {
      console.error('Failed to get players:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

app.post('/player/join_game', async (req, res) => {
  // Add User to JSON file
  const playerName = req.body.name
  console.log(playerName)
  let players = await readJsonFile('./game_data/players.json');
  if (game_created === false) {
    res.status(400).json({ message: 'Game room not created' });
  }
  else if (Object.keys(players).length >= 40) {
    res.status(400).json({ message: 'Game room full' });
  }
  else {
    try{
      const id = generateID();
      // Add player with a unique ID to players list and set score to 0
      players[id] = {
        name: playerName,
        score: 0
      };
      await writeJsonFile('./game_data/players.json', players);
      res.status(200).json({ message: 'Player added', id: id});
    } catch (err) {
      console.error(`Failed to add player ${playerName}:`, err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

app.post('/master/start_game', async (req, res) => {
  // Start the game
  let players = await readJsonFile('./game_data/players.json');
  if (game_created === false) {
    res.status(400).json({ message: 'Game room not created' });
  }
  else if (Object.keys(players).length < 1) {
    res.status(400).json({ message: 'Not enough players' });
  }
  else {
      // Send questions to all players
      res.status(200).json({ message: 'Game started' });
      broadcastMessage(JSON.stringify({ type: 'start-game' }));
      broadcastMessage('./game_data/players.json');
      await game_loop();
  }
});

let answersReceived; // Declare answersReceived variable globally
let timeoutId; // Declare timeoutId variable globally

async function game_loop(){
  console.log(questions)
  for (let i = 0; i < Object.keys(questions).length; i++) {
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
  if (answersReceived === Object.keys(players).length) {
    // Cancel game loop timer
    clearTimeout(timeoutId);
  }
}

app.post('/player/score', async (req, res) => {
  // Get score from player
  if (game_created === false) {
    res.status(400).json({ message: 'Game room not created' });
  }
  else {
    try{
      // Add score to player
      players = await readJsonFile('./game_data/players.json');
      const id = req.body.id;
      const score = req.body.score;
      players[id].score += score;
      await writeJsonFile('./game_data/players.json', players);
      res.status(200).json({ message: 'Score added' });

      // Check if all players have answered
      handleAnswer(players);
    } catch (err) {
      console.error(`Failed to add score:`, err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

app.post('/master/end_game', async (req, res) => {
  // End the game
  if (game_created === false) {
    res.status(400).json({ message: 'Game room not created' });
  }
  else {
    // Delete all players
    game_created = false;
    await writeJsonFile('./game_data/players.json', {"players": {}});
    res.status(200).json({ message: 'Game ended' });
  }
});