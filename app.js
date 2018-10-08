const fs = require("fs");
const path = require("path");
const express = require("express");
const fileUpload = require("express-fileupload");
const config = require(path.join(__dirname, "config/config.js"));

const app = express();
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'images')));
app.set('view engine', 'pug')

//enmap
const enmap = require("enmap");
const enmap_level = require("enmap-level");

const urls = new enmap({provider: new enmap_level({name:"urls"})});
const texts = new enmap({provider: new enmap_level({name:"texts"})});

//GET
app.get("/", (req,res) => {
    res.render('index');
});

app.get("/:id", (req,res) => {

    if (req.subdomains.includes('code')) {
        if (!texts.get(req.params.id))
            res.render('index',{message: "ID not found"})
        else res.render('text', {text: texts.get(req.params.id)})
    }

    else if (req.subdomains.includes('url')) {
        if (!urls.get(req.params.id))
            res.render('index',{message: "ID not found"})
        else res.render('url', {url: urls.get(req.params.id)})
    }

    else if (req.subdomains.includes('image')) {
        res.render('index',{message: "Image not found"})
    }
    
    else res.render('index', {message: "Page not found"});
});

//POST
app.post("/image", (req,res) => {
    if (checkKey(req,res))
        return;

    if (!req.files.image)
        return res.send("No image!");
    let file = req.files.image;
    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png" && file.mimetype !== "image/gif")
        return res.send("Invalid image type!");
    let filename = `${newID()}.${file.mimetype.substr("image/".length)}`;
    file.mv(path.join(__dirname, 'images', filename));
    res.send(`${config.protocol}://image.${config.domain}/${filename}`)
});

app.post("/text", (req,res) => {
    if (checkKey(req,res))
        return;

    if (!req.query.text)
        return res.send("No text!");

    let id = newID();
    texts.set(id, req.query.text);
    res.send(`${config.protocol}://code.${config.domain}/${id}`)
});

app.post("/url", (req,res) => {
    if (checkKey(req,res))
        return;

    if (!req.query.url)
        return res.send("No url!");
    //https://regexr.com/3tfih
    if (!/(((http)|(https)):\/\/)?(\w+:)?([a-z0-9@]+\.)+[a-z0-9]+(:\d+)?((\/[\w()?=&#-%-\S]+)+)?/.test(req.query.url))
        return res.send("Invalid url!");

    let id = newID();
    urls.set(id, req.query.url);
    res.send(`${config.protocol}://url.${config.domain}/${id}`)
});

function checkKey(req, res) {
    if (!req.query.key)
        return res.send("Missing key!");
    if (!config.keys.includes(req.query.key))
        return res.send("Invalid key!");
}

function newID() {
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let id = [];
    for (let i = 0; i < 5; i++)
        id.push(chars[Math.floor(Math.random()*chars.length)+1]);
    return id.join('');
}

app.listen(80);