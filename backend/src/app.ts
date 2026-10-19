import express from "express";
import healthRoutes from "./routes/health.routes.js";
import errorHandler from "./middlewares/error.middleware.js"
import notFoundHandler from "./middlewares/notfound.middleware.js";
import solicitacaoRoutes from "./routes/solicitacao.routes.js"


const app = express();

app.use(express.json())

app.use(healthRoutes);
app.use(solicitacaoRoutes);

//Middleware para rotas inexistentes (404)
app.use(notFoundHandler);

//Middleware de tratamento de erros (500)
app.use(errorHandler);

export default app;