module.exports = conn => (req,res) => {
    if (!text.get(req.params.id))
        res.render('index',{message: "ID not found"})
    else res.render('text', {text: texts.get(req.params.id)})
}