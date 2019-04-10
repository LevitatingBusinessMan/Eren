const Enmap = require('enmap');
const path = require("path");

const units = new Enmap({
    name: "units",
    autoFetch: true,
    fetchAll: false,
    dataDir: path.join(__dirname,'../../data'),
});

const users = new Enmap({
    name: "users",
    autoFetch: true,
    fetchAll: false,
    dataDir: path.join(__dirname,'../../data'),
});

module.exports = {users, units}