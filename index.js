
// Import the Express module
var express = require('express');

// Import the 'path' module (packaged with Node.js)
var path = require('path');

// Create a new instance of Express
var app = express();
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var session = require('cookie-session')
var axios = require('axios')
var Quarters = require('node-quarters')

var config = require('./config')

// get quarters instance
var quarters = new Quarters(config.quarters)

var router = express.Router()

// Import the fs
var fs = require('fs');
// Import the Anagrammatix game file.
var agx = require('./agxgame');

// to cache user data and tokens 
const userCache = {}

app.use(
  session({
    name: 'session',
    keys: ['keyboard cat'],
    maxAge: 10 * 24 * 60 * 60 * 1000 // 10 days
  })
)

//creating server if not exists

var file ="mydb.db";
var exists = fs.existsSync(file);

if(!exists) {
  console.log("Creating DB file.");
  fs.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

db.serialize(function() {
  if(!exists) {
    db.run("CREATE TABLE player (player_name TEXT, player_win INT)");
  }
});


// Create a simple Express application
app.use(express.static(path.join(__dirname,'public')));

// Create a Node.js based http server on port 8080
var server = require('http').createServer(app).listen(process.env.PORT || 8080);

// Create a Socket.IO server and attach it to the http server
var io = require('socket.io').listen(server);

// Reduce the logging output of Socket.IO
io.set('log level',1);

// Listen for Socket.IO Connections. Once connected, start the game logic.
io.sockets.on('connection', function (socket) {
    //console.log('client connected');
    agx.initGame(io, socket,db);
});

var jsonParser = bodyParser.json()

app.use(bodyParser.json());

app.post('/code', function(req, res, next) {
	//console.log(req.body)
  var code = req.body.code

  // create refresh token for user and fetch user
  return quarters
    .createRefreshToken(code)
    .then(({access_token, refresh_token}) => {
      // fetch user
      return quarters.fetchUser(access_token).then(userInfo => {
        // set user details
        userCache[userInfo.id] = userInfo
        // set session userid
        req.session.userId = userInfo.id
        return res.json({
          access_token: access_token,
          refresh_token: refresh_token,
          id: userInfo.id
        })
      })
    })
    .catch(e => {
      console.log(e)
      return res.status(400).json({
        message: e.message || 'Something went wrong. Try again.'
      })
    })
})

app.post('/join', function(req, res, next) {
  if (!req.session.userId && !userCache[req.session.userId]) {
    return res.status(401).json({
      message: 'Unauthorized'
    })
  }

  var txId = req.body.txId
  if (!txId) {
    return res.status(400).json({
      message: 'txId is required'
    })
  }

  // check if tx id is valid and wait for confirmation
  rooms[roomId] = rooms[roomId] || []
  rooms[roomId].push(req.session.userId)

  // emit joined event to socket
  config.io.to('rooms').emit(
    'joined',
    JSON.stringify({
      event: 'joined',
      roomId: roomId,
      id: req.session.userId,
      name: userCache[req.session.userId].displayName
    })
  )

  if (rooms[roomId].length == 2) {
    // transfer to winner
    transferToWinner(roomId)
      .then(() => {
        delete rooms[roomId]
        // send room id
        res.json({
          room: roomId
        })
      })
      .catch(e => {
        console.log(e)
        res.status(400).json({
          message: e.message || 'Something went wrong.'
        })
      })
  } else {
    // send room id
    res.json({
      room: roomId
    })
  }
})
