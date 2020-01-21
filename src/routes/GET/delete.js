const fs = require("fs");
const {red} = require("chalk");
const path = require("path")
const r = require(path.join(__dirname, "../../util/db"));

module.exports = async (req, res) => {
    const del_key = req.params.del_key;

    const obj = (await r.table("units").getAll(del_key, {index:"del_key"}).run())[0];

    if (!obj)
        return res.status("400").send(del_key + " was not found in the database");
    
    //Deletion code is invalid
    if (obj.del_key !== del_key)
        return res.status("401").send("Faulty delete code");

    //ID is of an image
    if (obj.type === "image")
        //Unlink file
        fs.unlink(obj.path, () => {});
    
    r.table("units").get(obj.id).delete().run();
    res.status("200").send(`Deleted ${obj.id} succesfully`);
    console.log(`ACT: ${red("[DELETE]")} [${obj.type}] ${obj.id}`);
}