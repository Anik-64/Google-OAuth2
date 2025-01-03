const express = require('express');
const session = require('express-session');
const passport = require('passport');
const isLoggedIn = require('./isLoggedIn');

require('dotenv').config();
require('./auth');

const app = express();

app.use(express.static("public"));

// Session setup
app.use(
    session({ 
        secret: process.env.SECRET_SESSION_KEY,
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    // res.send(`<a href='/auth/google'>Authenticate with Google</a>`);
    res.sendFile(__dirname + "/public/login.html");
});

app.get('/auth/google',
    passport.authenticate('google', { scope: [ 'email', 'profile' ] })
);

app.get('/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/dashboard',
        failureRedirect: '/auth/failure'
    })
);

app.get('/dashboard', isLoggedIn, (req, res) => {
    res.send(`
        Welcome ${req.user.displayName} to dashboard.
        <a href="/logout">Logout</a>
    `);
});

app.get('/auth/failure', (req, res) => {
    res.send('Something is wrong...');
});

app.get('/logout', (req, res) => {
    req.logOut(err => {
        if (err) {
            return next(err);
        }
        req.session.destroy(() => {
            res.redirect('/'); 
        });
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server runnig at port ${process.env.PORT}`);
});