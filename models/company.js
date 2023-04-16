"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilterSearch } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`);
    return companiesRes.rows;
  }

  /** Given search criteria, return relevant companies.
   * 
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * 
   * Can filter by:
   * - minEmployees
   * - maxEmployees
   * - nameLike (will find case-insensitive, partial matches)
   */

  static async filterSearch(filters) {
    if (filters.name) filters.name = `%${filters.name}%`; // <-- consider having this in route instead!

    const { filterCols, values } = sqlForFilterSearch(
        filters,
        {
          name: "name ILIKE",
          minEmployees: "num_employees >=",
          maxEmployees: "num_employees <="
        }
    );

    const querySql = `SELECT handle, 
                             name, 
                             description, 
                             num_employees AS "numEmployees", 
                             logo_url AS "logoUrl" 
                      FROM companies
                      WHERE ${filterCols}`;
    console.log(querySql);
    const results = await db.query(querySql, [values]);

    return results.rows;

  }

    /**const response = db.query(`
      SELECT handle, 
             name, 
             description, 
             num_employees AS "numEmployees",
             logo_url AS "logoUrl"
      FROM companies
      WHERE ${filterCols}
             `);*/
             // at this point i want to be able to take {name: "net", minEmployees: 15, maxEmployees: 200}
             // and convert it to SQL: `... WHERE name ILIKE $1, num_employees >= $2, num_employees <= $3`, ['%net%', minEmployees, maxEmployees]
             // { name: `name ILIKE $1`, minEmployees: `num_employees >= $2`, maxEmployees: `num_employees <= $3` } **dynamic indexing for $x !!!! check sql helper for ideas
             // [`%${name}%`, minEmployees, maxEmployees]
             // but we only want to add to a query what a user actually provides!
             // grab Object.keys of filters object to see what we'll actually need
             // use a map to map that information to the SQL query?
            //  const myMap = {
            //   name: "name ILIKE",
            //   minEmployees: "num_employees >=",
            //   maxEmployees: "num_employees <="
            //  }
  

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    const jobsRes = await db.query(`
        SELECT id,
               title,
               salary,
               equity
        FROM jobs
        WHERE company_handle = $1`,
      [handle]);

    const jobs = jobsRes.rows;

    company.jobs = jobs;

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if company not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
