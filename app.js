const express = require("express");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const BlogPost = require("./models/BlogPost.js");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

app.listen(process.env.PORT));

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

mongoose.connect("mongodb+srv://Miko:2182Haruhi@mikocluster.bmr4k.mongodb.net/MikoStory?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});


app.use(express.static("public"));
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine", "ejs");

let blogslength;
app.get("/", (req, res) => {
  let blogs = [];
  BlogPost.find({}, (err, result) => {
    //console.log(err, result);
    for(let i in result) {
      blogs.push(result[i]);
    }
    blogslength = blogs.length;
    blogs.sort(function(a, b){return +a.title - +b.title}).reverse();
    res.render("index.ejs", {title: "Home", blogs: blogs });
  });
});

app.get("/about", (req, res) => {
  res.render("about.ejs", {title: "About"} );
});

app.get("/pictureupload", (req, res) => {
  res.render("pictureupload.ejs", {title: "Picture Upload"});
});

app.post("/pictureupload", (req, res) => {
  let picturename;
  let file = req.files.picture;
  file.mv(__dirname + "/pictures/" + file.name);
  cloudinary.uploader.upload(`./pictures/${file.name}`, (err, result) => {
    if(err) {
      console.log("error:", err);
    }
    else if(result) {
      picturename = result.url;
      if (typeof blogslength != "number") {
        blogslength = 0;
      }
      let pictureno = 1100 + blogslength;
      if(req.body.title) {
        pictureno = req.body.title;
      }
      pictureno.toString();
      BlogPost.create({
        title: pictureno,
        image: picturename
        }, (err,blogpost) => {
        console.log(err, blogpost);
      }, () => {setTimeout( () => {res.redirect("/");}, 1000);});
    }
  });
});

app.get("/pictures/:title", (req, res, next2) => {
  BlogPost.find({}, (err, result) => {
    blogslength = result.length;
    let title = req.params.title;
    if(title < 1100 || title >= 1100 + blogslength){
      next2();
    }
    let next = +title + 1;
    let previous = +title - 1;
    if(previous < 1100) {
      previous = "DNE";
    }
    if(next >= 1100 + (blogslength)) {
      next = "DNE";
    }
    BlogPost.find({title: title}, (err, result) => {
      res.render("picture.ejs", {title: "Picture", picture: result[0], next: next.toString(), previous: previous.toString()} );
    });
  });
});

app.use( (req, res) => {
  res.status(404).render("404.ejs", {title:"Not Found"} );
});
