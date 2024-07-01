const logEvents = require("./logEvents");
const EventEmitter = require("events");

// import http
const http = require("http");
// import path
const path = require("path");
// import fs
const fs = require("fs");
// import fsPromises
const fsPromises = require("fs").promises;

// create a class
class Emitter extends EventEmitter {}

// instantiate a new object
const myEmitter = new Emitter();

// add listener for the log event
myEmitter.on("logs", (msg, fileName) => logEvents(msg, fileName));

// define a port all caps || 3500
const PORT = process.env.PORT || 3500;

const serveFile = async (filePath, contentType, response) => {
  try {
    // add a condition if the file is a json or an image
    const rawData = await fsPromises.readFile(
      filePath,
      !contentType.includes("image") ? "utf8" : ""
    );
    const data =
      contentType === "application/json" ? JSON.parse(rawData) : rawData;
    response.writeHead(filePath.includes("404.html") ? 404 : 200, {
      "Content-Type": contentType,
    });
    response.end(
      contentType === "application/json" ? JSON.stringify(data) : data
    );
  } catch (err) {
    console.log(err);
    // log the error
    myEmitter.emit("logs", `${err.name}: ${err.message}`, "errLog.txt");
    response.statusCode = 500;
    response.end();
  }
};

// create a minimal server
const server = http.createServer((req, res) => {
  console.log(req.url, req.method);
  // emit event, add message as the 2nd parameter
  myEmitter.emit("logs", `${req.url}\t${req.method}`, "reqLog.txt");

  // define the extension
  const extension = path.extname(req.url);
  //create a variable to store the content type
  let contentType;

  // define certain possible file extensions
  switch (extension) {
    case ".css":
      contentType = "text/css";
      break;

    case ".json":
      contentType = "application/json";
      break;

    case ".js":
      contentType = "text/javascript";
      break;

    case ".jpeg":
      contentType = "image/jpeg";
      break;

    case ".png":
      contentType = "image/png";
      break;

    case ".txt":
      contentType = "text/plain";
      break;

    default:
      contentType = "text/html";
  }

  // set the value of the filepath
  let filePath =
    contentType === "text/html" && req.url === "/"
      ? path.join(__dirname, "views", "index.html")
      : contentType === "text/html" && req.url.slice(-1) === "/"
      ? path.join(__dirname, "views", req.url, "index.html")
      : contentType === "text/html"
      ? path.join(__dirname, "views", req.url)
      : path.join(__dirname, req.url);

  // makes .html extension not required in the browser
  if (!extension && req.url.slice(-1) !== "/") filePath += ".html";

  const fileExists = fs.existsSync(filePath);

  if (fileExists) {
    // serve the file
    serveFile(filePath, contentType, res);
  } else {
    // 301 redirect
    console.log(path.parse(filePath));
    switch (path.parse(filePath).base) {
      case "old-page.html":
        res.writeHead(301, { Location: "/new-page.html" });
        res.end();
        break;
      case "www-page.html":
        res.writeHead(301, { Location: "/" });
        res.end();
        break;

      default:
        // serve a 404 response
        serveFile(path.join(__dirname, "views", "404.html"), "text/html", res);

        break;
    }
  }
});

// listen for requests, always should be in the end of your server.js file
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
