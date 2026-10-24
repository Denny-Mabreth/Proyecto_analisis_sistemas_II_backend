export class CreateBusDto {
  placa: string;
  capacidad_maxima: number;
  parqueoId: number;
  lineaId?: number;
  pilotoId?: number;
}
