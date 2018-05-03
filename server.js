const dotenv = require('dotenv').load();
const http = require('http');
const app = require('./app');

const port = process.env.PORT;
const hostname = 'localhost';
const server = http.createServer(app);
server.listen(port, hostname, () => {
    console.log(`The server is now running at: http://${hostname}:${port}`);
});