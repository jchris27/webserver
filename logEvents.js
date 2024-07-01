const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const logEvents = async (message, logName) => {
  const dateTime = `${format(new Date(), "yyyy/mm/dd\tHH:mm:ss")}`;
  const logTime = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    if (!message) throw new Error("Required parameter missing.");
    if (!fs.existsSync("./logs")) {
      await fsPromises.mkdir(path.join(__dirname, "logs"));
    }

    await fsPromises.appendFile(
      path.join(__dirname, "logs", logName),
      logTime,
      "utf8"
    );
  } catch (err) {
    const errTime = `${dateTime}\t${uuid()}\t${err.toString()}\n`;
    if (!fs.existsSync("./logs")) {
      await fsPromises.mkdir(path.join(__dirname, "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "logs", logName),
      errTime,
      { encoding: "utf8" }
    );
  }
};

module.exports = logEvents;
