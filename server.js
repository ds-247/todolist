const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let local_db = ["buy food", "cook food", "eat food"];

app.get("/", (req, res) => {
  console.log(local_db);
  res.render("list", { title: "Hello", lists: local_db });
});

app.post("/", (req, res) => {
  const data = req.body.newItem;
  // console.log(data);
  local_db.push(data);
  console.log(local_db);

  res.redirect("/");
});

app.listen(3000, () => console.log("listening on 3000"));
