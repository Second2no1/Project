const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

let checkHistory = {};

app.post('/log-check', (req, res) => {
  const { location, officer, time } = req.body;
  if (!checkHistory[location]) checkHistory[location] = [];
  checkHistory[location].push({ officer, time });
  res.status(200).send('Check logged');
});

app.get('/get-check-history/:location', (req, res) => {
  const location = req.params.location;
  res.status(200).json(checkHistory[location] || []);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
