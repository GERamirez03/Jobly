/** Tests for Job model */

"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError.js");
const Company = require("./company.js");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

let j1;

// create test jobs
beforeAll(async function () {
    j1 = await Job.create({
        title: "j1",
        salary: 100000,
        equity: "0.05",
        company_handle: "c1"
    });
    await Job.create({
        title: "j2",
        salary: 200000,
        equity: "0.10",
        company_handle: "c2"
    });
    await Job.create({
        title: "j3",
        salary: 300000,
        equity: "0.15",
        company_handle: "c3"
    });
})

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "newJob",
        salary: 50000,
        equity: 0.01,
        company_handle: "c1"
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual(
            {
                id: expect.any(Number),
                title: "newJob",
                salary: 50000,
                equity: "0.01",
                companyHandle: "c1"
            }
        );

        const result = await db.query(`
            SELECT title, salary, equity, company_handle
            FROM jobs
            WHERE title = 'newJob'`);
        expect(result.rows).toEqual([
            {
                title: "newJob",
                salary: 50000,
                equity: "0.01",
                company_handle: "c1"
            }
        ]);
    });
});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j1",
                salary: 100000,
                equity: "0.05",
                companyHandle: "c1"
            },
            {
                id: expect.any(Number),
                title: "j2",
                salary: 200000,
                equity: "0.10",
                companyHandle: "c2"
            },
            {
                id: expect.any(Number),
                title: "j3",
                salary: 300000,
                equity: "0.15",
                companyHandle: "c3"
            },
        ]);
    });
});

/************************************** get */

describe("get", function () {
    test("works", async function () {
        let job = await Job.get(j1.id);
        expect(job).toEqual({
            id: j1.id,
            title: "j1",
            salary: 100000,
            equity: "0.05",
            companyHandle: "c1"
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.get(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** filterSearch */

/************************************** update */

/************************************** remove */
