//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js")
const _ = require("lodash")

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.set("view engine", "ejs");


mongoose.connect("mongodb+srv://Aditya:Aditya@projects.yumrq.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema)

const item1 = new Item({
  name: "Welcome to your To To List"
});

const item2 = new Item({
  name: "Hit the + button to add the item!"
});

const item3 = new Item({
  name: "<--Check to delete the item."
});

const defaultItems = [item1, item2, item3]

const day = date.getDate();



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted all items.");
        }
      });
      res.redirect("/");
    } else {

        // console.log(foundItems);
        res.render("list", {
          kindOfDay: day,
          listTitle: "Default",
          NewListItems: foundItems
        });
    }
  })
});

app.post("/", function(req, res) {
  const newItem = req.body.newItem;
  const getRoute = req.body.button;
  // console.log(req.body.button);
  const newItemName = new Item({
    name: newItem
  })

  if(getRoute === "Default"){

    newItemName.save()
    res.redirect("/")
  } else {
    List.findOne({name: getRoute}, function(err, getList) {
      // console.log(getList.items);
      // console.log(newItem);
      getList.items.push(newItemName);
      getList.save();
      res.redirect("/" + getRoute);
    })
  }

})

app.post("/delete", function(req, res) {
  const deleteItem = req.body.checkbox
  const listName = req.body.listName

  if(listName === "Default") {
    Item.findByIdAndRemove(deleteItem, function(err, deletedItem) {
      if (err) {
        console.log(err)
      } else {
        console.log("Removed Item: ", deletedItem);
        res.redirect("/");
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteItem}}}, function(err, foundList) {
      if(!err) {
        res.redirect("/" + listName)
      }
    })
  }

})

app.get("/:custom", function(req, res) {

  const customList = _.capitalize(req.params.custom)

  List.findOne({name: customList}, function(err, foundList) {
    if (!err) {

      if (!foundList) {
        const list = new List({
          name: customList,
          items: defaultItems
        })
        list.save()
        res.redirect("/" + customList)

      } else {
        res.render("list", {
          kindOfDay: day,
          listTitle: foundList.name,
          NewListItems: foundList.items
        })
      }
    }
  })

})

app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
