import express from "express";
import { METHODS } from "node:http";

const app = express();

app.get("/health", (req,res) =>{
    res.json({status: "ok"});
});

export default app;