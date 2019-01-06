const fs = require("fs");
const path = require("path");
const express = require("express");
const r =  require("rethinkdb")
const fileUpload = require("express-fileupload");
const config = require(path.join(__dirname, "config/config.js"));

const app = express();
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'images')));
app.set('view engine', 'pug')

app.get("/", (req,res) => {
    res.render('index');
});

if (!fs.existsSync(path.join(__dirname,'images')))
    fs.mkdirSync(path.join(__dirname,'images'))

r.connect(config.rethinkdb, (err, conn) => {
    if (err)
        throw err;
    
    console.log("Connected to RethinkDB");

    r.dbList().run(conn, (err, list) => {
        if (!list.includes(config.rethinkdb.db))
            r.dbCreate("sharex").run(conn)
    })

    r.tableList().run(conn, (err, list) => {
        if (!list.includes("urls"))
            r.tableCreate("urls").run(conn)
        if (!list.includes("texts"))
            r.tableCreate("texts").run(conn)
    })

    //GET
    const getText = require(path.join(__dirname, 'routes/getText.js'))(conn); //uses db
    const getUrl = require(path.join(__dirname, 'routes/getUrl.js'))(conn); //uses db
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
    app.post("/image", postImage);

    const postText = require(path.join(__dirname, 'routes/postText.js'))(conn) //uses db
    app.post("/text", postText);

    const postUrl = require(path.join(__dirname, 'routes/postUrl.js'))(conn) //uses db
    app.post("/url", postUrl);

});
app.listen(80);