module.exports = enmap => (req,res) => {
    let obj = enmap.get(req.params.id);
    if (!obj)
        res.render("index", {message: "data not found"});
    else if (!obj.text)
        res.render("index", {message: "data not found"});
    else res.render("text",{text: obj.text});
}