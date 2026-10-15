import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../app.js";


describe("GET /health", () => {
    test("deve retornar status 200 e status ok", async () => {

        const response = await request(app).get("/health");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({"status": "ok"});
    });
});