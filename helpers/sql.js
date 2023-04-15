const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

// sql helper for filter search
// searchFilters = { name: '%net%', minEmployees: 15, maxEmployees: 200}

function sqlForFilterSearch(searchFilters, jsToSql) {
  const keys = Object.keys(searchFilters);

  // {name: '%net%', minEmployees: 15, maxEmployees=200} => ['name ILIKE $1', 'num_employees >= $2, 'num_employees <= $3']
  const cols = keys.map((filterName, idx) =>
        `${jsToSql[filterName]} $${idx + 1}`
  );

  return {
    filterCols: cols.join(", "),
    values: Object.values(searchFilters)
  };
}

module.exports = { sqlForPartialUpdate, sqlForFilterSearch };
