
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const history = require('connect-history-api-fallback');
const Oauth2Strategy = require('passport-oauth2');
const passport = require('passport');
const path = require('path');
const Redis = require('ioredis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const swc_scopes = require('./serverSrc/swc_scopes');

if( process.env.NODE_ENV === 'local') {
    const dotenv = require("dotenv");
    dotenv.config();
}

app = express();
app.use(bodyParser.json({ limit: '1mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
app.use(cors());


//Configure session store
const redisClient = new Redis(process.env.REDIS_URL);

app.use(session({
    store: new RedisStore({ client: redisClient, ttl: 8*60*60 }),
    secret: "e527c5ed-574b-4384-b359-069e14621d8e",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 8000*60*60,
        sameSite: 'none',
        secure: true
    }
}));

//configure passport

app.use(passport.initialize());
app.use(passport.session());

const strategyOptions = {
    authorizationURL: process.env.OAUTH_AUTH_URL,
    tokenURL: process.env.OAUTH_TOKEN_URL,
    clientID: process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
    callbackURL: process.env.OAUTH_CALLBACK_URL
};
console.log(strategyOptions)

passport.use(new Oauth2Strategy({
        authorizationURL: process.env.OAUTH_AUTH_URL,
        tokenURL: process.env.OAUTH_TOKEN_URL,
        clientID: process.env.APP_ID,
        clientSecret: process.env.APP_SECRET,
        callbackURL: process.env.OAUTH_CALLBACK_URL
    }, function (accessToken, refreshToken, profile, done) {

        done(null, profile);
    })
);

passport.serializeUser((req, user, done) => {
    console.log('In serializeUser');
    console.log(user);
    console.log(req.session);
    done(null, req.session.id);
});

passport.deserializeUser((req, user, done) => {
    console.log('In deserializeUser');
    console.log(user);
    console.log(req.session)
    done(null, {});
})

app.get('/login', passport.authenticate('oauth2', swc_scopes), (req, res) => {
    console.log('Logging into TPMT');
});

app.get('/oauth2callback', passport.authenticate('oauth2', swc_scopes), (req, res) => {
    console.log('In oauth callback');
    req.session.user = req.user;
    res.redirect('/');
});

//check authentication
function isAuthenticated(req, res, next) {
    console.log('In isAuthenticated');
    console.log(req.session.user);
    if (req.session.user !== undefined) {
        console.log('Is Authenticated next()');
        next();
    } else {
        console.log('redirect to login');
        res.redirect('/login');
    }
};

//Server api routes
app.get('/api/server', (req, res) => {
    res.status(200).send("Hello Server.");
});



//Client routes
const historyOptions = {
    index: '/'
}

app.use(history(historyOptions));

// app.use(serveStatic(path.join(__dirname, 'dist')));

app.get('/', isAuthenticated, (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/*', isAuthenticated, express.static(path.join(__dirname, 'dist')));

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Starting server on port ${port}`);
});