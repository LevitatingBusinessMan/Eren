const r = require("rethinkdbdash")({db:"Eren"});

r.dbList().contains("Eren").do(exists => r.branch(exists, {dbs_created:0}, r.dbCreate("Eren")));
r.tableList().contains("units").do(exists => r.branch(exists, {dbs_created:0}, r.tableCreate("units")));
r.tableList().contains("users").do(exists => r.branch(exists, {dbs_created:0}, r.tableCreate("uesrs")));

module.exports = r;

/* module.exports = {
    init: () => r.connect({db:"Eren"}, (err, conn) => {
        if (err)
            throw err;
        else {
            r.dbList().contains("Eren").do(exists => r.branch(exists, {dbs_created:0}, r.dbCreate("Eren"))).run(conn);
            r.tableList().contains("units").do(exists => r.branch(exists, {dbs_created:0}, r.tableCreate("units"))).run(conn);
            r.tableList().contains("users").do(exists => r.branch(exists, {dbs_created:0}, r.tableCreate("uesrs"))).run(conn);
        }
        this.c = 
    })
}
 */