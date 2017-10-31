// Routing the requests. If route is not found, responding with 404
function route(handle, pathname, query, response, request) {
  if (typeof handle[pathname] === 'function') {
    console.log('Got request for ', pathname);
    handle[pathname](response, request, query);
  } else {
    console.log('Nothing found for requested  ', pathname);
    response.writeHead(404, {"Content-Type": "text/html"});
    response.write("404 Not found");
    response.end();
  }
}

exports.route = route;
