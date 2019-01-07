module.exports = enmap => (req,res) => {
    let obj = enmap.get(req.params.id);
    console.log(obj)
    if (!obj)
        res.render("index", {message: "url not found"});
    else if (!obj.url)
        res.render("index", {message: "url not found"});
    else res.redirect(obj.url.includes("://") ? obj.url : `http://${obj.url}`);
}