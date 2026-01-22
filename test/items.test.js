const request = require("supertest");
const app = require("../src/index");

describe("Items API", () => {
	test("POST /items creates an item", async () => {
		const res = await request(app).post("/items").send({ name: "coffee" });

		expect(res.statusCode).toBe(201);
		expect(res.body.item).toHaveProperty("id");
		expect(res.body.item.name).toBe("coffee");
	});

	test("GET /items returns list", async () => {
		const res = await request(app).get("/items");
		expect(res.statusCode).toBe(200);
		expect(Array.isArray(res.body.items)).toBe(true);
	});

	test("POST /items validates input", async () => {
		const res = await request(app).post("/items").send({});
		expect(res.statusCode).toBe(400);
		expect(res.body.error).toBeDefined();
	});

	test("GET /items/:id returns 404 for missing item", async () => {
		const res = await request(app).get("/items/does-not-exist");
		expect(res.statusCode).toBe(404);
	});
});
