const path = require("path");
const config = require(path.join(__dirname, "../../../config/config"));

module.exports = async ( req, res ) => {

    req.session.destroy();
    
    const referer = req.header('Referer');

    res.redirect(referer ? referer : config.domain)

};