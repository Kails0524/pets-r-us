
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

//Mongoose model imports
const User = require('./models/user');
const { register } = require('./models/user');

const app = express()
const port = 3000

//connection to mongo 
var CONN ='mongodb+srv://azkaban22:RonkDd72@buwebdev-cluster-1.lsdxy.mongodb.net/web340DB?';

mongoose.connect(CONN).then(() => {
  console.log('Connection to MongoDB database was successful');
}).catch(err => {
  console.log('MongoDB Error: ' + err.message);
});

//Static Files Images, JS, CSS Styles
app.use(express.static('public'));
app.use("/images", express.static(__dirname + "public/images"));
app.use("/public/images", express.static(__dirname + "/public/images"));
app.use("/js", express.static(__dirname + "public/js"));
app.use("/styles", express.static(__dirname + "public/styles"));
app.use("/styles/site.css", express.static(__dirname + "public/styles/site.css"));

//HTML Routes
app.engine('.html', require('ejs').__express);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set("views", "./views");

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

app.use(session({
  secret: 's3cret',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

//Passport
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// landing page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})
//Grooming Page
    app.get("/grooming", (req, res) => {
    res.sendFile(__dirname + '/views/grooming.html')
  });

//Boarding Page
app.get("/boarding", (req, res) => {
    res.sendFile(__dirname + '/views/boarding.html')
  });
//Training Page
app.get("/training", (req, res) => {
    res.sendFile(__dirname + '/views/training.html')
  });
//Registration Page
app.get("/register", (req, res) => {
  console.log ('line 77')
    res.sendFile(__dirname + '/views/register.html')
  });


//Registration page
let users = User.find({}, function(err, users) {
  if (err) {
    console.log(err)
    errorMessage = 'MongoDB Exception: ' + err;
  } else {
    errorMessage = null;
  }
  console.log ('line 90')
  app.get('register', function(req,res) {
    res.render('/register', {
      users:users
    })
  })
})

app.post('/register', (req, res, next) => {
  console.log ('line 99')
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  console.log ('line 103')
  User.register(new User({username: username, email: email}), password, function(err, user) {
    console.log ('line 105')
    if (err) {
      console.log(err);
      return res.redirect('/register');
    }
    passport.authenticate("local")(
      req, res, function () {
        console.log ('line 112')
        res.redirect('/register')
    });
  });
})

app.post('users', (req, res) => {
  const userName = req.body.userName;

  console.log(req.body);
  let user = new User ({
    name: userName
  })

  User.create(user, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('register');
    };
  });
})


// Listen on port 3000
app.listen(port, () =>  {
    console.info("Application listening on port" + port);
});

