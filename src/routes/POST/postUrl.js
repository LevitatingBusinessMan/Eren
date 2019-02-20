const path = require("path");
const config = require(path.join(__dirname, "../../../config/config"));
const newID = require(path.join(__dirname, "../../util/idCreator"));
const {blue} = require("chalk");

module.exports = enmap => (req, res) => {

    if (!req.body.url)
        return {code: 400, msg:"No url supplied!"}

    //https://regexr.com/3tfih
    if (!/(((http)|(https)):\/\/)?(\w+:)?([a-z0-9@]+\.)+[a-z0-9]+(:\d+)?((\/[\w()?=&#-%-\S]+)+)?/.test(req.body.url))
        return {code: 400, msg:"Invalid url!"}

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

    console.log(`ACT: ${blue("[URL]")} ${req.body.url} ${blue("=>")} ${response.url}`);
    return {code: 200, msg: JSON.stringify(response)}
}