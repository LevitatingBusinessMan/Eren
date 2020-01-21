const path = require("path");
const cf = require(path.join(__dirname, "/config/config.js"));
const chalk = require("chalk");

const image = {
    Name: "Eren image upload",
    DestinationType: "ImageUploader",
    RequestURL: `https://${cf.domain}/s/image`,
    FileFormName: "image",
    Arguments: {
      key: "access-key-here"
    },
    URL: "$json:url$",
    DeletionURL: "$json:delete$"
}

const text = {
    Name: "Eren text upload",
    DestinationType: "URLShortener",
    RequestURL: `${cf.ssl ? "https" : "http"}://sharex.${cf.domain}/s/text`,
    Arguments: {
        text: "$inpu$",
        key: "access-key-here"
    },
    URL: "$json:url$",
    DeletionURL: "$json:delete$"
}

const url = {
    Name: "Eren url shorten",
    DestinationType: "URLShortener",
    RequestURL: `${cf.ssl ? "https" : "http"}://sharex.${cf.domain}/s/url`,
    Arguments: {
        url: "$inpu$",
        key: "access-key-here"
    },
    URL: "$json:url$",
    DeletionURL: "$json:delete$"
}

process.stdout.write(`${chalk.green("Eren_image_upload.sxcu")}:\n${JSON.stringify(image)}\n`);
process.stdout.write(`${chalk.green("Eren_text_upload.sxcu")}:\n${JSON.stringify(text)}\n`);
process.stdout.write(`${chalk.green("Eren_url_shorten.sxcu")}:\n${JSON.stringify(url)}\n`);
