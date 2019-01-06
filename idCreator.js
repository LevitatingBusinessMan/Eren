function newID() {
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let id = [];
    for (let i = 0; i < 5; i++)
        id.push(chars[Math.floor(Math.random()*chars.length)+1]);
    return id.join('');
}

module.exports = newID;