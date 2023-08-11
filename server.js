const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use("/public", express.static("public"));

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
  res.render("index.ejs");
});

app.get("/add", (req, res) => {
  res.render("add.ejs");
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

app.get("/detail/:id", (req, res) => {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    (err, result) => {
      console.log(result);
      res.render("detail.ejs", { detail: result });
    }
  );
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

app.delete("/delete", (req, res) => {
  req.body._id = parseInt(req.body._id);
  db.collection("post").deleteOne(req.body, (err, result) => {
    if (err) {
      res.status(400);
      return console.error(err);
    }
    res.status(200).send({ message: "Complete!" });
  });
});
