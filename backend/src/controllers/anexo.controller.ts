import type { Request, Response } from "express";
import {z} from "zod";


import { obterUrlAnexoGcmService } from "../services/anexo.services.js";
import {
  adicionarAnexosService,
  ErroAnexo
} from "../services/anexo.services.js";

const anexarImagemSchema = z.object({
  protocolo: z.uuid(),
  codigoConsulta: z.string().regex(/^[a-fA-F0-9]{48}$/)
});

export async function anexarImagem (
  req: Request,
  res: Response
) {
  const validacao = anexarImagemSchema.safeParse(req.body)

  if(!validacao.success){
    res.status(400).json({
      mensagem: "dados de consulta inválidos",
      erros: validacao.error.flatten()
    });
    return;
  }

  const arquivos = req.files as Express.Multer.File[] | undefined;

  if(!arquivos?.length) {
    res.status(400).json({
      mensagem: "nenhuma imagemenviada"
    });
    return;
  }

  try{
    const resultado = await adicionarAnexosService(
      validacao.data.protocolo,
      validacao.data.codigoConsulta,
      arquivos
    );

    res.status(201).json(resultado);
  } catch(erro) { 
    if (erro instanceof ErroAnexo){
    res.status(erro.status).json({
      mensagem: erro.message
    });
    return;
  }
  throw erro;
}
}

export async function visualizarAnexoGcm(
  req: Request,
  res: Response
) {
  const validacao = z.uuid().safeParse(req.params.id);

  if(!validacao.success){
    res.status(400).json({
      mensagem: "ID do anexo inválido"
    });
    return;
  }

  const url = await obterUrlAnexoGcmService(validacao.data);

  if(!url){
    res.status(400).json({
      mensagem: "Anexo não encontrado"
    });
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  res.redirect(302,url);
  
}