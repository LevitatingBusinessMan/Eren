const path = require("path");
const config = require(path.join(__dirname, "../../../config/config"));
const newID = require(path.join(__dirname, "../../util/idCreator"));
const {blue} = require("chalk");
const r = require(path.join(__dirname, "../../util/db"));

module.exports = (req) => {

    if (!req.body.text)
        return {code: 400, data:{err: "No text!"}}
    if (req.body.text.length > 100000)
        return {code: 400, data:{err: "Text over 10.000 characters!"}}

    let id = newID();
    const del_key = newID();
    r.table("units").insert({id,
        type: "text",
        text: req.body.text,
        key: req.body.key,
        del_key
    }).run();

    let domain = config.domain;
    let prefix = config.prefix.text;

    const response = {
        url: `${config.ssl ? "https" : "http"}://${prefix.length ? `${prefix}.${domain}/${id}` : `${domain}/i/${id}`}`,
        delete: `${config.ssl ? "https" : "http"}://${domain}/delete/${del_key}`
    }

    console.log(`ACT: ${blue("[TEXT]")} ${id}`);
    return {code: 200, data: response}
}