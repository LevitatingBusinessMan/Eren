const path = require("path");
const config = require(path.join(__dirname, "../../../config/config"));
const newID = require(path.join(__dirname, "../../util/idCreator"));
const {blue} = require("chalk");
const r = require(path.join(__dirname, "../../util/db"));

module.exports  = (req) => {
    if (!req.files)
        return {code: 400, data: {err: "No image!"}}

    if (!req.files.image)
        return {code: 400, data: {err: "No image!"}}
    
    const file = req.files.image;
    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png" && file.mimetype !== "image/gif")
        return {code: 400, data: {err: "Invalid file type!"}}

    const id = newID();
    const filename = `${id}.${file.mimetype.substr("image/".length)}`;
    
    const file_path = path.join(__dirname, '../../../images', filename);
    file.mv(file_path);

    const del_key = newID();
    r.table("units").insert({id,
        type: "image",
        path: file_path,
        del_key,
        key: req.body.key
    }).run();

    let domain = config.domain;
    let prefix = config.prefix.image;

    const key = req.body.key;
    if (config.key_specifics[key]) {
        domain = config.key_specifics[key].base;
        prefix = config.key_specifics[key].image;
    }

    const response = {
        url: `${config.ssl ? "https" : "http"}://${prefix.length ? `${prefix}.${domain}/${filename}` : `${domain}/i/${filename}`}`,
        delete: `${config.ssl ? "https" : "http"}://${domain}/delete/${del_key}`
    }

    console.log(`ACT: ${blue("[IMAGE]")} ${id}`);
    return {code: 200, data: response}
}