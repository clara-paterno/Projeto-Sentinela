import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err, req, res,next) => {
    res.status(500).json({error: "Erro interno do servidor"});
};


export default errorHandler;