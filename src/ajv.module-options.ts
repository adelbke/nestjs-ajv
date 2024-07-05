import { ConfigurableModuleBuilder } from "@nestjs/common";
import { AjvModuleOptions } from "./interfaces";

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<AjvModuleOptions>()
    .setClassMethodName("forRoot")
    .build();
