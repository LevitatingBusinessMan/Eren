const path = require("path");
const config = require(path.join(__dirname, "../../../config/config"));
const newID = require(path.join(__dirname, "../../util/idCreator"));

module.exports = enmap => (req, res) => {
    
    if (!req.body)
        return res.status(400).send("Missing key!");
    if (!req.body.key)
        return res.status(400).send("Missing key!");
    if (!config.keys.includes(req.body.key))
        return res.status(401).send("Invalid key!");

    if (!req.body.url)
        return res.status(400).send("No url supplied!");

    //https://regexr.com/3tfih
    if (!/(((http)|(https)):\/\/)?(\w+:)?([a-z0-9@]+\.)+[a-z0-9]+(:\d+)?((\/[\w()?=&#-%-\S]+)+)?/.test(req.body.url))
        return res.status(400).send("Invalid url!");

    let id = newID();
    del_key = newID();
    enmap.set(id,{
        type: "url",
        url: req.body.url,
        key: req.body.key,
        del_key
    });

    const response = {
        url: `${config.ssl ? "https" : "http"}://${config.prefix.url}.${config.domain}/${id}`,
        delete: `${config.ssl ? "https" : "http"}://${config.domain}/delete/${id}/${del_key}`
    }

    res.send(JSON.stringify(response));
}