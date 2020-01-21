const path = require("path")
const dayjs = require("dayjs")
const {yellow} = require("chalk");
const bcrypt = require("bcrypt");
const r = require(path.join(__dirname, "../../util/db"));

module.exports = async (req, res) => {

    const {email, password, token, autologin} = req.body;

    //Token verification
    if (!token)
        return res.status(400).send({err: "Missing signup_token!"});

    const token_ = await r.table("tokens").get(token).run();

    if (!token_)
        return res.status(400).send({err: "Invalid signup_token!"});

    if (dayjs(token_.expiry).isBefore(dayjs()))
        return res.status(400).send({err: "Expired signup_token!"});

    const email_regex = /[a-z,0-9.]+@[a-z,0-9.]+/;
    const pass_regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

    //Email validation
    if (!email.match(email_regex))
        return res.status(400).send({err: "Invalid email address!"});
    
    const existing_user = await r.table("users").get(email).run();
    if (existing_user)
        return res.status(400).send({err: "That email address is already in use!"});
    
    //Password validation
    if (!password.match(pass_regex))
        return res.status(400).send({err: "Invalid password!"});
    
    bcrypt.hash(password, 12, (err, hash) => {
        if (err)
            return res.status(500).send({err: "Error creating hash"});

        const document = {
            email,
            password: hash,
            signup_token: token,
            admin: false,
            sharex_tokens: []
        }
    
        r.table("users").insert(document).run()
            .then(() => {

                if (autologin)
                    req.session.logged_in = true;
                    req.session.user = email;
                    req.session.admin = false;

                res.status(200).send({document})
                r.table("tokens").get(token).delete().run()

            })
            .catch(err => console.log("TEST"))
    
    })

}