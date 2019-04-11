const fs = require("fs"),
    path = require("path"),
    express = require("express"),
    fileUpload = require("express-fileupload"),
    {REQ, RES} = require(path.join(__dirname, "util/logger")),
    bodyParser = require('body-parser'),
    expressSession = require('express-session');
    config = require(path.join(__dirname, "../config/config"));

const app = express();
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(expressSession({
    secret: "Eren", 
    cookie: {
        secure: config.force_ssl ? true : false
    }
}))

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

const getID = require(path.join(__dirname, 'routes/GET/getID.js'));

app.get("/signing_up", (req, res) => res.render("index", {message: `If you want to start using Eren yourself you can request a token at: ${config.admin.email},
or host your own instance: https://github.com/LevitatingBusinessMan/Eren`}));

app.get("/login", (req, res) => res.render("login"));

const delete_ = require(path.join(__dirname, 'routes/GET/delete.js'))
app.get("/delete/:del_key", delete_);

//Client is trying to retrieve a database entry
app.get("/:id", getID); //prefix.domain.ext/id
app.get("/i/:id", getID); //domain.ext/i/id

const auth = require(path.join(__dirname, 'util/auth.js'));
//Authentication middleware
app.post("/s/*", auth);

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


let serviceNotEnabled = (req, res) => res.status("400").send({err:"This service is not enabled"});

//POST
const postImage = require(path.join(__dirname, 'routes/POST/postImage.js'))
app.post("/s/image", config.services.image ? send(postImage) : serviceNotEnabled);

const postText = require(path.join(__dirname, 'routes/POST/postText.js'))
app.post("/s/text", config.services.text ? send(postText) : serviceNotEnabled);

const postUrl = require(path.join(__dirname, 'routes/POST/postUrl.js'))
app.post("/s/url", config.services.url ? send(postUrl) : serviceNotEnabled);

app.listen(config.port, () => console.log("Listening on port: " + config.port));

//API (endpoints only used by frontend)
const create_signup_token = require(path.join(__dirname, 'routes/api/create_signup_token.js'))
app.get("/api/create_token", create_signup_token);

const api_login = require(path.join(__dirname, 'routes/api/login.js'))
app.post("/api/login", api_login);
