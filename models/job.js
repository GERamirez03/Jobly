"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilterSearch } = require("../helpers/sql");

/** Related functions for jobs. */
// TODO: Write tests for the model.

class Job {
    /** Create a job (from data), update db, return new job data.
     * 
     * data should be { title, salary, equity, company_handle }
     * 
     * Returns { title, salary, equity, company_handle }
     * */

    static async create({ title, salary, equity, company_handle }) {
        const result = await db.query(`
            INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING title, salary, equity, company_handle AS "companyHandle"`,
            [
                title, 
                salary, 
                equity, 
                company_handle
            ]
        );
        const job = result.rows[0];
        return job;
    }

    /** Find all jobs.
     * 
     * Returns [{ id, title, salary, equity, company_handle }, ...]
     */

    static async findAll() {
        const jobsRes = await db.query(`
            SELECT id,
                   title,
                   salary,
                   equity,
                   company_handle AS "companyHandle"
            FROM jobs
            ORDER BY title`);
        return jobsRes.rows;
    }

    /** Filter search for jobs... TBD */

    /** Given a job id, return data about job.
     * 
     * Returns { id, title, salary, equity, company_handle }
     * 
     * Throws NotFoundError if not found.
     * */

    static async get(id) {
        const jobRes = await db.query(`
            SELECT id,
                   title,
                   salary,
                   equity,
                   company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`,
            [id]);

        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job with id ${id}`);

        return job;
    }

    /** Update job data with `data`.
     * 
     * This is a partial update which only changes the provided fields.
     * 
     * Data CAN include: { title, salary, equity }
     * 
     * Returns { id, title, salary, equity, company_handle }
     * 
     * Throws NotFoundError if job not found.
     */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {}
        );
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs
                          SET ${setCols}
                          WHERE id = ${idVarIdx}
                          RETURNING id,
                                    title,
                                    salary,
                                    equity,
                                    company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job with id ${id}`);

        return job;
    }

    /** Delete given job from db. Returns undefined.
     * 
     * Throws NotFoundError if job not found.
     * */

    static async remove(id) {
        const result = await db.query(`
            DELETE
            FROM jobs
            WHERE id = $1
            RETURNING id`,
            [id]);
        const job = result.rows[0];

        if (!company) throw new NotFoundError(`No job with id ${id}`);
    }
}

module.exports = Job;