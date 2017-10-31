const pg = require('pg');
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

function createInventoryTable() {
  return new Promise((resolve, reject) => {
    // Connecting to the database
    client.connect(err => {
      if (err) {
        reject(err.stack);
      }
    });

    // creating the INVENTORY table
    client.query(
      `CREATE TABLE IF NOT EXISTS inventory(
      id SERIAL PRIMARY KEY,
      productID VARCHAR(20),
      inventoryDate DATE NOT NULL,
      inventoryLocation VARCHAR(20),
      onHandQty INTEGER,
      unitCost FLOAT,
      onHandValue FLOAT NOT NULL)`,
      (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res);
        }
    });
  });
}

function insertInventory(data) {
  return new Promise((resolve, reject) => {
    // Clearing the INVENTORY table first
    client.query('DELETE FROM inventory', err => {
      reject(err);
    });

    // Inserting data to the INVENTORY table
    data.forEach((value, index) => {
      client.query(
        `INSERT INTO inventory (productID, inventoryDate, inventoryLocation, onHandQty, unitCost, onHandValue)
        VALUES ($1, to_date($2, 'MM/DD/YYYY'), $3, $4, $5, $6)`,
        [value['Product ID'], value['Date'], value['Location'],
          value['On Hand Qty'], value['Unit Cost'], value['On Hand Value']],
        err => {
          reject(err);
      });

      // all the data inserted successfully
      if (index === data.length - 1) {
        resolve();
      }
    });
  });
}

// Fetching INVENTORY grouped by day
function fetchGroupedInventory(groupBy, productID) {
  const groupByFormat = groupBy === 'day' ? 'DD' : 'WW';
  return simpleQuery(
      `SELECT to_char(inventorydate, '${groupByFormat}') formatted_date, SUM(onhandvalue)
       FROM inventory
       WHERE productid = 'Product ${productID}'
       GROUP BY formatted_date
       ORDER BY formatted_date`);
}

// Fetching distinct product ID
function fetchProductIdDistinct() {
  return simpleQuery('SELECT DISTINCT productid FROM inventory');
}

function simpleQuery(query) {
  return new Promise((resolve, reject) => {
    client.query(query, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows);
      }
    });
  });
}

exports.createInventoryTable = createInventoryTable;
exports.insertInventory = insertInventory;
exports.fetchGroupedInventory = fetchGroupedInventory;
exports.fetchProductIdDistinct = fetchProductIdDistinct;
