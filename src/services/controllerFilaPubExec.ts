import { Request, Response } from "express";
import { response } from "../utils/response";
import { execFile } from "child_process";
import path from "path";

class ControllerFilaPubExec {
  constructor() {}

  execMicroservice = (req: Request, res: Response) => {
    const execPath = process.env.CONTROLLER_FILA_PUB_EXE_PATH;

    if (!execPath) {
      return response(res, 500, "Caminho do executável não definido na variável de ambiente.");
    }

    const resolvedPath = path.resolve(execPath);

    execFile(resolvedPath, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao executar o microserviço: ${error.message}`);
        return response(res, 502, `Erro ao executar o microserviço: ${error.message}`);
      }

      if (stderr) {
        console.warn(`Saída de erro (stderr): ${stderr}`);
      }

      console.log(`Saída do programa (stdout): ${stdout}`);
      response(res, 200, "Microserviço executado com sucesso!", {
        caminho: resolvedPath,
        output: stdout,
      });
    });
  };
}

export default ControllerFilaPubExec;
