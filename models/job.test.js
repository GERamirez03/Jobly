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
        // equity: "0.05",
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
                // equity: "0.05",
                equity: null,
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
            // equity: "0.05",
            equity: null,
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

describe("filterSearch", function() {
    test("title filter works", async function () {
        const data = { title: "j3" };
        const jobs = await Job.filterSearch(data);
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j3",
                salary: 300000,
                equity: "0.15",
                companyHandle: "c3"
            }
        ]);
    });

    test("minSalary filter works", async function () {
        const data = { minSalary: 200000 };
        const jobs = await Job.filterSearch(data);
        expect(jobs).toEqual([
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
            }
        ]);
    });

    test("hasEquity filter works", async function () {
        const data = { hasEquity: true };
        const jobs = await Job.filterSearch(data);
        expect(jobs).toEqual([
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

    test("title & minSalary filters work together", async function () {
        const data = { title: "3", minSalary: 200000 };
        const jobs = await Job.filterSearch(data);
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j3",
                salary: 300000,
                equity: "0.15",
                companyHandle: "c3"
            },
        ]);
    });

    test("title & hasEquity filters work together", async function () {
        const data = { title: "2", hasEquity: true };
        const jobs = await Job.filterSearch(data);
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j2",
                salary: 200000,
                equity: "0.10",
                companyHandle: "c2"
            },
        ]);
    });

    test("minSalary & hasEquity filters work together", async function () {
        const data = { minSalary: 250000, hasEquity: true };
        const jobs = await Job.filterSearch(data);
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "j3",
                salary: 300000,
                equity: "0.15",
                companyHandle: "c3"
            },
        ]);
    });

    test("title, minSalary & hasEquity filters work together", async function () {
        const data = { title: "j", minSalary: 150000, hasEquity: true };
        const jobs = await Job.filterSearch(data);
        expect(jobs).toEqual([
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

/************************************** update */

describe("update", function () {
    const updateData = {
        title: "Web Developer",
        salary: 120000,
        equity: "0.04"
    };

    test("works", async function () {
        let job = await Job.update(j1.id, updateData);
        expect(job).toEqual({
            id: j1.id,
            companyHandle: "c1",
            ...updateData,
        });

        const result = await db.query(`
            SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`,
            [j1.id]);
        expect(result.rows).toEqual([{
            id: j1.id,
            title: "Web Developer",
            salary: 120000,
            equity: "0.04",
            companyHandle: "c1"
        }]);
    });

    test("works with null fields", async function () {
        const updateDataSetNulls = {
            title: "Lead Software Engineer",
            salary: null,
            equity: null
        };

        let job = await Job.update(j1.id, updateDataSetNulls);
        expect(job).toEqual({
            id: j1.id,
            title: "Lead Software Engineer",
            salary: null,
            equity: null,
            companyHandle: "c1"
        });

        const result = await db.query(`
            SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`,
            [j1.id]);
        expect(result.rows).toEqual([{
            id: j1.id,
            title: "Lead Software Engineer",
            salary: null,
            equity: null,
            companyHandle: "c1"
        }]);
    });

    test("not found if no such job", async function () {
        try {
            await Job.update(0, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async function () {
        try {
            await Job.update(j1.id, {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove", function () {
    test("works", async function () {
        await Job.remove(j1.id);
        const result = await db.query(`
            SELECT title FROM jobs WHERE id = $1`,
            [j1.id]);
        expect(result.rows.length).toEqual(0);
    });

    test("not found if no such job", async function () {
        try {
            await Job.remove(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
