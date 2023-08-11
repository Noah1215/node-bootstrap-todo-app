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

app.get("/list", (req, res) => {
  db.collection("post")
    .find()
    .toArray((err, result) => {
      if (err) {
        return console.error(err);
      }
      res.render("list.ejs", {
        posts: result,
      });
    });
});

app.post("/addTodo", (req, res) => {
  db.collection("counter").findOne({ name: "numOfPosts" }, (err, result) => {
    let numOfPosts = result.totalposts;

    db.collection("post").insertOne(
      { _id: numOfPosts + 1, title: req.body.title, date: req.body.date },
      (err, result) => {
        console.log("Complete");
        db.collection("counter").updateOne(
          { name: "numOfPosts" },
          { $inc: { totalposts: 1 } },
          (err, result) => {
            if (err) {
              return console.error(err);
            }
          }
        );
      }
    );
  });
});
