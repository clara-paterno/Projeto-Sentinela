import type { RequestHandler } from "express";

const notFoundHandler: RequestHandler = (req,res,next) => {
    res.status(404).json({error: "Rota não encontrada"});
};

export default notFoundHandler;