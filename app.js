const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const exphbs = require('express-handlebars');
const favicon = require('serve-favicon');
const logger = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const compression = require('compression');
const paginate = require('handlebars-paginate');
require('handlebars-helpers')(['comparison']);

const timestampHelper = require('./src/utils/timestampHelper');
const countdownHelper = require('./src/utils/countdownHelper');

mongoose.connect(process.env.MONGODB);
mongoose.Promise = global.Promise;

app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/public', { maxAge: 3600000 }));

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
require('./src/utils/scheduler').nodeSchedule;

// Routes
require('./src/routes')(app);
app.use('/archives/preview/', express.static('previews')); // Make previews folder accessible

app.use((err, req, res, next) => {
    console.log('err', err);

    // req.session.flash = { message: '404', danger: true };
    res.redirect('/');
});
module.exports = app;