const path = require("path");
const config = require(path.join(__dirname, "../../../config/config"));
const newID = require(path.join(__dirname, "../../util/idCreator"));
const {blue} = require("chalk");

module.exports = enmap => (req) => {

    if (!req.body.text)
        return {code: 400, msg:"No text!"}
    if (req.body.text.length > 10000)
        return {code: 400, msg:"Text over 10000 characters!"}

    let id = newID();
    const del_key = newID();
    enmap.set(id,{
        type: "text",
        text: req.body.text,
        key: req.body.key,
        del_key
    });

    const response = {
        url: `${config.ssl ? "https" : "http"}://${config.prefix.text}.${config.domain}/${id}`,
        delete: `${config.ssl ? "https" : "http"}://${config.domain}/delete/${id}/${del_key}`
    };

    console.log(`ACT: ${blue("[TEXT]")} ${id}`);
    return {code: 200, msg: JSON.stringify(response)}
}