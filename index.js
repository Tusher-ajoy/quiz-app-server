const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aqab4.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
  // tempQuiz collection
  const tempQuizCollection = client
    .db(process.env.DB_NAME)
    .collection("tempQuiz");

  // questions collection
  const questionsCollection = client
    .db(process.env.DB_NAME)
    .collection("questions");

  //Quiz collection
  const quizzesCollection = client
    .db(process.env.DB_NAME)
    .collection("quizzes");

  //Admin collection
  const adminCollection = client.db(process.env.DB_NAME).collection("admins");

  const enrolledCollection = client
    .db(process.env.DB_NAME)
    .collection("enrolled");

  // get all data from tempQuiz collection
  app.get("/allTempQuiz", (req, res) => {
    tempQuizCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  // get one data from tempQuiz collection
  app.post("/oneTempQuiz", (req, res) => {
    tempQuizCollection
      .find({ _id: ObjectId(req.body.id) })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });
  //inserting in tempQuiz collection
  app.post("/createQuiz", (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const img = file.data;
    const encImg = img.toString("base64");
    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    //send to database
    tempQuizCollection
      .insertOne({ title, description, price, image })
      .then((result) => {
        res.send(result.acknowledged);
      });
  });
  //delete data from tempQuiz
  app.delete("/deleteTempQuiz/:id", (req, res) => {
    tempQuizCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });

  //inserting in questions collection
  app.post("/addQuestion", (req, res) => {
    const { name, A, B, C, D, ans, qId } = req.body;
    questionsCollection
      .insertOne({ name, A, B, C, D, ans, qId })
      .then((result) => {
        res.send(result.acknowledged);
      });
  });
  //get data for a quiz from question collection
  app.post("/getQuestion", (req, res) => {
    const { id } = req.body;
    questionsCollection.find({ qId: id }).toArray((err, documents) => {
      res.send(documents);
    });
  });
  //delete question from questions collection
  app.delete("/deleteQuestion/:id", (req, res) => {
    questionsCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });

  //inserting in quizzes collection
  app.post("/addQuiz", (req, res) => {
    quizzesCollection.insertOne(req.body).then((result) => {
      res.send(result.acknowledged);
    });
  });
  // get all data from quizzes collection
  app.get("/allQuizzes", (req, res) => {
    quizzesCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  //get quizzes by id from quizzes collection
  app.post("/getQuizzes", (req, res) => {
    quizzesCollection.find({ qId: req.body.qId }).toArray((err, documents) => {
      res.send(documents);
    });
  });
  //delete from quizzes collection
  app.delete("/deleteQuizzes/:id", (req, res) => {
    quizzesCollection.deleteOne({ qId: req.params.id }).then((result) => {
      res.send(result.deletedCount > 0);
    });
  });

  //inserting in admin collection
  app.post("/addAdmin", (req, res) => {
    adminCollection.insertOne(req.body).then((result) => {
      res.send(result.acknowledged);
    });
  });
  //get admin
  app.post("/getAdmin", (req, res) => {
    const { email } = req.body;
    adminCollection.find({ email: email }).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //inserting in enrolled collection
  app.post("/enrolled", (req, res) => {
    enrolledCollection.insertOne(req.body).then((result) => {
      res.send(result.acknowledged);
    });
  });
  //get enrolled data by qId from enrolled collection
  app.get("/enrolled/:qId", (req, res) => {
    enrolledCollection
      .find({ qId: req.params.qId })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });
  //get form enrolled collection using email and qid
  app.post("/getEnrolledData", (req, res) => {
    const { qId, email } = req.body;
    enrolledCollection
      .find({ email: email, qId: qId })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });
  //get form enrolled collection using email
  app.post("/getEnrolledDataByEmail", (req, res) => {
    const { email } = req.body;
    enrolledCollection.find({ email: email }).toArray((err, documents) => {
      res.send(documents);
    });
  });
  //delete from enrolled collection
  app.delete("/deleteEnroll/:id", (req, res) => {
    enrolledCollection.deleteMany({ qId: req.params.id }).then((result) => {
      res.send(result.deletedCount > 0);
    });
  });
});

app.listen(process.env.PORT || port);
