const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { createSimulator } = require('./flightSimulator');


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;


// simple health endpoint
app.get('/', (req, res) => res.send('Flight simulator WS server running'));


// WebSocket server
const wss = new WebSocketServer({ server });


wss.on('connection', (ws, req) => {
console.log('Client connected');


// create a fresh simulator for this client (so each client can get its own replay)
const sim = createSimulator();

console.log('Starting simulator for client',sim);

const sendPoint = (pt) => {
if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(pt));
};


sim.on('point', sendPoint);


ws.on('close', () => {
console.log('Client disconnected');
sim.stop();
});


ws.on('message', (msg) => {
// optionally accept commands. currently supports: { "cmd": "restart" }
try {
const obj = JSON.parse(msg.toString());
if (obj.cmd === 'restart') sim.restart();
} catch (e) {
// ignore
}
});
});


server.listen(PORT, () => {
console.log(`Server listening on http://localhost:${PORT}`);
});