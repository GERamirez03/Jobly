/** Tests for SQL helper functions. */

const { sqlForPartialUpdate, sqlForFilterSearch } = require("./sql");

describe("sqlForPartialUpdate", function () {
    test("works: one field for partial update", function() {
        const data = { firstName: "Aliya" };
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                firstName: "first_name",
                lastName: "last_name",
                isAdmin: "is_admin",
            }
        );
        expect(values).toEqual(["Aliya"]);
        expect(setCols).toEqual("\"first_name\"=$1");
    });
    
    test("works: two fields for partial update", function() {
        const data = { firstName: "Aliya", age: 32 };
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                firstName: "first_name",
                lastName: "last_name",
                isAdmin: "is_admin",
            }
        );
        expect(values).toEqual(["Aliya", 32]);
        expect(setCols).toEqual("\"first_name\"=$1, \"age\"=$2");
    });
});

describe("sqlForFilterSearch", function () {
    test("works: one filter for search", function() {
        const data = { name: "%tech%" };
        const { filterCols, values } = sqlForFilterSearch(
            data,
            {
                name: "name ILIKE",
                minEmployees: "num_employees >=",
                maxEmployees: "num_employees <="
              }
        );
        expect(values).toEqual(["%tech%"]);
        expect(filterCols).toEqual("name ILIKE $1");
    });
    
    test("works: two filters for search", function() {
        const data = { name: "%tech%", minEmployees: 20 };
        const { filterCols, values } = sqlForFilterSearch(
            data,
            {
                name: "name ILIKE",
                minEmployees: "num_employees >=",
                maxEmployees: "num_employees <="
              }
        );
        expect(values).toEqual(["%tech%", 20]);
        expect(filterCols).toEqual("name ILIKE $1 AND num_employees >= $2");
    });

    test("works: three filters for search", function() {
        const data = { name: "%tech%", minEmployees: 20, maxEmployees: 200 };
        const { filterCols, values } = sqlForFilterSearch(
            data,
            {
                name: "name ILIKE",
                minEmployees: "num_employees >=",
                maxEmployees: "num_employees <="
              }
        );
        expect(values).toEqual(["%tech%", 20, 200]);
        expect(filterCols).toEqual("name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3");
    });
});