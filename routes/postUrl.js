const config = require("../config/config");
const newID = require("../idCreator");

module.exports = enmap => (req, res) => {
    
    if (!req.body)
        return res.status(400).send("Missing key!");
    if (!req.body.key)
        return res.status(400).send("Missing key!");
    if (!config.keys.includes(req.body.key))
        return res.status(400).send("Invalid key!");

    if (!req.body.url)
        return res.status(400).send("No url supplied!");

    //https://regexr.com/3tfih
    if (!/(((http)|(https)):\/\/)?(\w+:)?([a-z0-9@]+\.)+[a-z0-9]+(:\d+)?((\/[\w()?=&#-%-\S]+)+)?/.test(req.body.url))
        return res.status(400).send("Invalid url!");

    let id = newID();

    let pass = req.body.pass;

    enmap.set(id,{
        type: "url",
        url: req.body.url,
        pass
    });
    res.send(`${config.protocol}://url.${config.domain}/${id}`)
}