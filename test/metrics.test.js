const request = require("supertest");
const app = require("../src/index");

describe("Metrics", () => {
	test("GET /metrics returns counters", async () => {
		const res = await request(app).get("/metrics");
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty("requestCount");
		expect(res.body).toHaveProperty("uptimeSeconds");
	});
});
