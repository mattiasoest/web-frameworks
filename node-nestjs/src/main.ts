import { NestFactory } from "@nestjs/core";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { formatValidationErrors } from "./common/exceptions";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      exceptionFactory: (errors) =>
        new BadRequestException({
          error: "validation_failed",
          details: formatValidationErrors(errors),
        }),
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  const port = Number(process.env.PORT || 3007);
  await app.listen(port);
  console.log(`node-nestjs listening on port ${port}`);
}

bootstrap();
