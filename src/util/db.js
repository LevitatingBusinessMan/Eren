const path = require("path");
const config = require(path.join(__dirname, "../../config/config"));
const r = require("rethinkdbdash")({db: config.db});

//Checking if DB is in order
r.dbList().contains(config.db).do(exists => r.branch(exists, {dbs_created:0}, r.dbCreate(config.db))).run();
r.tableList().contains("units").do(exists => r.branch(exists, {dbs_created:0}, r.tableCreate("units"))).run();
r.tableList().contains("users").do(exists => r.branch(exists, {dbs_created:0}, r.tableCreate("users", {primaryKey: "email"}))).run()
.then(() => r.table("users").indexList().contains("token").do(exists => r.branch(exists, {created:0}, r.table("users").indexCreate("token"))).run())
.then(() => r.table("users").getAll("admin", index="token").count().eq(1).do(exists => r.branch(exists, {inserted:0},  r.table("users").insert(Object.assign(config.admin,{token:"admin"})))).run())

module.exports = r;
