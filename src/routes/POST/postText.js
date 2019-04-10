const path = require("path");
const config = require(path.join(__dirname, "../../../config/config"));
const newID = require(path.join(__dirname, "../../util/idCreator"));
const {blue} = require("chalk");

module.exports = enmap => (req) => {

    if (!req.body.text)
        return {code: 400, data:{err: "No text!"}}
    if (req.body.text.length > 10000)
        return {code: 400, data:{err: "Text over 10000 characters!"}}

    let id = newID();
    const del_key = newID();
    enmap.set(id,{
        type: "text",
        text: req.body.text,
        key: req.body.key,
        del_key
    });

    let domain = config.domain;
    let prefix = config.prefix.text;

    const key = req.body.key;
    if (config.key_specifics[key]) {
        domain = config.key_specifics[key].base;
        prefix = config.key_specifics[key].image;
    }

    const response = {
        url: `${config.ssl ? "https" : "http"}://${prefix.length ? `${prefix}.${domain}/${id}` : `${domain}/i/${id}`}`,
        delete: `${config.ssl ? "https" : "http"}://${domain}/delete/${id}/${del_key}`
    }

    console.log(`ACT: ${blue("[TEXT]")} ${id}`);
    return {code: 200, data: response}
}