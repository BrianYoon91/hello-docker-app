const request = require("supertest");
const app = require("../src/index");

describe("Health endpoints", () => {
	test("GET /health returns ok", async () => {
		const res = await request(app).get("/health");
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ status: "ok" });
	});

	test("GET /live returns ok", async () => {
		const res = await request(app).get("/live");
		expect(res.statusCode).toBe(200);
		expect(res.body.status).toBe("ok");
	});

	test("GET /ready returns checks", async () => {
		const res = await request(app).get("/ready");
		expect(res.statusCode).toBe(200);
		expect(res.body.checks).toBeDefined();
	});
});
