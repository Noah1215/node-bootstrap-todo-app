const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { log } = require("console");
app.use(bodyParser.urlencoded({ extended: true }));

//REST 원칙

app.listen(8080, () => {
  console.log("listening on 8080");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/add", (req, res) => {
  res.sendFile(__dirname + "/add.html");
});

app.post("/addTodo", (req, res) => {
  res.send("Complete!");
  console.log(req.body.title);
});
