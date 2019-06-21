const path = require("path");
const config = require(path.join(__dirname, "../../config/config"));
const bcrypt = require("bcrypt");
const r = require("rethinkdbdash")(config.Rethink);

//Check if DB exists
r.dbList().contains(config.Rethink.db).do(exists => r.branch(exists, {dbs_created:0}, r.dbCreate(config.Rethink.db))).run().then(() => {

    //Check for Units table
    r.tableList().contains("units").do(exists => r.branch(exists, {dbs_created:0}, r.tableCreate("units"))).run()
    .then(() => r.table("units").indexList().contains("del_key").do(exists => r.branch(exists, {created:0}, r.table("units").indexCreate("del_key"))).run())

    //Check for tokens table
    r.tableList().contains("tokens").do(exists => r.branch(exists, {dbs_created:0}, r.tableCreate("tokens", {primaryKey: "token"}))).run();

    //Check for users table
    r.tableList().contains("users").do(exists => r.branch(exists, {dbs_created:0}, r.tableCreate("users", {primaryKey: "email"}))).run()
    .then(() => r.table("users").indexList().contains("token").do(exists => r.branch(exists, {created:0}, r.table("users").indexCreate("token"))).run())

    //Check if admin user was made
    .then(() => r.table("users").getAll("admin", index="token").count().eq(1).run().then(exists => {
        if (!exists)
            bcrypt.hash(config.admin.pass, 12, function(err, hash) {
                if (err)
                    throw err;
                r.table("users").insert({
                    email:config.admin.email,
                    password:hash,
                    signup_token:"admin",
                    sharex_tokens:[]
                }).run()
            })
    }))

})


/*
User:
    email
    password
    signup_token (to link sharex requests to a user and keep track of which users used which signup tokens)
    sharex_tokens "array" (gets created whenever a sharex uploader config is made, each can be revoked)
*/

module.exports = r;
