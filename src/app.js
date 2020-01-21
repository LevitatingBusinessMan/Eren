const fs = require("fs"),
    path = require("path"),
    express = require("express"),
    fileUpload = require("express-fileupload"),
    {REQ, RES} = require(path.join(__dirname, "util/logger")),
    r = require(path.join(__dirname, "util/db")),
    bodyParser = require("body-parser"),
    expressSession = require("express-session"),
    RDBStore = require("session-rethinkdb")(expressSession),
    {version} = require(path.join(__dirname, "../package.json")),
    dayjs = require("dayjs"),
    config = require(path.join(__dirname, "../config/config"));

const app = express();
app.use(fileUpload());
app.use(bodyParser.json({limit: '50mb'}));

const store = new RDBStore(r, {
    table: "sessions"
});

//Configure sessions
app.use(expressSession({
    secret: "keyboard cat",
    store,
    cookie: {
        secure: config.force_ssl ? true : false,
        domain: config.domain
    },
    saveUninitialized: false,
    rolling: true,
    resave: true
}))

app.use((req, res, next) => {
    REQ(req);
    next();
});

//Make sure req.session.logged_in is always set
app.use((req, res, next) => {
    if (typeof req.session.logged_in === "undefined")
        req.session.logged_in = false;
    next();
})

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

    const data = {
        logged_in : req.session.logged_in,
        prefix: config.prefix,
        services: config.services,
        domain: config.domain,
        user: req.session.user,
        version
    }

    if (req.subdomains.length) {
        if (req.subdomains.includes(config.prefix.image) && config.services.image) {
            res.render("image", data);
        }
        if (req.subdomains.includes(config.prefix.text) && config.services.text) {
            res.render("text", data);
        }
        if (req.subdomains.includes(config.prefix.url) && config.services.url) {
            res.render("shorten", data);
        }
    }
    else res.render('index', data);
});

const getID = require(path.join(__dirname, 'routes/GET/getID.js'));

app.get("/signing_up", (req, res) =>
res.render("index", {message: `If you want to start using Eren yourself 
you can request a token at: ${config.admin.email},
or host your own instance: https://github.com/LevitatingBusinessMan/Eren`}));

//Signup page
app.get("/signup/:token", async (req, res) => {
    const token = req.params.token;
    const tokenEntry = await r.table("tokens").get(token).run();
    if (!tokenEntry)
        return res.render("index", {message: "Invalid signup token"})

    //Expired token
    if (dayjs(tokenEntry.expiry).isBefore(dayjs()))
        return res.render("index", {message: "That token expired"})
    
    res.render("signup");
})

app.get(["/settings", "/settings/:setting"], (req, res) => {
    if (req.session.logged_in) {

        const data = {
            user: req.session.user,
            admin: req.session.admin,
            setting: req.params.setting,
            version
        }

        //If sharex setting, also send sharex and signup tokens
        if (req.params.setting == "sharex")
            r.table("users").get(req.session.user)
            .then(u => res.render("settings", Object.assign(data, {sharex_token, signup_token} = u)))
            .catch(err => err ? res.render("index", {msg: "Page failed to load :("}) : null)
        
        else res.render("settings", data)

    }

    else res.redirect("/")
})

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

app.listen(config.port, () => console.log(`Server running at: ${config.forceSSL ? "https" : "http"}://${config.domain}:${config.port}`));

//API (endpoints only used by frontend)
const create_signup_token = require(path.join(__dirname, 'routes/api/create_signup_token.js'))
app.get("/api/create_token", create_signup_token);

const create_account = require(path.join(__dirname, 'routes/api/create_account.js'))
app.post("/api/create_account", create_account);

const api_login = require(path.join(__dirname, 'routes/api/login.js'))
app.post("/api/login", api_login);

const api_me = require(path.join(__dirname, 'routes/api/me.js'));
app.get("/api/me", api_me);

const api_logout = require(path.join(__dirname, 'routes/api/logout.js'));
app.get("/api/logout", api_logout);
