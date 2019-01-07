const fs = require("fs");
const path = require("path");
const express = require("express");
const Enmap  =  require("enmap");
const fileUpload = require("express-fileupload");
const config = require(path.join(__dirname, "config/config.js"));

const app = express();
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'images')));
app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'pug')

app.get("/", (req,res) => {
    res.render('index');
});

if (!fs.existsSync(path.join(__dirname,'images')))
    fs.mkdirSync(path.join(__dirname,'images'))

const enmap = new Enmap({
    name: "data",
    fetchAll: false
});

//GET
const getText = require(path.join(__dirname, 'routes/getText.js'))(enmap); //uses db
const getUrl = require(path.join(__dirname, 'routes/getUrl.js'))(enmap); //uses db
const getImage = require(path.join(__dirname, 'routes/getImage.js'));

app.get("/:id", (req,res) => {

    if (req.subdomains.includes('code')) 
        getText( req, res );

    else if (req.subdomains.includes('url'))
        getUrl( req, res );

    else if (req.subdomains.includes('image'))
        getImage( req, res );
    
    else res.render('index', {message: "Page not found"});
});

//POST
const postImage = require(path.join(__dirname, 'routes/postImage.js'))
app.post("/s/image", postImage);

const postText = require(path.join(__dirname, 'routes/postText.js'))(enmap) //uses db
app.post("/s/text", postText);

const postUrl = require(path.join(__dirname, 'routes/postUrl.js'))(enmap) //uses db
app.post("/s/url", postUrl);

app.listen(config.port);