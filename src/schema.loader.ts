import {
  Inject,
  Injectable,
  OnModuleInit
} from "@nestjs/common";
import { DiscoveryService, MetadataScanner, Reflector } from "@nestjs/core";
import { SCHEMA_KEY } from "./constants";
import { MODULE_OPTIONS_TOKEN } from "./ajv.module-options";
import { AjvModuleOptions } from "./interfaces";
import Ajv, { AnySchema } from "ajv";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import { classIsJsonShema, getSchemaFromClass } from "./util";

@Injectable()
export class SchemaLoader implements OnModuleInit {
  ajv: Ajv;
  constructor(
    protected reflector: Reflector,
    @Inject(MODULE_OPTIONS_TOKEN) protected options: AjvModuleOptions,
    protected discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner
  ) {
    this.ajv = options.ajvInstance;
  }

  onModuleInit() {
    this.loadSchemas();
  }

  loadSchemas() {
    const controllers = this.discoveryService.getControllers();
    const schemaClasses: Function[] = [];

    console.log(`Found ${controllers.length} controllers`);

    // Load All SchemaClasses
    for (let i = 0; i < controllers.length; i++) {
      const controller = controllers[i];
      const { instance } = controller;
      const prototype = Object.getPrototypeOf(instance);
      const handlerNames: string[] = this.retrieveHandlerNames(controller);

      console.log(
        `Found ${handlerNames.length} handlers in ${instance.constructor.name}`
      );

      for (let j = 0; j < handlerNames.length; j++) {
        const methodName = handlerNames[j];

        // we retrieve the schemaClasses annotated on the handlerMethod
        const schemas = this.retrieveSchemasFromHandler(prototype, methodName);
        console.log(
          `Found ${schemas.length} schemas in controller:handler -> ${instance.constructor.name}.${methodName}`
        );
        schemaClasses.push(...schemas);
      }
    }

    this.compileSchemas(schemaClasses);

    // Load All SchemaClasses
  }

  /**
   * This function loads all the schemas from the schemaClasses
   * To the Ajv instance that is passed in the AjvModule.forRoot
   * @param schemas This is expected to be a class annotated with "@JSONShema"
   */
  compileSchemas(schemas: Function[]) {
    // we cycle through all the schema classes
    for (let i = 0; i < schemas.length; i++) {
      const schemaClass = schemas[i];

      if (!classIsJsonShema(schemaClass)) {
        continue;
      }

      const schemaObj = getSchemaFromClass(schemaClass);

      this.ajv.addSchema(schemaObj, schemaClass.name);
    }
  }

  retrieveSchemasFromHandler(
    controllerInstancePrototype: any,
    methodName: string
  ): Function[] {
    const metadataExists = Reflect.hasMetadata(
      "design:paramtypes",
      controllerInstancePrototype,
      methodName
    );
    if (!metadataExists) {
      return [];
    }
    const methodMetadata = Reflect.getMetadata(
      "design:paramtypes",
      controllerInstancePrototype,
      methodName
    );

    const SchemaClasses = methodMetadata
      // Filter the parameters, only keep parameters that have a schema type annotation
      .filter((paramMetadata: any) =>
        Reflect.hasMetadata(SCHEMA_KEY, paramMetadata)
      );
    //   Retrieve the schema for each parameter using the metadata key

    return SchemaClasses;
  }

  retrieveHandlerNames(controller: InstanceWrapper<any>) {
    const { instance } = controller;
    const prototype = Object.getPrototypeOf(instance);

    const methodNames = this.metadataScanner.getAllMethodNames(prototype);

    const routeMethods = methodNames.filter((methodName: string) => {
      const routeMetadata = Reflect.hasMetadata(
        ROUTE_ARGS_METADATA,
        instance.constructor,
        methodName
      );
      return !!routeMetadata;
    });

    return routeMethods;
  }

  retrieveSchemaFromClassMetadata(schemaClass: Function): AnySchema | null {
    if (!classIsJsonShema(schemaClass)) {
      return null;
    }
    const schema = Reflect.getMetadata(SCHEMA_KEY, schemaClass);
    return schema;
  }
}
