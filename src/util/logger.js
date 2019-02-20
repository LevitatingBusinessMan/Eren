const {greenBright, yellowBright, grey} = require("chalk");
const dayjs = require("dayjs");

REQ = (req) => {
    let method = `[${req.method}]`;
    let url = `[ ${req.url} ]`;

    if (req.method === "GET")
        method = greenBright(method);
    
    if (req.method === "POST")
        method = yellowBright(method);

    console.log("REQ: " + method + url)
}

RES = res => {

}

module.exports = REQ;