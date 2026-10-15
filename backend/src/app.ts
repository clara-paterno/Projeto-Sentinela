import express from "express";
import healthRoutes from "./routes/health.routes.js";
import errorHandler from "./middlewares/error.middleware.js"
import notFoundHandler from "./middlewares/notfound.middleware.js";


const app = express();

app.use(healthRoutes);

//Middleware para rotas inexistentes (404)
app.use(notFoundHandler);

//Middleware de tratamento de erros (500)
app.use(errorHandler);


export default app;