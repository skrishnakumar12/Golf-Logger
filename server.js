var express = require('express');
var firebase = require("firebase");
const bodyParser = require('body-parser');
//var serviceAccount = require("./serviceAccountKey.json");
//credential: firebase.credential.cert(serviceAccount),

// Setup firebase credentials
var config = {
    //databaseURL: "https://golf-logger-3dce5.firebaseio.com",
    apiKey: "AIzaSyBTe_94ejwFML0VQlGfQwLnMXGHUh0jimc",
    authDomain: "golf-logger-3dce5.firebaseapp.com",
    databaseURL: "https://golf-logger-3dce5.firebaseio.com",
    projectId: "golf-logger-3dce5",
    storageBucket: "golf-logger-3dce5.appspot.com",
    messagingSenderId: "1046893789178"
};
firebase.initializeApp(config);

var db = firebase.database();
var ref = db.ref("entries_table");

// define the Express app
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));

// Express only serves static assets in production
console.log("NODE_ENV: ", process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/build'));
  
  // Return the main index.html, so react-router render the route in the client
  app.get('/', (req, res) => {
    res.sendFile(path.resolve('frontend/build', 'index.html'));
  });
}

// Check for login entered
app.get('/', (req, res) =>{
    res.send('You are now using the site')
})

//Retrieve all the user data
app.get('/:user', (req, res) => {
    let name = req.params.user;
    var scoreEntries = [];
    ref.orderByChild("username").equalTo(name).once("value", function(snapshot) {
        let items = snapshot.val();
        for(let item in items) {
            scoreEntries.push({
                id: item,
                username: items[item].username,
                course_name: items[item].course_name,
                date_score: items[item].date_score,
                score: items[item].score,
            });
        }
        if(scoreEntries.length == 0) {
            res.json({
                message: "There are no scores yet! Add one using the 'Add Score' button",
            });
        }
        else {
            res.json(scoreEntries);
            return;
        }
    });
})

// Insert a new score
app.get('/:user/add', (req, res) => {
    let name = req.params.user;
    let course = req.query.course;
    let date = req.query.date;
    let score = req.query.score;
    ref.push({
        username: name,
        course_name: course,
        date_score: date,
        score: score
    })
})

// Delete a score
app.get('/:user/delete', (req, res) => {
    let user_id = req.query.id;
    var del_ref = firebase.database().ref("entries_table/" + user_id);
    del_ref.remove();
    // res.send("Successfully removed score from table");
})

// start the server
app.listen(app.get('port'), () => {
    console.log(`listening on port ${app.get('port')}`);
});