const config = require("../config/config");
const newID = require("../idCreator");

module.exports = enmap => (req, res) => {
    
    if (!req.query)
        return res.send("Missing key!");
    if (!req.query.key)
        return res.send("Missing key!");
    if (!config.keys.includes(req.query.key))
        return res.send("Invalid key!");

    if (!req.query.url)
        return res.send("No url supplied!");

    //https://regexr.com/3tfih
    if (!/(((http)|(https)):\/\/)?(\w+:)?([a-z0-9@]+\.)+[a-z0-9]+(:\d+)?((\/[\w()?=&#-%-\S]+)+)?/.test(req.query.url))
        return res.send("Invalid url!");

    let id = newID();

    let pass = req.query.pass;

    enmap.set(id,{
        type: "url",
        url: req.query.url,
        pass
    });
    res.send(`${config.protocol}://url.${config.domain}/${id}`)
}