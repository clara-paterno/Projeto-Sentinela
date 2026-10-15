import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("notFoundHandler", () => {
    test("deve retornar status 404 e rota não encontrada", async () =>{
        
        const response = await request(app).get("/rota-inexistente");
        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: "Rota não encontrada"})

    });
});