const server = require("./server");
const router = require("./router");
const requestHandlers = require("./requestHandlers");

const handle = {};
handle["/inventory/add"] = requestHandlers.addInventory;
handle["/inventory/fetch/date-grouped"] = requestHandlers.fetchInventoryDateGrouped;
handle["/inventory/fetch/productid-distinct"] = requestHandlers.fetchInventoryProductIdDistinct;

server.start(router.route, handle);
