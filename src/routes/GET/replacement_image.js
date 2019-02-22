const path = require("path");

module.exports = (req,res) => {
    if (req.url == "/favicon.ico")
        return res.sendFile(path.join(__dirname, `../../../default_images/favicon.ico`))

    let i = Math.floor(Math.random() * 3)+1;
    res.sendFile(path.join(__dirname, `../../../default_images/image_not_found${i}.png`))
}