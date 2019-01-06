const r = require("rethinkdb");

module.exports = conn => (req,res) => {
    r.table("urls").get(req.params.id)
}