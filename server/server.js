const express = require('express');
const mockDB = require('./data.mock');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

const jwtSecretString = 'everybody loves ice cream';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Login user via username and password
 */
app.post('/login', function (req, res) {
  const loginData = req.body;

  if (!loginData || !loginData.username || !loginData.username) {
    return res.status(400).send('Please enter valid data!');
  }

  const user = mockDB.users.find(user => user.username === loginData.username);

  if (!user) {
    return res.status(400).send('Username or password is wrong!');
  }

  if (user && user.password !== loginData.password) {
    return res.status(400).send('Username or password is wrong!');
  }

  // generate token
  // generate refresh token
  res.send(user);
});

/**
 * Get job list for current user
 */
app.get('/job-list', function (req, res) {
  const userId = req.query.userId;

  if (!userId) {
    res.status(400).send('There is no user data');
  }

  const jobList = mockDB.jobs.filter(job => job.user_id === userId);

  res.send(jobList);
});

app.post('/refresh-token', function (req, res) {
  // update access and refresh tokens
});

app.listen(8000, function () {
  console.log('Server listening on port 8000!');
});

function getAccessToken(payload) {
  return jwt.sign({user: payload}, jwtSecretString, { expiresIn: '15min' });
}

function getRefreshToken(payload) {
  // get all user's refresh tokens from DB
  const userRefreshTokens = mockDB.tokens.filter(token => token.userId === payload.id);

  // check if there are 5 or more refresh tokens,
  // which have already been generated. In this case we should
  // remove all this refresh tokens and leave only new one for security reason
  if (userRefreshTokens.length >= 5) {
    mockDB.tokens = mockDB.tokens.filter(token => token.userId !== payload.id);
  }

  const refreshToken = jwt.sign({user: payload}, jwtSecretString, { expiresIn: '30d' });

  mockDB.tokens.push({
    id: uuidv1(),
    userId: payload.id,
    refreshToken
  });

  return refreshToken;
}
