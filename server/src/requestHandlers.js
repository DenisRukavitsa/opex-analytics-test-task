const database = require("./database");

function addInventory(response, request) {
  // getting the POST data
  let data = '';
  request.on("data", chunk => {
    data += chunk;
  });

  // got all the data
  request.on("end", () => {
    database.insertInventory(JSON.parse(data)).then(() => {
      responseWithCode(response, 200, {data: 'ok'});
    }, err => {
      responseWithCode(response, 500, {error: err});
    });
  });
}

function fetchInventoryDateGrouped(response, request, query) {
  // Validating the query parameters
  const validGroupByOptions = ['day', 'week'];
  if (!query.groupby || !query.productid) {
    responseWithCode(response, 400,
      {error: 'Incorrect parameters provided. [groupby] and [productid] parameters are required'});
  }
  if (!validGroupByOptions.includes(query.groupby.toLowerCase())) {
    responseWithCode(response, 400,
      {error: `Invalid [groupby] parameter. Valid are ${validGroupByOptions.join(', ')}`});
  }

  database.fetchGroupedInventory(query.groupby, query.productid).then(res => {
    responseWithCode(response, 200, {data: res});
  }, err => {
    responseWithCode(response, 500, {error: err});
  });
}

function fetchInventoryProductIdDistinct(response) {
  database.fetchProductIdDistinct().then(res => {
    responseWithCode(response, 200, {data: res});
  }, err => {
    responseWithCode(response, 500, {error: err});
  });
}

function responseWithCode(response, code, data) {
  response.statusCode = code;
  response.end(JSON.stringify(data));
}


exports.addInventory = addInventory;
exports.fetchInventoryDateGrouped = fetchInventoryDateGrouped;
exports.fetchInventoryProductIdDistinct = fetchInventoryProductIdDistinct;
