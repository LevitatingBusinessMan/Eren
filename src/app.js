const fs = require("fs"),
    path = require("path"),
    express = require("express"),
    Enmap  =  require("enmap"),
    fileUpload = require("express-fileupload"),
    {REQ, RES} = require(path.join(__dirname, "util/logger")),
    config = require(path.join(__dirname, "../config/config"));

const app = express();
app.use(fileUpload());

app.use((req, res, next) => {
    REQ(req);
    next();
});

app.use(express.static(path.join(__dirname, '../images')));

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

app.get("/", (req,res) => {
    res.render('index');
});

if (!fs.existsSync(path.join(__dirname,'../images')))
    fs.mkdirSync(path.join(__dirname,'../images'))

if (!fs.existsSync(path.join(__dirname,'../data')))
    fs.mkdirSync(path.join(__dirname,'../data'))

const enmap = new Enmap({
    name: "data",
    dataDir: path.join(__dirname,'../data'),
    fetchAll: false
});

//GET
const replacement_image = require(path.join(__dirname, 'routes/GET/replacement_image.js'));

app.get("/:id", (req,res) => {

    const id = req.params.id;

    if (req.subdomains.length) {
        //ID is a filename (has extension) thus a failed image request
        if (id.includes("."))
            return replacement_image( req, res );
        
        let obj = enmap.get(req.params.id);
        if (!obj) {
            RES({code: 404, msg:"ID not found"});
            return res.render("index", {message: "ID not found"});
        }
        else if (!obj.url && !obj.text) {
            RES({code: 404, msg:"ID not found"});
            return res.render("index", {message: "ID not found"});
        }
        
        if (obj.type === "text")
            res.render("text",{text: obj.text});

        if (obj.type === "url")
            res.redirect(obj.url.includes("://") ? obj.url : `http://${obj.url}`);
        
        //somehow a request that has an image ID but no file extension...
        if (obj.type === "image") {
            RES({code: 400, msg:"incomplete image request"});
            res.status(400).send("Incomplete image request");
        }

    }
    else res.render('index', {message: "Page not found"});
});

let serviceNotEnabled = (req, res) => res.status("400").send("This service is not enabled");

const delete_ = require(path.join(__dirname, 'routes/GET/delete.js'))(enmap)
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
        res.status(rsp.code).send(rsp.msg);
    }
}


//POST
const postImage = require(path.join(__dirname, 'routes/POST/postImage.js'))(enmap)
app.post("/s/image", config.services.image ? send(postImage) : serviceNotEnabled);

const postText = require(path.join(__dirname, 'routes/POST/postText.js'))(enmap)
app.post("/s/text", config.services.text ? send(postText) : serviceNotEnabled);

const postUrl = require(path.join(__dirname, 'routes/POST/postUrl.js'))(enmap)
app.post("/s/url", config.services.url ? send(postUrl) : serviceNotEnabled);

app.listen(config.port);

function keyCheck(req, res, next) {

    if (!req.body) {
        RES({code: 400, msg: "Missing key!"})
        return res.status(400).send("Missing key!")
    }
    
    if (!req.body.key) {
        RES({code: 400, msg: "Missing key!"})
        return res.status(400).send("Missing key!")
    }

    if (!config.keys.includes(req.body.key)) {
        RES({code: 401, msg: "Invalid key!"})
        return res.status(401).send("Invalid key!")
    }

    next()
}
