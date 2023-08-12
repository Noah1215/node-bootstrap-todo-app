const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
require("dotenv").config();

app.use("/public", express.static("public"));
app.use(
  session({ secret: "secretCode", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

let db;

MongoClient.connect(process.env.DB_URL, (error, client) => {
  if (error) return console.log(error);

  db = client.db("todoapp");

  app.listen(process.env.PORT, function () {
    console.log("listening on 8080");
  });
});
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

app.get("/edit/:id", (req, res) => {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    (err, result) => {
      if (err) return console.error(err);
      res.render("edit.ejs", { post: result });
    }
  );
});

app.get("/mypage", isUser, (req, res) => {
  res.render("myPage.ejs", { user: req.user });
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.put("/edit", (req, res) => {
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { title: req.body.title, date: req.body.date } },
    (err, result) => {
      if (err) return console.error(err);
      console.log("Edit: Complete");
      res.redirect("/list");
    }
  );
});

app.post("/addTodo", (req, res) => {
  db.collection("counter").findOne({ name: "numOfPosts" }, (err, result) => {
    let numOfPosts = result.totalposts;

    db.collection("post").insertOne(
      { _id: numOfPosts + 1, title: req.body.title, date: req.body.date },
      (err, result) => {
        console.log("Add: Complete");
        db.collection("counter").updateOne(
          { name: "numOfPosts" },
          { $inc: { totalposts: 1 } },
          (err, result) => {
            if (err) {
              return console.error(err);
            }
            res.redirect("/list");
          }
        );
      }
    );
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    (id, pw, done) => {
      db.collection("login").findOne({ id: id }, (err, result) => {
        if (err) return done(err);

        if (!result)
          return done(null, false, { message: "Your id is not existed" });

        if (pw == result.pw) {
          return done(null, result);
        } else {
          return done(null, false, { message: "Wrong Password!" });
        }
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.collection("login").findOne({ id: id }, (err, result) => {
    done(null, result);
  });
});

app.delete("/delete", (req, res) => {
  req.body._id = parseInt(req.body._id);
  db.collection("post").deleteOne(req.body, (err, result) => {
    if (err) {
      res.status(400);
      return console.error(err);
    }
    res.status(200).send({ message: "Delete: Complete!" });
    res.redirect("/list");
  });
});

function isUser(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("You should login");
  }
}
