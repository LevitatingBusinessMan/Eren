const fs = require("fs");
const {red} = require("chalk");
const path = require("path")
const r = require(path.join(__dirname, "../../util/db"));

module.exports = async (req, res) => {
    const id = req.params.id;
    const del_key = req.params.del_key;

    const obj = await r.table("units").get(id).run();

    if (!obj)
        return res.status("400").send(id + " was not found in the database");
    
    //Deletion code is invalid
    if (obj.del_key !== del_key)
        return res.status("401").send("Faulty delete code");

    //ID is of an image
    if (obj.type === "image")
        //Unlink file
        fs.unlink(obj.path, () => {});
    
    r.table("units").get(id).delete().run();
    res.status("200").send(`Deleted ${id} succesfully`);
    console.log(`ACT: ${red("[DELETE]")} [${obj.type}] ${id}`);
}