const path = require("path");
const r = require(path.join(__dirname, "../../util/db"));
const bcrypt = require("bcrypt");
module.exports = (req, res) => {
    
    //Make sure user is logged out
    req.session.regenerate(async () => {

        if (!req.body)
            return res.status(401).send({err:"Failed authentication"})

        if (!req.body.password || !req.body.email)
            return res.status(401).send({err:"Failed authentication"})

        let user = await r.table("users").get(req.body.email).run();
        if (!user)
            //If the user isn't in the DB we can stop right here lol
            res.status(401).send({err:"Failed authentication"})
        else {
            bcrypt.compare(req.body.password, user.password, function(err, result) {
                if (err)
                    return console.error(err);
                
                if (result) {
                    req.session.logged_in = true;
                    req.session.user = user.email;
                    req.session.admin = user.admin;

                    res.status(200).send({
                        msg: "Logged in successfully",
                        session: req.session
                    });
                }
                else res.status(401).send({err: "Failed authentication"});
            });
        }

    });
}