import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import errorHandler from "../middlewares/error.middleware.js";

describe("errorHandler", () => {
    it("deve retornar status 500 e erro interno do servidor", async () =>{

      const app = express();

      app.get('/erro', (_req, _res, next) =>{
          next(new Error("Erro inesperado"))
      });

      app.use(errorHandler);
        
        const response = await request(app).get("/erro");
        expect(response.status).toBe(500);

    });
});