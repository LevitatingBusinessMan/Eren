const path = require("path");
const config = require(path.join(__dirname, "../../../config/config"));
const newID = require(path.join(__dirname, "../../util/idCreator"));

module.exports = enmap => (req) => {
    if (!req.files)
        return res.status(400).send("No image!");

    if (!req.files.image)
        return res.status(400).send("No image!");
    
    const file = req.files.image;
    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png" && file.mimetype !== "image/gif")
        return res.status(400).send("Invalid image type!");

    const id = newID();
    const filename = `${id}.${file.mimetype.substr("image/".length)}`;
    
    const file_path = path.join(__dirname, '../../../images', filename);
    file.mv(file_path);

    const del_key = newID();
    enmap.set(id,{
        type: "image",
        path: file_path,
        del_key,
        key: req.body.key
    });

    let response = {
        url: `${config.ssl ? "https" : "http"}://${config.prefix.image}.${config.domain}/${filename}`,
        delete: `${config.ssl ? "https" : "http"}://${config.domain}/delete/${id}/${del_key}`
    }

    res.send(JSON.stringify(response));
}