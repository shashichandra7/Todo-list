//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require('mongoose');
const _=require('lodash')


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-shashi:shashireddy@todolist.kwfnr.mongodb.net/todolistDB',{useNewUrlParser: true, useUnifiedTopology: true })
const itemschema={
  name:String
}
const Item=mongoose.model("Item",itemschema);
const item1 =new Item({
  name:'welcome to your todo list'
});
const item2 =new Item({
  name:"hit the + button to add more"
});
const item3 =new Item({
  name:'hit <-- to delete the item'
});
const defaultitems =[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemschema]
}
const List =mongoose.model('List',listSchema)

app.get("/", function(req, res) {


  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultitems,function(err){
        if(err){
        console.log(err)
       }else{
       console.log("suycessful")
       }
   })
   res.redirect('/')
    }
    
    else{
      res.render("list", {listTitle: "Today", newListItems:foundItems});
    }
     
  })

 

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname=req.body.list;
  const item=new Item({
    name:itemName
  })

  if(listname=="Today"){
    item.save()
    res.redirect('/')
  }else{
    List.findOne({name:listname},function(err,foundList){
      foundList.items.push(item);
      foundList.save()
      res.redirect('/'+listname)
    })
  }
  
 
});




app.post('/delete',function(req,res){
  const checkItemId=req.body.checkbox;
  const listName = req.body.listname;
  if(listName=='Today'){
      Item.findByIdAndRemove(checkItemId,function(err){
    if(!err){
      console.log('sucessfully removed')
      res.redirect('/')
    }})
    
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkItemId}}},function(err,foundList){
      if(!err){
        res.redirect('/'+listName)
      }
    })
  }

  
})




app.get('/:costomName',function(req,res){
  const coustomListName=_.capitalize(req.params.costomName);
  List.findOne({name:coustomListName},function(err,foundList){
    if(!err)
    {
      if(!foundList){
        //screate one
        const list = new List({
    name:coustomListName,
    items:defaultitems
  })
  list.save()
  res.redirect("/"+coustomListName)
}
      else{
        res.render('list',{listTitle: foundList.name, newListItems:foundList.items})
      }
    }
  })
  
})
let port=process.env.PORT;
if(port==null || port==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
