import Express from 'express';
// import JWTMiddleware from 'express-jwt';
import { StatusCodes } from 'http-status-codes';
import { UserDec } from '../types';
import UserDecModel from '../db/models/user_dec_model';
import instituciones from '../data/instituciones.json';

export default class InstitucionesAPI {
  private router: Express.Router;

  public constructor() {
    this.router = Express.Router();
    // this.router.get('/instituciones', JWTMiddleware({ secret: `${process.env.JWT_SECRET}`, algorithms: ['HS256', 'RS256'] }), InstitucionesAPI.getInstituciones);
    this.router.get('/instituciones', InstitucionesAPI.getInstituciones);
  }

  public getRouter(): Express.Router {
    return this.router;
  }

  public static create(app: Express.Application): void {
    const api: InstitucionesAPI = new InstitucionesAPI();
    app.use(api.getRouter());
  }

  private static async getInstituciones(req: Express.Request, res: Express.Response): Promise<any> {
    const list_instituciones = instituciones.map(({ ente_publico, clave }) => ({ clave, ente_publico }));
    return res.status(StatusCodes.OK).send(list_instituciones);
  }

  public static getInstitucionDataByClave(clave: string, tipoDeclaracion: string): any {
    const list_instituciones = instituciones.filter(i => i.clave === clave);
    const { ente_publico, lugar, servidor_publico_recibe, acuse: a, declaracion: d } = list_instituciones[0];
    let insData: any = { 
      ente_publico, 
      lugar, 
      servidor_publico_recibe: {
        nombre: servidor_publico_recibe.nombre,
        cargo: servidor_publico_recibe.cargo
      }
    };
    switch (tipoDeclaracion) {
      case 'INICIAL':
        insData = { 
          ...insData, 
          acuse: { 
            titulo: a.inicial.titulo, 
            subtitulo: a.inicial.subtitulo,
            tipo_declaracion: a.tipo_declaracion,
            texto1_cuerpo_acuse: a.texto1_cuerpo_acuse,
            texto2_cuerpo_acuse: a.texto2_cuerpo_acuse
          },
          declaracion: { 
            titulo: d.inicial.titulo, 
            subtitulo: d.subtitulo,
            tipo_declaracion: d.tipo_declaracion,
            texto_declaratoria: d.texto_declaratoria
          } 
        };
        break;
      case 'MODIFICACION':
        insData = { 
          ...insData, 
          acuse: { 
            titulo: a.modificacion.titulo, 
            subtitulo: a.modificacion.subtitulo,
            tipo_declaracion: a.tipo_declaracion,
            texto1_cuerpo_acuse: a.texto1_cuerpo_acuse,
            texto2_cuerpo_acuse: a.texto2_cuerpo_acuse
          },
          declaracion: { 
            titulo: d.modificacion.titulo, 
            subtitulo: d.subtitulo,
            tipo_declaracion: d.tipo_declaracion,
            texto_declaratoria: d.texto_declaratoria
          } 
        };
        break;
      case 'CONCLUSION':
        insData = { 
          ...insData, 
          acuse: { 
            titulo: a.conclusion.titulo, 
            subtitulo: a.conclusion.subtitulo,
            tipo_declaracion: a.tipo_declaracion,
            texto1_cuerpo_acuse: a.texto1_cuerpo_acuse,
            texto2_cuerpo_acuse: a.texto2_cuerpo_acuse
          },
          declaracion: { 
            titulo: d.conclusion.titulo, 
            subtitulo: d.subtitulo,
            tipo_declaracion: d.tipo_declaracion,
            texto_declaratoria: d.texto_declaratoria
          } 
        };
        break;
      default:
        console.log(__filename, 'tipoDeclaracion', 'no deberias estar aqui');
        break;
    }
    return insData;
  }
  
  public static async recordUserDec(declaracion_id: string, user_id: string, insData: any): Promise<any> {
    const userDec: UserDec = {
      owner: user_id,
      declaraciones: declaracion_id,
      ente_publico: insData.ente_publico,
      lugar: insData.lugar,
      acuse: insData.acuse,
      declaracion: insData.declaracion,
      servidor_publico_recibe: insData.servidor_publico_recibe
    };

    return UserDecModel.create(userDec);
  }
}
