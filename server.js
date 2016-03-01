var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var sessions = require('client-sessions');
var User = require('./models/UserSchema.js');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var app = express();

mongoose.connect('mongodb://localhost/demo6');

app.use(bodyParser.urlencoded({extended: true }));

app.set('view engine', 'jade');

app.use(express.static(__dirname + '/client'));
app.set('views', path.join(__dirname,'client/views'));

app.use(sessions({
    cookieName: 'userSession',
    secret: 'first-secret',
    duration: 5 * 60 * 1000,
    activeDuration: 60 * 1000,
}));

app.get('/', function(req,res) {
    if(req.userSession.username) {
        console.log(req.userSession.username + ' has logged in');
        res.redirect('/user');
    }
    else {
        res.render('layout');
    }
});

// Sign up 
app.get('/signup', function(req,res) {
    res.render('signUp');
});
app.post('/signup', function(req,res) {
    // var salt = bcrypt.genSaltSync();
    var hash = bcrypt.hashSync(req.body.password, 10)
    var user = new User({
        name: req.body.name,
        password: hash
    }
    );
    user.save(function(err) {
        if(err) throw err;
    })
    res.redirect('/');
});

// Log in with account
app.post('/login', function(req,res,next) {
    console.log(req.body);
    User.findOne({
        name: req.body.name,
    }, function(err, user) {
        if(!user) {
            console.log('cant find him');
            res.redirect('/');
        }
        else {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                console.log('found him');
                console.log(user.password);
                req.userSession.username = req.body.name;
                res.redirect('/');
            }
            else {
                res.redirect('/');
            }
        }
    });
});

// Log out
app.get('/logout', function(req,res) {
    console.log(req.userSession.username + ' has logged out');
    req.userSession.username = "";
    res.redirect('/');
});

// Default layout
app.get('/user', function(req,res) {
    res.render('partials/homePage', {
        username: req.userSession.username
    });
});

// Guest
app.get('/guest', function(req,res) {
    req.userSession.username = 'Guest';
    res.redirect('/');
});

app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), function() {
    console.log("Running on port 5000...");
});
