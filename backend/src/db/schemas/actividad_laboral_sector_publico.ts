import { AmbitoPublico, NivelOrdenGobierno } from '../../types/enums';
import { MontoSchema } from './monto';
import { Schema } from 'mongoose';
import { addNullValue } from '../../library/utils';

const string_type = {
  type: String,
  trim: true,
  uppercase: true,
};

export const ActividadLaboralSectorPublicoSchema = new Schema({
  nivelOrdenGobierno: {
    type: String,
    enum: addNullValue(NivelOrdenGobierno),
  },
  ambitoPublico: {
    type: String,
    enum: addNullValue(AmbitoPublico),
  },
  nombreEntePublico: string_type,
  areaAdscripcion: string_type,
  empleoCargoComision: string_type,
  funcionPrincipal: string_type,
  salarioMensualNeto: MontoSchema,
  fechaIngreso: Date,
});
