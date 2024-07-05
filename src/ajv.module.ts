import { Module } from "@nestjs/common";
import { AjvValidationPipe } from "./ajv.pipe";
import { ConfigurableModuleClass } from "./ajv.module-options";
import { APP_PIPE, DiscoveryModule } from "@nestjs/core";
import { SchemaLoader } from "./schema.loader";

@Module({
  imports: [DiscoveryModule],
  providers: [
    {
      provide: APP_PIPE,
      useClass: AjvValidationPipe,
    },
    SchemaLoader,
  ],
})
export class AjvModule extends ConfigurableModuleClass {}
