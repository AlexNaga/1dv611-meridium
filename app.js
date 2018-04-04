const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const logger = require('morgan');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const path = require('path');

mongoose.connect(
    'mongodb://admin:' + process.env.MONGODB_ATLAS_PASSWORD +
    '@meridium-shard-00-00-na4xb.mongodb.net:27017,meridium-shard-00-01-na4xb.mongodb.net:27017,meridium-shard-00-02-na4xb.mongodb.net:27017/test?ssl=true&replicaSet=meridium-shard-0&authSource=admin'
);
mongoose.Promise = global.Promise;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/archives', express.static('archives')); // Make archives folder accessible
app.use(favicon(__dirname + '/public/images/favicon.png'));

// View engine
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: path.resolve(__dirname, 'views/partial'),
    layoutsDir: path.resolve(__dirname, 'views/layout')
}));
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));

// Routes
require('./src/routes')(app);

// Error handling
app.use((req, res, next) => {
    const err = new Error('The resource could not be found.');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});

module.exports = app;