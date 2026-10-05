import { MigrationInterface, QueryRunner } from "typeorm";

export class NuevaMigracion1791238893206 implements MigrationInterface {
    name = 'NuevaMigracion1791238893206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "municipalidades" ("id" SERIAL NOT NULL, "nombre" character varying(150) NOT NULL, "activo" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_b97886e55f63337e6345a6c4e26" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "guardias" ("id" SERIAL NOT NULL, "nombre" character varying(150) NOT NULL, "dpi" character varying(20) NOT NULL, "accesoId" integer, CONSTRAINT "UQ_decd41f1941c2b8bdaff0536244" UNIQUE ("dpi"), CONSTRAINT "PK_3cfda55e8bef75cc0991995863d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "accesos" ("id" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "estacionId" integer, CONSTRAINT "PK_75b1bfc93410af04429a40bb30f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "parqueos" ("id" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "estacionId" integer, CONSTRAINT "PK_6ea1ce2c53951a18f879f0f3b9f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "estaciones" ("id" SERIAL NOT NULL, "nombre" character varying(150) NOT NULL, "municipalidadId" integer, CONSTRAINT "PK_fe18ed12cd95a6b4302a9bfe498" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "linea_estacion" ("id" SERIAL NOT NULL, "orden" integer NOT NULL, "lineaId" integer, "estacionId" integer, CONSTRAINT "PK_31ecb10cf556251cbf7e72ad354" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lineas" ("id" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "distancia_km" double precision NOT NULL DEFAULT '0', "municipalidadId" integer, CONSTRAINT "PK_64e22868475535b06fcf0c4c763" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pilotos" ("id" SERIAL NOT NULL, "nombre" character varying(150) NOT NULL, "historial_educativo" text NOT NULL, "residencia" text NOT NULL, "comunicacion" character varying(50) NOT NULL, CONSTRAINT "PK_1f415c249cdbab0c89b2556033d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "buses" ("id" SERIAL NOT NULL, "placa" character varying(50) NOT NULL, "capacidad_maxima" integer NOT NULL, "pasajeros_actuales" integer NOT NULL DEFAULT '0', "lineaId" integer, "parqueoId" integer NOT NULL, "pilotoId" integer, CONSTRAINT "UQ_e78e1b9df21315024e40a67d025" UNIQUE ("placa"), CONSTRAINT "PK_ddebc0eeba64a019ae072975947" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "guardias" ADD CONSTRAINT "FK_baacd3d1f34073aae674bfc3951" FOREIGN KEY ("accesoId") REFERENCES "accesos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "accesos" ADD CONSTRAINT "FK_5182c4677398727d35dbe1bad85" FOREIGN KEY ("estacionId") REFERENCES "estaciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parqueos" ADD CONSTRAINT "FK_e768236e21de12eb866eb633381" FOREIGN KEY ("estacionId") REFERENCES "estaciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "estaciones" ADD CONSTRAINT "FK_878a8a8220efbc14c17f161af5e" FOREIGN KEY ("municipalidadId") REFERENCES "municipalidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "linea_estacion" ADD CONSTRAINT "FK_5bd9a943bf719cacaaf74ce44d5" FOREIGN KEY ("lineaId") REFERENCES "lineas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "linea_estacion" ADD CONSTRAINT "FK_c20da1bea3e5355da745bdeb677" FOREIGN KEY ("estacionId") REFERENCES "estaciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lineas" ADD CONSTRAINT "FK_f8f93b8838b4b7cc9677ba3e4ea" FOREIGN KEY ("municipalidadId") REFERENCES "municipalidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "buses" ADD CONSTRAINT "FK_0cf3e61f49cd12784073fd306ca" FOREIGN KEY ("lineaId") REFERENCES "lineas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "buses" ADD CONSTRAINT "FK_ab9559d6177620a8658168eaa43" FOREIGN KEY ("parqueoId") REFERENCES "parqueos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "buses" ADD CONSTRAINT "FK_7461943d9a588c4ea5daed1c7fa" FOREIGN KEY ("pilotoId") REFERENCES "pilotos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "buses" DROP CONSTRAINT "FK_7461943d9a588c4ea5daed1c7fa"`);
        await queryRunner.query(`ALTER TABLE "buses" DROP CONSTRAINT "FK_ab9559d6177620a8658168eaa43"`);
        await queryRunner.query(`ALTER TABLE "buses" DROP CONSTRAINT "FK_0cf3e61f49cd12784073fd306ca"`);
        await queryRunner.query(`ALTER TABLE "lineas" DROP CONSTRAINT "FK_f8f93b8838b4b7cc9677ba3e4ea"`);
        await queryRunner.query(`ALTER TABLE "linea_estacion" DROP CONSTRAINT "FK_c20da1bea3e5355da745bdeb677"`);
        await queryRunner.query(`ALTER TABLE "linea_estacion" DROP CONSTRAINT "FK_5bd9a943bf719cacaaf74ce44d5"`);
        await queryRunner.query(`ALTER TABLE "estaciones" DROP CONSTRAINT "FK_878a8a8220efbc14c17f161af5e"`);
        await queryRunner.query(`ALTER TABLE "parqueos" DROP CONSTRAINT "FK_e768236e21de12eb866eb633381"`);
        await queryRunner.query(`ALTER TABLE "accesos" DROP CONSTRAINT "FK_5182c4677398727d35dbe1bad85"`);
        await queryRunner.query(`ALTER TABLE "guardias" DROP CONSTRAINT "FK_baacd3d1f34073aae674bfc3951"`);
        await queryRunner.query(`DROP TABLE "buses"`);
        await queryRunner.query(`DROP TABLE "pilotos"`);
        await queryRunner.query(`DROP TABLE "lineas"`);
        await queryRunner.query(`DROP TABLE "linea_estacion"`);
        await queryRunner.query(`DROP TABLE "estaciones"`);
        await queryRunner.query(`DROP TABLE "parqueos"`);
        await queryRunner.query(`DROP TABLE "accesos"`);
        await queryRunner.query(`DROP TABLE "guardias"`);
        await queryRunner.query(`DROP TABLE "municipalidades"`);
    }

}
