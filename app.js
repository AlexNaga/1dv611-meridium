const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const exphbs = require('express-handlebars');
const favicon = require('serve-favicon');
const logger = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const helpers = require('handlebars-helpers')(['comparison']);

mongoose.connect(
    'mongodb://admin:' + process.env.MONGODB_ATLAS_PASSWORD +
    '@meridium-shard-00-00-na4xb.mongodb.net:27017,meridium-shard-00-01-na4xb.mongodb.net:27017,meridium-shard-00-02-na4xb.mongodb.net:27017/test?ssl=true&replicaSet=meridium-shard-0&authSource=admin'
);
mongoose.Promise = global.Promise;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/public'));
app.use('/archives', express.static('archives')); // Make archives folder accessible
app.use(favicon(__dirname + '/public/images/favicon.png'));

// View engine
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: path.resolve(__dirname, 'views/partials'),
    layoutsDir: path.resolve(__dirname, 'views/layout')
}));
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));

app.use(cookieSession({
    name: 'arkivdiumSession',
    keys: [process.env.SESSION_SECRET],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.flash = req.session.flash;
    req.session.flash = null;
    next();
});

// Node schedule
require('./scheduler').nodeSchedule;

// Routes
require('./src/routes')(app);

app.use((req, res, next) => {
    res.sendStatus(404);
    // res.status(404).redirect('/');
    // console.log('err',err);
    // res.status(err.status || 404).json({
    //     error: {
    //         message: err.message
    //     }
    // });
});
module.exports = app;