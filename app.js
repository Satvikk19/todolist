//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
  }

  const itemsSchema= new mongoose.Schema({
    name: String
  });

  const Item= mongoose.model("Item",itemsSchema);

  const item1= new Item({
    name: "Welcome to to do list"
  })
  const item2= new Item({
    name: "Hit the + to add an item"
  })

  const item3= new Item({
    name: "-- Hit this to delete an item"
  })
  const defaultItems = [item1, item2, item3];
  const listSchema ={
    name: String,
    items: [itemsSchema]
  }

  const List= mongoose.model("List", listSchema);
// Item.insertMany([item1, item2, item3]);
  // const defaultItems= [item1,item2,item3];
  
  
  
  
  

  // async function deleteOne(){
  //   try{
  //      await Item.deleteOne({
  //       _id:"6468c2e5dcef99eb9b49683f"
  //      }
  //      )
  //      console.log("Delete success");
  //   }catch(error){
  //       console.log(error);
  //   }
  // }
  // deleteOne();

app.get("/", function(req, res) {


  retrieveItems();
//const day = date.getDate();
async function retrieveItems() {
  try {
    const items = await Item.find();
    if(items.length ===0){
      const saveDefaultItems = async () => {
        
      
        try {
          await Item.insertMany(defaultItems);
          console.log("Successfully saved all the items to the DB");
        } catch (err) {
          console.log(err);
        }
      };
      saveDefaultItems();
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
    
  } catch (error) {
    console.error('Error retrieving fruits:', error);
  }
}

});

app.get("/:customListName", function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  List.findOne({ name: customListName })
  .then(document => {
    if (!document) {
      //create a new list
      const list= new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    } else {
      res.render("list",{listTitle: document.name, newListItems: document.items})
      // Show an existing list
    }
  })
  .catch(error => {
    console.error(error);
    // Handle the error
  });
   
  
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item= new Item({
    name: itemName
  });
  if(listName ==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName})
    .then(document => {
      if (document) {
        //create a new list
        document.items.push(item);
        document.save();
        res.redirect("/"+listName);
      } 
      // else {
      //   res.render("list",{listTitle: document.name, newListItems: document.items})
      //   // Show an existing list
      // }
    })
    .catch(error => {
      console.error(error);
      // Handle the error
    });
  }
  
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
  });

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName= req.body.listName;
  if(listName === "Today"){
    console.log(checkedItemId);
  async function deleteOne(){
    try{
       await Item.deleteOne({
        _id:checkedItemId
       }
       )
       console.log("Delete success for checked item");
       res.redirect("/");
    }catch(error){
        console.log(error);
    }
  }
  deleteOne();
  }
  else{
    List.findOne({ name: listName })
  .then(foundList => {
    foundList.items.pull({ _id: checkedItemId });
    return foundList.save();
  })
  .then(() => {
    res.redirect("/" + listName);
  })
  .catch(error => {
    console.error("Error occurred:", error);
  });
  }
  
})

app.get("/work", function(req,res){

  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
