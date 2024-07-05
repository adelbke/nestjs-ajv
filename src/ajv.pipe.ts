import {
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  PipeTransform,
} from "@nestjs/common";
import { AjvModuleOptions } from "./interfaces";
import { MODULE_OPTIONS_TOKEN } from "./ajv.module-options";
import { classIsJsonShema, getSchemaFromClass } from "./util";
import Ajv from "ajv";
import { AnyValidateFunction } from "ajv/dist/core";

@Injectable()
export class AjvValidationPipe implements PipeTransform {
  ajv: Ajv;
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) protected options: AjvModuleOptions
  ) {
    this.ajv = options.ajvInstance;
  }

  logger = new Logger(AjvValidationPipe.name);

  async transform(value: any, metadata: ArgumentMetadata) {
    // console.log("Transforming value with AJV");
    // console.log("Value: " + JSON.stringify(value));
    // console.log("Metadata: " + JSON.stringify(metadata.data, null, 2));
    // console.log("Metadata.type: " + metadata.type);
    // console.log("Metadata.metatype: " + metadata.metatype);
    // console.log(
    //   "Metadata.metatype, typeof(metatype): " + typeof metadata.metatype
    // );

    if (!this.metatypeIsShema(metadata)) {
      return value;
    }

    const schemaClass = metadata.metatype as Function;

    const validate: AnyValidateFunction<any> =
      this.retrieveValidateFunction(schemaClass);

    const valid = await validate(value);

    if (!valid) {
      throw new BadRequestException(validate.errors);
    }

    return value;
  }

  retrieveValidateFunction(schemaClass: Function): AnyValidateFunction<any> {
    const validate: AnyValidateFunction<any> | undefined = this.ajv.getSchema(
      schemaClass.name
    );

    if (!validate) {
      this.logger.warn(
        `Schema not found for Annotated ${schemaClass.name}. compiling Schema`
      );
      const schema = getSchemaFromClass(schemaClass);
      try {
        this.ajv.addSchema(schema, schemaClass.name);
      } catch (err: any) {
        this.logger.error(
          `Error compiling schema from class ${
            schemaClass.name
          } Error: ${this.ajv.errorsText(this.ajv.errors)}`
        );
        throw err;
      }

      return this.ajv.getSchema(schemaClass.name) as AnyValidateFunction<any>;
    }

    return validate;
  }

  metatypeIsShema(metadata: ArgumentMetadata): boolean {
    if (typeof metadata.metatype !== "function") {
      return false;
    }
    if (!classIsJsonShema(metadata.metatype)) {
      return false;
    }
    return true;
  }
}
