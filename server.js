const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
let db;

MongoClient.connect(
  "mongodb+srv://cwpark1215:park1215@todoapp.amydrnc.mongodb.net/",
  (error, client) => {
    if (error) return console.log(error);

    db = client.db("todoapp");

    app.listen("8080", function () {
      console.log("listening on 8080");
    });
  }
);
//REST 원칙

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/add", (req, res) => {
  res.sendFile(__dirname + "/add.html");
});

app.post("/addTodo", (req, res) => {
  res.send("Complete!");
  db.collection("post").insertOne(
    { title: req.body.title, date: req.body.date },
    (err, result) => {
      console.log("Complete");
    }
  );
});

app.get("/list", (req, res) => {
  res.render("list.ejs");
});
