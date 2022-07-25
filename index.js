
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const helmet = require("helmet");
const csurf = require("csurf");
const fs = require('fs');
const Services = require("./public/data/services.json");

//Mongoose model imports
const User = require('./models/user');
const Appointment = require('./models/appointments');
const { render } = require('ejs');

const app = express()
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
const csurfProtection = csurf({cookie: true});


//Static Files Images, CSS Styles
app.use(express.static('public'));
app.use("/images", express.static(__dirname + "public/images"));
app.use("/public/images", express.static(__dirname + "/public/images"));
app.use("/styles", express.static(__dirname + "public/styles"));
app.use("/styles/site.css", express.static(__dirname + "public/styles/site.css"));

app.use(session({
  secret: 's3cret',
  resave: true,
  saveUninitialized: true
}));

//Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//connection to mongo 
var CONN ='mongodb+srv://azkaban22:RonkDd72@buwebdev-cluster-1.lsdxy.mongodb.net/web340DB?';
mongoose.connect(CONN).then(() => {
  console.log('Connection to MongoDB database was successful');
}).catch(err => {
  console.log('MongoDB Error: ' + err.message);
});

/**
 * New
 */
app.use((req, res, next) => {
  if (req.session.passport) {
      console.log(req.session.passport.user);
      res.locals.currentUser = req.session.passport.user;
  } else {
      res.locals.currentUser = null;
  }
  next();
})

//csrf protection
app.use(csurfProtection);
app.use((req, res, next) => {
    const token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token);
    res.locals.csrfToken = token;
    next();
})
app.use(helmet.xssFilter());

app.set('views', path.join(__dirname, 'views'));
app.set("views", "./views");
app.set('view engine', 'ejs');





// landing page
app.get('/', (req, res) => {
  let errorMessage = '';

  User.find({}, function(err, users) {
    if (err) {
      console.log(err)
      errorMessage = 'MongoDB Exception: ' + err;
    } else {
      errorMessage = null;
    }
  })
    res.render(__dirname + '/views/index.ejs')
})

//Grooming Page
    app.get("/grooming", (req, res) => {
    res.render(__dirname + '/views/grooming.ejs')
  });

//Boarding Page
app.get("/boarding", (req, res) => {
    res.render(__dirname + '/views/boarding.ejs')
  });
//Training Page
app.get("/training", (req, res) => {
    res.render(__dirname + '/views/training.ejs')
});


//Registration Page
app.get('/register', (req, res) => {
  //res.render('register')
  User.find({}, function (err, user) {
      if (err) {
          console.log(err)
      } else {
          res.render("register", {
              users: user
          })
      }
  })
})

//pull input from register's page
app.post('/register', async(req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  console.log(username + " " + password + " " + email);
  User.register(new User({ username: username, email: email }),
      password, function (err, user) {
          if (err) {
              console.log(err);
              return res.redirect('/register')
          }

          passport.authenticate("local")(
              req, res, function () {
                  res.redirect('/')
              });
      });
})



//Login Page 
app.get("/login", (req, res) => {
  res.render(__dirname + '/views/login.ejs')
});

//Login and Logout
app.post("/login",passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
  }),function (req, res) {
});
app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});



//Schedule Appointment Page
app.get('/schedule', (req,res) =>{

  let serviceJsonFile =fs.readFileSync("./public/data/services.json");
  let services = JSON.parse(serviceJsonFile); 

  Appointment.find({}, (err, appointM ) =>{
      if (err){
          console.log(err)
          errorMessage = 'MongoDB Exception: ' + err;
      }else { 
          errorMessage = null; 
      }
      res.render('schedule', {
          services: services   
                    
      })
      
  }) 
  
  
})
//check isLoggedIn
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
}
//pull input from appointment page gage
app.post('/schedule', isLoggedIn, (req, res, next) => {
  const username = res.locals.currentUser;
  const lastName = req.body.lastName;
  const firstName = req.body.firstName;
  const service = req.body.services;
  const email = req.body.email;

  let bookAppoint = new Appointment({
  userName: username,
  lastName: lastName,
  firstName: firstName,
  email: email,  
  service: service,
  })

  Appointment.create(bookAppoint, (err, bookAppoint) => {
    if(err){
      console.log(err);
    }else {    
      res.redirect("/")
    }
    passport.authenticate("local")(
      req, res, function() {
        res.redirect('/profile')
      });

    }); 

});  
    
// find appointment data from json
app.get("/api/appointments", isLoggedIn, async (req, res) => {
  Appointment.find({}, function (err, appointments) {
    console.log(appointments);
    if (err) {
      console.log(err);
    } else {
      res.json(appointments);
    }
  });
});


app.get("/profile", isLoggedIn, async (req, res) => {
  let username = req.session.passport.user;
  let email = req.body.email;
  res.locals.currentUser = username;
  Appointment.findOne({ username: username }, function (err, appointments) {
    if (err) {
      console.log(err);
    } else {
      // res.json(appointments);
      res.render("profile", {
        title: "Pets-R-Us: profile",
        profilecardTitle: "My Profile",
        appointments: appointments,
        email: email,
        username: username,
      });
    }
  });
}); 


// Listen on port 3000
app.listen(PORT, () =>  {
    console.info("Application listening on port" + port);
});
