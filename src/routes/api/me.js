//The point of this call is to tell the client its session info
module.exports = (req, res) => {
    
    res.status(200).send(req.session);
    
}