const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(bodyParser.json());

let checkHistory = {};

// Load data from file on server start
fs.readFile('checkHistory.json', (err, data) => {
  if (err && err.code !== 'ENOENT') {
    console.error('Error reading file:', err);
  } else if (data) {
    checkHistory = JSON.parse(data);
  }
});

// Save data to file
function saveData() {
  fs.writeFile('checkHistory.json', JSON.stringify(checkHistory, null, 2), (err) => {
    if (err) {
      console.error('Error writing file:', err);
    }
  });
}

app.post('/log-check', (req, res) => {
  const { location, officer, time } = req.body;
  if (!checkHistory[location]) checkHistory[location] = [];
  checkHistory[location].push({ officer, time });
  saveData();
  res.status(200).send('Check logged');
});

app.get('/get-check-history/:location', (req, res) => {
  const location = req.params.location;
  res.status(200).json(checkHistory[location] || []);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
