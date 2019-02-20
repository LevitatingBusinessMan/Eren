const path = require("path");
const config = require(path.join(__dirname, "../../config/config"));
const newID = require(path.join(__dirname, "../util/idCreator"));

module.exports = enmap => (req, res) => {

    if (!req.body)
        return res.status(400).send("Missing key!");
    if (!req.body.key)
        return res.status(400).send("Missing key!");
    if (!config.keys.includes(req.body.key))
        return res.status(400).send("Invalid key!");

    if (!req.body.text)
        return res.send("No text!");
    if (req.body.text.length > 10000)
        return res.status(400).send("Text over 1000 characters");

    let id = newID();
    enmap.set(id,{
        type: "text",
        text: req.body.text,
        key: req.body.key
    });

    const response = {
        url: `${config.protocol}://${config.prefix.text}.${config.domain}/${id}`
    };

    res.send(JSON.stringify(response));
}