# Nestjs-Ajv

This library allows the use of the AJV library whithin nestjs.

## Description

This project was started because I needed a way to use AJV, extend and add custom keywords that require database access and a way to compile the schemas ahead-of-time when the nestjs server starts


## Getting Started

### Dependencies

* Nestjs v9 (or higher)
* Ajv 8.16.0 (or higher)

### Installing

```bash
# using npm
npm i nestjs-ajv

# using yarn
yarn add nestjs-ajv
```

### Usage


- Register the AjvModule globally using either the `forRoot` or `forAsyncRoot` methods

```ts
@Module({
    imports: [
      AjvModule.forRoot({
        ajvInstance: new Ajv(),
      }),
      // ...other modules
    ],
})
class AppModule {}
```

- Define your schema by annotating a class using the `@AjvSchema` decorator
```ts
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
```

- Annotate the param types of your handler methods with the corresponding schemaClass

```ts
@Controller("/foo")
class FooController {
  @Post()
  create(@Body() body: CreateFooSchema): string {
    return "ok";
  }
}
```

More features incoming

<!-- ## Help -->

## Contributing
Feel free to submit issues and enhancement requests.

## Authors
Contributors names and contact info

- Kamel Eddine Adel Bouhraoua [email](mailto:adelbouhraoua23@gmail.com)  

## Version History

* 0.1
    * Initial Commit 05/07/2024

## License

This project is licensed under the MIT License with a creative commons clause - see the LICENSE file for details

## Acknowledgments
- [nestjs-ajv-glue](https://github.com/mrdck/nestjs-ajv-glue)
