const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const exphbs = require('express-handlebars');
const favicon = require('serve-favicon');
const logger = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

const timestampHelper = require('./src/utils/timestampHelper');
const countdownHelper = require('./src/utils/countdownHelper');
const paginate = require('handlebars-paginate');
const helpers = require('handlebars-helpers')(['comparison']);

mongoose.connect(process.env.MONGODB);
mongoose.Promise = global.Promise;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/public'));
app.use('/archives', express.static('archives')); // Make archives folder accessible
app.use('/previews', express.static('previews')); // Make previews folder accessible
app.use(favicon(__dirname + '/public/images/favicon.png'));

// View engine
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: path.resolve(__dirname, 'views/partials'),
    layoutsDir: path.resolve(__dirname, 'views/layout'),
    helpers: {
        paginate: paginate,
        timeSince: timestampHelper,
        countDown: countdownHelper
    }
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
    req.session.flash = { message: '404', danger: true };
    res.status(404).redirect('/');
});
module.exports = app;