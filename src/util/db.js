const path = require("path");
const config = require(path.join(__dirname, "../../config/config"));
const r = require("rethinkdbdash")({db: config.db});

//Check if DB exists
r.dbList().contains(config.db).do(exists => r.branch(exists, {dbs_created:0}, r.dbCreate(config.db))).run();

//Check for Units table
r.tableList().contains("units").do(exists => r.branch(exists, {dbs_created:0}, r.tableCreate("units"))).run()
.then(() => r.table("units").indexList().contains("del_key").do(exists => r.branch(exists, {created:0}, r.table("units").indexCreate("del_key"))).run())

//Check for tokens table
r.tableList().contains("tokens").do(exists => r.branch(exists, {dbs_created:0}, r.tableCreate("tokens", {primaryKey: "token"}))).run();

//Check for users table
r.tableList().contains("users").do(exists => r.branch(exists, {dbs_created:0}, r.tableCreate("users", {primaryKey: "email"}))).run()
.then(() => r.table("users").indexList().contains("token").do(exists => r.branch(exists, {created:0}, r.table("users").indexCreate("token"))).run())
.then(() => r.table("users").getAll("admin", index="token").count().eq(1).do(exists => r.branch(exists, {inserted:0},  r.table("users").insert(Object.assign(config.admin,{token:"admin"})))).run())

module.exports = r;
