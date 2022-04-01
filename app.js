require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO);
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome To Our ToDoList!",
});

const item2 = new Item({
  name: "Press + To Add New Item",
});

const item3 = new Item({
  name: "Made By Adil",
});

const defaultItems = [item1, item2, item3];

listSchema = new mongoose.Schema({
  name: String, // name is list name
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Sucess");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const userItem = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: userItem,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const chekedItemId = req.body.checkboxId;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(chekedItemId, function (err) {
      if (!err) {
        console.log("Successfully Deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: chekedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, founditem) {
    if (!err) {
      if (!founditem) {
        // create new list
        const list = new List({
          name: customListName, // name is list name
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // show existing list
        res.render("list", {
          listTitle: founditem.name,
          newListItems: founditem.items,
        });
      }
    }
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on Successfully");
});
