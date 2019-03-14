// server.js

const express = require('express');
const WebSocket = require('ws');
const uuid = require("uuid");
const SocketServer = WebSocket.Server;

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.broadcast = (data) => {
    wss.clients.forEach(function (client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
      }
    });
  };

function sendNumUsers() {
    wss.broadcast({
      type:"numUsers",
      users: usersOnline
});
}

function assignColor() {
  const colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
      '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
      '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
      '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
      '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
      '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
      '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
      '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
      '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
      '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
  const colorChoice = colorArray[Math.floor(Math.random()*colorArray.length)];
  const message = {
    type: 'colorAssignment',
    color: colorChoice
  }
  return JSON.stringify(message);
}

let usersOnline = 0;
wss.on('connection', (ws) => {
  console.log('Client connected');
  usersOnline ++;
  sendNumUsers();
  ws.send(assignColor());


  ws.on('message', (message) => {
    messageObj = JSON.parse(message);
    messageObj.id = uuid();
    switch(messageObj.type) {
      case 'incomingNotification' :
        messageObj.type = 'postNotification';
        wss.broadcast(messageObj);
        break;
      case 'incomingMessage' :
        console.log('Sending message');
        messageObj.type = 'postMessage';
        wss.broadcast(messageObj);
        break;
      case 'incomingPicture' :
        messageObj.type = 'postPicture';
        wss.broadcast(messageObj);
        break;
      case Default :
        console.log("For some reason in the default");
        break;
    }
  });


  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected');
    usersOnline --;
    sendNumUsers();
  });
});
