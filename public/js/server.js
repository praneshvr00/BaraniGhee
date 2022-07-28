const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const res = require("express/lib/response");


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname));
mongoose.connect("mongodb+srv://test1:test1@cluster0.7faqe.mongodb.net/firstDB",{ useNewUrlParser: true },{ useUnifiedTopology: true } );


// create schema 
const accountSchema = {
  username : String,
  password : String,
}

const Account = mongoose.model("Account" , accountSchema);

//get not needed since we have used static ...it serves defaultly index file
// app.get("/",function(req,res){
//   res.sendFile(__dirname + "/signup.html");
// });
app.post("/signup",function(req,res){
  let newAccount = new Account({
    username : req.body.username,
    password : req.body.password,

  });
  newAccount.save();
  res.redirect("/login.html");
})


app.post("/login",function(req,res){
  var name = req.body.username;
  var pass = req.body.password;
  Account.countDocuments({username:name, password:pass}, function(err , count){
    if(count > 0){
      console.log("account present");
      res.redirect("/index.html");
    }
    else{
      console.log("no account");
      res.redirect("/login.html");
    }
  })
})
app.listen(3000,function(){
  console.log("server.js on - 3000");
})

