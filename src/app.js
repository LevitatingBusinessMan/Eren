const fs = require("fs");
const path = require("path");
const express = require("express");
const Enmap  =  require("enmap");
const fileUpload = require("express-fileupload");
const config = require(path.join(__dirname, "../config/config"));

const app = express();
app.use(fileUpload());
app.use(express.static(path.join(__dirname, '../images')));
app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'pug')

app.get("/", (req,res) => {
    res.render('index');
});

if (!fs.existsSync(path.join(__dirname,'../images')))
    fs.mkdirSync(path.join(__dirname,'../images'))

const enmap = new Enmap({
    name: "data",
    dataDir: path.join(__dirname,'../data'),
    fetchAll: false
});

//GET
const getText = require(path.join(__dirname, 'routes/GET/getText.js'))(enmap); //uses db
const getUrl = require(path.join(__dirname, 'routes/GET/getUrl.js'))(enmap); //uses db
const getImage = require(path.join(__dirname, 'routes/GET/getImage.js'));

app.get("/:id", (req,res) => {

    if (req.subdomains.includes(config.prefix.text) && config.services.text) 
        getText( req, res );

    else if (req.subdomains.includes(config.prefix.url) && config.services.url) 
        getUrl( req, res );

    else if (req.subdomains.includes(config.prefix.image) && config.services.image) 
        getImage( req, res );
    
    else res.render('index', {message: "Page not found"});
});

let serviceNotEnabled = (req, res) => res.status("400").send("This service is not enabled");

const delete_ = require(path.join(__dirname, 'routes/GET/delete.js'))(enmap)
app.get("/delete/:id/:del_key", delete_);

//POST
const postImage = require(path.join(__dirname, 'routes/POST/postImage.js'))(enmap)
app.post("/s/image", config.services.image ? postImage : serviceNotEnabled);

const postText = require(path.join(__dirname, 'routes/POST/postText.js'))(enmap)
app.post("/s/text", config.services.text ? postText : serviceNotEnabled);

const postUrl = require(path.join(__dirname, 'routes/POST/postUrl.js'))(enmap)
app.post("/s/url", config.services.url ? postUrl : serviceNotEnabled);

app.listen(config.port);