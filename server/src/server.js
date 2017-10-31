const http = require("http");
const url = require("url");
const database = require("./database");

function start(route, handle) {
  // Creating the required table
  database.createInventoryTable();

  // Starting the server
  http.createServer (function (request, response) {
    request.setEncoding("utf8");
    response.setHeader('Content-Type', 'text/json');
    response.setHeader('Access-Control-Allow-Origin', '*');

    const parsedUrl = url.parse(request.url, true);
    route(handle, parsedUrl.pathname, parsedUrl.query, response, request);
  }).listen(process.env.PORT || 8888);
  console.log("Server has started.");
}

exports.start = start;
