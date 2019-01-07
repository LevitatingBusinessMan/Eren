const config = require("../config/config");
const newID = require("../idCreator");

module.exports = r => (req, res) => {

    if (!req.query)
        return res.send("Missing key!");
    if (!req.query.key)
        return res.send("Missing key!");
    if (!config.keys.includes(req.query.key))
        return res.send("Invalid key!");

    if (!req.query.text)
        return res.send("No text!");

    let id = newID();
    texts.set(id, req.query.text);
    res.send(`${config.protocol}://code.${config.domain}/${id}`)
}