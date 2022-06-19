var express = require("express");
var app = express()

// route to pets-r-us landing page
app.get("/index", function(request, response) {
    response.send("Welcome to the Pets-R-Us homepage!");
});


// route to grooming page
app.get("/grooming", function(request, response) {
    response.send("Welcome to the Pets-R-Us grooming page.");
});

// Error if page requested in not found
app.use(function(request, response) {
    response.status(404) .send("Page not found!")
});

app.listen(3000);