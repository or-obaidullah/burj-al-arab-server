const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()

const app = express();
app.use(cors());
app.use(bodyParser.json());


const admin = require("firebase-admin");
const serviceAccount = require("./configs/burj-al-arab-a4bdd-firebase-adminsdk-ufb1u-095b7ac75e.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'process.env.FIRE_DB'
});


const pass = "Burjarabian2021"


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fi07c.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");

  app.post('/addBooking', (req,res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
    .then(result => {
        res.send(result.insertedCount > 0);
    })
  })

  app.get('/bookings', (req,res) => {
    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
      const idToken = bearer.split(' ')[1];
      admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if(tokenEmail == queryEmail){
            bookings.find({email: queryEmail})
            .toArray((err, documents) => {
                res.status(200).send(documents);
            })
          }
          else{
            res.status(401).send('unAuthorized Access');
          }
        })
        .catch((error) => {
          res.status(401).send('unAuthorized Access');
        });
    }
    else{
      res.status(401).send('unAuthorized Access');
    }

  })


});


app.get('/',(req,res) => {
    res.send('Hello world');
})

app.listen(5000)