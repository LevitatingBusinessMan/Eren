const fs = require("fs");
const {red} = require("chalk");

module.exports = enmap => (req, res) => {
    const id = req.params.id;
    const del_key = req.params.del_key;

    const obj = enmap.get(id);

    if (!obj)
        return res.status("400").send(id + " was not found in the database");
    
    //Deletion code is invalid
    if (obj.del_key !== del_key)
        res.status("401").send("Faulty delete code");

    //ID is of an image
    if (obj.type === "image") {
        //Unlink file
        fs.unlink(obj.path, () => {});

        enmap.delete(id);
        res.status("200").send(`Deleted ${id} succesfully`);
        console.log(`ACT: ${red("[DELETE]")}[${obj.type}] ${id}`);
    }

    //ID is of text or a url
    else {
        enmap.delete(id);
        res.status("200").send(`Deleted ${id} succesfully`);
        console.log(`ACT: ${red("[DELETE]")}[${obj.type}] ${id}`);
    }
}