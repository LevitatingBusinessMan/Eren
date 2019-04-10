const fs = require("fs"),
    path = require("path"),
    express = require("express"),
    fileUpload = require("express-fileupload"),
    {REQ, RES} = require(path.join(__dirname, "util/logger")),
    bodyParser = require('body-parser');
    config = require(path.join(__dirname, "../config/config"));

const app = express();
app.use(fileUpload());
app.use(bodyParser.json());

app.use((req, res, next) => {
    REQ(req);
    next();
});

function forceSSL(req, res, next) {
    if(!req.secure)
    {
        console.log(req.protocol)
        res.redirect("https://" + req.get("host") + req.url)    
    }
    else next();
}

if (config.force_ssl)
    app.use(forceSSL);

app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'pug')

if (!fs.existsSync(path.join(__dirname,'../images')))
    fs.mkdirSync(path.join(__dirname,'../images'))

if (!fs.existsSync(path.join(__dirname,'../data')))
    fs.mkdirSync(path.join(__dirname,'../data'))

//GET
app.get("/", (req,res) => {
    if (req.subdomains.length) {
        if (req.subdomains.includes(config.prefix.image) && config.services.image) {
            res.render("image");
        }
        if (req.subdomains.includes(config.prefix.text) && config.services.text) {
            res.render("text");
        }
        if (req.subdomains.includes(config.prefix.url) && config.services.url) {
            res.render("shorten");
        }
    }
    else res.render('index');
});

const replacement_image = require(path.join(__dirname, 'routes/GET/replacement_image.js'));
const getID = require(path.join(__dirname, 'routes/GET/getID.js'));

//Client is trying to retrieve a database entry
app.get("/:id", getID);
app.get("/i/:id", getID);

let serviceNotEnabled = (req, res) => res.status("400").send("This service is not enabled");

const delete_ = require(path.join(__dirname, 'routes/GET/delete.js'))
app.get("/delete/:id/:del_key", delete_);

//Keycheck middleware
app.post("*", keyCheck);

/**
 * By using this function we can log all responses and/or format them
 * @param {Function} fn Function which returns the reponse info
 */
function send(fn) {
    return (req, res) => {
        const rsp = fn(req);
        RES(rsp);
        res.status(rsp.code).send(JSON.stringify(rsp.data));
    }
}


//POST
const postImage = require(path.join(__dirname, 'routes/POST/postImage.js'))
app.post("/s/image", config.services.image ? send(postImage) : serviceNotEnabled);

const postText = require(path.join(__dirname, 'routes/POST/postText.js'))
app.post("/s/text", config.services.text ? send(postText) : serviceNotEnabled);

const postUrl = require(path.join(__dirname, 'routes/POST/postUrl.js'))
app.post("/s/url", config.services.url ? send(postUrl) : serviceNotEnabled);

app.listen(config.port, () => console.log("Listening on port: " + config.port));

function keyCheck(req, res, next) {

    if (!req.body) {
        RES({code: 400, msg: "Missing key!"});
        return res.status(400).send(JSON.stringify({err:"Missing key!"}));
    }
    
    if (!req.body.key) {
        RES({code: 400, msg: "Missing key!"});
        return res.status(400).send(JSON.stringify({err:"Missing key!"}))
    }

    if (!config.keys.includes(req.body.key)) {
        RES({code: 401, msg: "Invalid key!"});
        return res.status(401).send(JSON.stringify({err:"Invalid key!"}));
    }

    next();
}
