import express from "express";

import healthRoutes from "./routes/health.routes.js";
import solicitacaoRoutes from "./routes/solicitacao.routes.js";
import categoriaRoutes from "./routes/categoria.routes.js";
import authRoutes from "./routes/auth.routes.js";
import gcmRoutes from "./routes/gcm.routes.js"
import anexoRoutes from "./routes/anexo.routes.js"
import errorHandler from "./middlewares/error.middleware.js";
import notFoundHandler from "./middlewares/notfound.middleware.js";

const app = express();

app.use(express.json());

app.use(healthRoutes);
app.use(categoriaRoutes);
app.use(solicitacaoRoutes);
app.use(anexoRoutes)

app.use(authRoutes);    
app.use(gcmRoutes);

// Rota inexistente (404)
app.use(notFoundHandler);

// Tratamento de erros internos
app.use(errorHandler);

export default app;
