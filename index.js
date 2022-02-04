const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require("express-fileupload");
const fs = require("fs-extra");
const ObjectID = require('mongodb').ObjectId;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()

const port = 5000


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());



console.log("ok", process.env.DB_USER);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hcopb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log(err);
  const serviceCollection = client.db("shohozSebha").collection("service");
  const orderCollection = client.db("shohozSebha").collection("orders");
  const reviewCollection = client.db("shohozSebha").collection("reviews");
  const adminCollection = client.db("shohozSebha").collection("admin");


  // Add data to database 
  app.post('/addServices', async (req, res) => {
    const newServices = req.body
    await serviceCollection.insertOne(newServices)
      .then(result => {
        console.log(result.insertedCount)
        res.send(result.insertedCount > 0)
      })
  })



  // Add data to UI 
  app.get('/services', async (req, res) => {
    await serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // Catch Single Data For DAtabase
  app.get('/serviceBook/:id', async (req, res) => {
    await serviceCollection
      .find({ _id: ObjectID(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  //single servce load
  app.get('/service/:id', async (req, res) => {
    await serviceCollection.find({ _id: ObjectID(req.params.id) })
      .toArray((err, service) => {
        res.send(service)
      })
  })

  // Update service
  app.patch('/update/:id', async (req, res) => {
    await serviceCollection.updateOne({ _id: ObjectID(req.params.id) },
      {
        $set: { serviceName: req.body.serviceName, price: req.body.price, description: req.body.description, imageURL: req.body.imageURL }
      })
      .then(result => {
        console.log(result);
        res.send(result)
      })
  })
  // Add DAta OrderCollection
  app.post('/bookOrder', async (req, res) => {
    const data = req.body;
    console.log(data);
    await orderCollection.insertOne({ data }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // Get Data From Server 
  app.get('/bookingList', async (req, res) => {
    await orderCollection.find()
      .toArray((err, items) => {
        res.send(items)
      })
  })


  // Item Add to database 

  app.post('/addReview', async (req, res) => {
    const newReview = req.body;
    console.log('adding new review: ', newReview);
    await reviewCollection.insertOne(newReview)
      .then(result => {
        console.log('inserted count', result.insertedCount);
        res.send(result.insertedCount > 0)
      })
  })

  // Get Data From Server 
  app.get('/reviewList', async (req, res) => {
    await reviewCollection.find()
      .toArray((err, documents) => {
        res.send(documents)
      })
  })


  // Make Admin 
  app.post('/addAdmin', async (req, res) => {
    const data = req.body;
    await adminCollection.insertOne(data).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // Admin Filter 
  app.post('/isAdmin', async (req, res) => {
    const email = req.body.email;
    await adminCollection.find({ email: email }).toArray((error, documents) => {
      res.send(documents.length > 0);
    });
  });


  app.get('/orderList', async (req, res) => {
    await orderCollection.find()
      .toArray((err, items) => {
        res.send(items)
      })
  })


  app.delete('/services/:id', async (req, res) => {
    const id = req.params.id;
    console.log("ok", id);
    const serviceDelete = await serviceCollection.deleteOne({ _id: ObjectID(id) })
    console.log(serviceDelete);
    res.send(serviceDelete);
  })


});

// Show Order list 




app.get('/', (req, res) => {
  res.send('Hello!! Welcome to shohoz-sebha')
})



app.listen(process.env.PORT || port)