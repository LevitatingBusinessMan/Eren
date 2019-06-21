//Authentication middleware
const {RES} =  require(__dirname + "/logger");
const r = require(__dirname + "/db");

module.exports = (req, res, next) => {

    if (!req.body) {
        RES({code: 400, msg: "Missing body!"});
        return res.status(400).send(JSON.stringify({err:"Missing body!"}));
    }

    if(!req.session.logged_in && !req.body.identifier) {
        RES({code: 401, msg: "Not logged in!"});
        return res.status(401).send(JSON.stringify({err:"Not logged in!"}));
    }

    //ShareX call
    //In a ShareX request is an identifier, which is the users signup token, and an access token which is one of the users sharex_tokens
    if (req.body.identifier) {

        if(!req.body.sharex_token) {
            RES({code: 401, msg: "No ShareX token!"});
            return res.status(401).send(JSON.stringify({err:"No ShareX token!"}));
        }

        let user = r.table("users").getAll(req.body.identifier, {index:"signup_token"});
        if (user.length)
            user = user[0];

        if (!user.sharex_tokens.includes(req.body.sharex_token)) {
            RES({code: 401, msg: "Invalid ShareX token!"});
            return res.status(401).send(JSON.stringify({err:"Invalid ShareX token!"}));
        }
    }

    next();
}