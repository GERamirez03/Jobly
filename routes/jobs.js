"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

// TODO: Write tests for routes


/** POST / { job } => { job }
 * 
 * job should be { title, salary, equity, companyHandle }
 * 
 * Returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});

/** GET / => 
 *      { jobs: [ { id, title, salary, equity, companyHandle }, ... ] }
 * 
 * TODO: Implement filter search and write tests for filter search
 * 
 * Can filter on provided search filters:
 *  - title (case-insensitive, partial matches)
 *  - minSalary
 *  - hasEquity (defaults to false)
 * 
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    try {
        // create an array with request's query string search parameters
        const searchParams = Object.keys(req.query);

        // If searchParams is empty, return list of all jobs
        if (searchParams.length === 0) {
            const jobs = await Job.findAll();
            return res.json({ jobs });
            
        } else { // Otherwise, perform a filter search

            // Ensure that we support all of the job filters passed
            searchParams.forEach(param => {
                if (!["title", "minSalary", "hasEquity"].includes(param)) {
                    throw new ExpressError(`Filter ${param} is not supported`, 400);
                }
            });

            // pass req.query to Job's filterSearch method
            const jobs = await Job.filterSearch(req.query);

            // return array of relevant jobs
            return res.json({ jobs });            
        }
    } catch (err) {
        return next(err);
    }
});

/** GET /[id] => { job }
 * 
 * Job is {id, title, salary, equity, companyHandle }
 * 
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 * 
 * Patches job data.
 * 
 * fields can be: { title, salary, equity }
 * 
 * Returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema); //deleted required array for jobUpdate schema
        if(!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.id, req.body);
        return  res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[id] => { deleted: id }
 * 
 * Authorization required: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
        await Job.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;