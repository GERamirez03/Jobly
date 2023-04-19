const { BadRequestError } = require("../expressError");

/** Helper function that generates the SET clause of an UPDATE SQL query
 *  to be used with the partial update functionality for users.
 * 
 *  Reads the keys of dataToUpdate, an object containing the column-value 
 *  pairs of data to update, to generate the necessary SQL.
 * 
 *  Uses jsToSql object to translate JS object properties into SQL column names.
 * 
 *  Returns { setCols, values } where:
 * 
 *  setCols is the concatenated string of all the columns to update
 *    with parameterized inputs (e.g. "first_name=$1, age=$2")
 * 
 *  values is an array of all of the values to set those columns to
 *    (e.g. ["Aliya", 32])
 */

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


/** Helper function that generates the WHERE clause of a SELECT SQL query
 *  to be used with the filter search functionality for companies and jobs.
 * 
 *  Reads the keys of searchFilters, an object containing the filter-value 
 *  pairs of filters to search by, to generate the necessary SQL.
 * 
 *  Uses jsToSql object to translate JS object properties into corresponding parts of SQL SELECT ... WHERE queries.
 * 
 *  Returns { filterCols, values } where:
 * 
 *  filterCols is the concatenated string of all the columns to SELECT by
 *    with parameterized inputs (e.g. "name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3")
 * 
 *  values is an array of all of the values passed to the filters
 *    (e.g. ["Tech", 20, 500])
 * 
 *  Sample inputs:
 * 
 *  For Company filter search:
 *      searchFilters = { 
 *        name: '%net%', 
 *        minEmployees: 15, 
 *        maxEmployees: 200 },
 *      jsToSql = {
 *        name: "name ILIKE",
 *        minEmployees: "num_employees >=",
 *        maxEmployees: "num_employees <="
 *      }
 *  
 *  For Job filter search:
 *      searchFilters = { 
 *        title: '%engineer%', 
 *        minSalary: 50000 },
 *      jsToSql = {
 *        title: "title ILIKE",
 *        minSalary: "salary >=" }
 * 
 *  Note that the hasEquity filter is handled within Job.filterSearch as it is a boolean converted to a SQL WHERE clause 
 *  that is not dynamic (i.e. no parametrized input for that filter).
 */

function sqlForFilterSearch(searchFilters, jsToSql) {
  const keys = Object.keys(searchFilters);

  // {name: '%net%', minEmployees: 15, maxEmployees=200} => ['name ILIKE $1', 'num_employees >= $2, 'num_employees <= $3']
  const cols = keys.map((filterName, idx) =>
        `${jsToSql[filterName]} $${idx + 1}`
  );

  return {
    filterCols: cols.join(" AND "),
    values: Object.values(searchFilters)
  };
}

module.exports = { sqlForPartialUpdate, sqlForFilterSearch };
