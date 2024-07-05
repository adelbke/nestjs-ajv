import { AnySchema } from "ajv";
import { SCHEMA_KEY } from "./constants";

export function classIsJsonShema(constructor: Function): boolean {
  return Reflect.hasMetadata(SCHEMA_KEY, constructor);
}

export function getSchemaFromClass(constructor: Function): AnySchema {
  return Reflect.getMetadata(SCHEMA_KEY, constructor);
}
