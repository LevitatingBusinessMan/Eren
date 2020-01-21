const {greenBright, yellowBright, red} = require("chalk");
const dayjs = require("dayjs");

REQ = (req) => {
    let method = `[${req.method}]`;
    
    if (req.method === "GET")
        method = greenBright(method);
    
    if (req.method === "POST")
        method = yellowBright(method);

    if (req.subdomains.length)
        console.log(`REQ: ${method} [${req.subdomains[0]}] ${req.url}`);
    else 
        console.log(`REQ: ${method} ${req.url}`);

}

RES = rsp => {
    let code = `[${rsp.code}]`;

    if (rsp.code == 200)
        code = greenBright(code);

    if (rsp.code == 400 || rsp.code == 404)
        code = yellowBright(code);
    
    if (rsp.code == 401)
        code = red(code);

    console.log(`RES: ${code} ${rsp.msg ? rsp.msg : JSON.stringify(rsp.data)}`)
}

//ACT IS DONE MANUALLY

module.exports = {REQ,RES};