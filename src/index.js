const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json()); // parse JSON bodies

// ---- Simple request ID + logging middleware ----
app.use((req, res, next) => {
	const requestId = req.header("x-request-id") || crypto.randomUUID();
	res.setHeader("x-request-id", requestId);

	const start = Date.now();

	res.on("finish", () => {
		const ms = Date.now() - start;
		console.log(
			JSON.stringify({
				requestId,
				method: req.method,
				path: req.originalUrl,
				status: res.statusCode,
				durationMs: ms,
			}),
		);
	});

	req.requestId = requestId;
	next();
});

// ---- In-memory datastore (for demo purposes) ----
const items = new Map(); // id -> { id, name, createdAt }
let requestCount = 0;

app.use((req, res, next) => {
	requestCount += 1;
	next();
});

// ---- Health endpoints ----

// Liveness: app process is running
app.get("/live", (req, res) => {
	res.json({ status: "ok" });
});

// Readiness: app is ready to serve traffic (pretend checks)
app.get("/ready", (req, res) => {
	// In a real app you'd check DB, cache, downstream services, etc.
	const checks = {
		memoryStore: "ok",
	};

	res.json({ status: "ok", checks });
});

// Keep your original endpoint too (optional)
app.get("/health", (req, res) => {
	res.json({ status: "ok" });
});

// ---- CRUD endpoints ----

// List items
app.get("/items", (req, res) => {
	res.json({ items: Array.from(items.values()) });
});

// Create item
app.post("/items", (req, res, next) => {
	try {
		const { name } = req.body;

		if (!name || typeof name !== "string") {
			return res.status(400).json({
				error: {
					message: "Field 'name' is required and must be a string.",
					requestId: req.requestId,
				},
			});
		}

		const id = crypto.randomUUID();
		const item = { id, name, createdAt: new Date().toISOString() };
		items.set(id, item);

		res.status(201).json({ item });
	} catch (err) {
		next(err);
	}
});

// Get item by id
app.get("/items/:id", (req, res) => {
	const item = items.get(req.params.id);
	if (!item) {
		return res.status(404).json({
			error: { message: "Item not found.", requestId: req.requestId },
		});
	}
	res.json({ item });
});

// Delete item
app.delete("/items/:id", (req, res) => {
	const existed = items.delete(req.params.id);
	if (!existed) {
		return res.status(404).json({
			error: { message: "Item not found.", requestId: req.requestId },
		});
	}
	res.status(204).send();
});

// ---- Basic metrics ----
app.get("/metrics", (req, res) => {
	res.json({
		requestCount,
		itemsCount: items.size,
		uptimeSeconds: Math.floor(process.uptime()),
	});
});

// ---- Central error handler (must be last) ----
app.use((err, req, res, next) => {
	console.error("Unhandled error:", err);

	res.status(500).json({
		error: {
			message: "Internal Server Error",
			requestId: req.requestId,
		},
	});
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
