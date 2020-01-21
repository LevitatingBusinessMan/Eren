const path = require("path")
const dayjs = require("dayjs")
const {yellow} = require("chalk");
const r = require(path.join(__dirname, "../../util/db"));
const newID = require(path.join(__dirname, "../../util/idCreator"));

module.exports = async (req, res) => {

    if (!req.session.admin)
        return res.status(401).send({err: "You are not an admin!"})

    let token = {type: "signup", token: newID(32), expiry: dayjs().add(5, "day").toISOString()};    

    r.table("tokens").insert(token).run();

    res.status("200").send({token});
    console.log(`ACT: ${yellow("[CREATE_TOKEN]")} [signup] ${token.token}`);
}