import supertest from "supertest";
import {
  Body,
  Controller,
  Delete,
  Get,
  INestApplication,
  Module,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import Ajv, { JSONSchemaType } from "ajv";
import { Test } from "@nestjs/testing";
import { AjvModule } from "../src/ajv.module";
import { AjvSchema } from "../src/decorators/ajv-schema";

const createFooSchema = {
  type: "object",
  additionalProperties: false,

  properties: {
    bar: {
      type: "string",
      minLength: 1,
      maxLength: 3,
    },
  },

  required: ["bar"],
};

@AjvSchema(createFooSchema)
class CreateFooSchema {}

const filterFooSchema = {
  type: "object",
  additionalProperties: false,

  properties: {
    bar: {
      type: "string",
    },
  },

  required: ["bar"],
};

@AjvSchema(filterFooSchema)
class FilterFooSchema {}

const deleteFooSchema = {
  type: "object",
  additionalProperties: false,

  properties: {
    id: {
      type: "string",
      minLength: 36,
      maxLength: 36,
      pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    },
  },

  required: ["id"],
};

@AjvSchema(deleteFooSchema)
class DeleteFooSchema {}

@Controller("/foo")
class FooController {
  @Get()
  filter(@Query() query: FilterFooSchema) {
    return query;
  }

  @Post()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(@Body() body: CreateFooSchema): string {
    return "ok";
  }

  testNoMetadata() {
    return "ok";
  }

  @Delete(":id")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete(@Param() params: DeleteFooSchema): string {
    return "ok";
  }
}
@Module({
  controllers: [FooController],
})
class AppModule {}

const setup = async () => {
  const module = await Test.createTestingModule({
    imports: [
      AjvModule.forRoot({
        ajvInstance: new Ajv(),
      }),
      AppModule,
    ],
  }).compile();

  const app = module.createNestApplication();

  await app.init();

  return app;
};

describe("baseTest", () => {
  let app: INestApplication;
  // let api: supertest.SuperTest<supertest.Agent>;
  let api: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    app = await setup();
    api = supertest(app.getHttpServer());
  });

  test("inital test", async () => {
    const response = await api.post("/foo").send({ baz: "invalid" });
    expect(response.status).toEqual(400);
  });
});
