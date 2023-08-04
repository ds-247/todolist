const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// connecting to mongo db
connectDb()
  .then(() => console.log("connected to the database successfully..."))
  .catch((err) => console.log(err));

async function connectDb() {
  await mongoose.connect("mongodb://127.0.0.1:27017/todolist");
}

// basic configs
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// creating mongo db schema and making models
const itemSchema = new mongoose.Schema({
  name: String,
});

const listScehma = new mongoose.Schema({
  title: String,
  items: [itemSchema],
});

const Item = mongoose.model("Item", itemSchema);
const CustomList = mongoose.model("CustomList", listScehma);

// default items of our lists
const item1 = new Item({
  name: "Welcome to Todo list.",
});

const item2 = new Item({
  name: "Click '+' button to add items.",
});

const item3 = new Item({
  name: "<- Tick this to cross items.",
});

const default_items = [item1, item2, item3];

// routes

app.get("/", async (req, res) => {
  const $items = await Item.find();

  if ($items.length === 0) await Item.insertMany(default_items);

  res.render("list", { title: "Today", listItems: $items });
});

app.get("/:customList", async (req, res) => {
  const listTitle = _.capitalize(req.params.customList);
  const list = await CustomList.findOne({ title: listTitle });

  if (!list || list.length === 0) {
    const defaultItem = new CustomList({
      title: listTitle,
      items: default_items,
    });

    await defaultItem.save();
    res.redirect(`/${listTitle}`);
  } else res.render("list", { title: listTitle, listItems: list.items });
});

app.post("/", async (req, res) => {
  const listTitle = req.body.list;
  let data = req.body.newItem;

  if (data.length === 0) data = "Hmm seems like empty item...";

  const newItem = new Item({ name: data });

  if (listTitle === "Today") {
    await newItem.save();
    res.redirect("/");
  } else {
    const customList = await CustomList.findOne({ title: listTitle });
    customList.items.push(newItem);

    customList.save();

    res.redirect(`/${listTitle}`);
  }
});

app.post("/delete", async (req, res) => {
  const listTitle = req.body.list;
  const id = req.body.checked;

  if (listTitle === "Today") {
    await Item.deleteOne({ _id: id });
    res.redirect("/");
  } else {
    const filter = { title: listTitle };
    const update = { $pull: { items: { _id: id } } };

    await CustomList.findOneAndUpdate(filter, update);

    res.redirect(`/${listTitle}`);
  }
});

app.listen(3000, () => console.log("listening on 3000"));
