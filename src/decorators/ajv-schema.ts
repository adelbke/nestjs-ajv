import { AnySchema } from "ajv";
import { SCHEMA_KEY } from "../constants";

export const AjvSchema = (schema: AnySchema) => {
    return (constructor: Function) => {
      Reflect.defineMetadata(SCHEMA_KEY, schema, constructor);
    };
  };
  