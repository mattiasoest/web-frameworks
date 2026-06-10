import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { Prisma } from "@prisma/client";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response.status(status).json(typeof body === "string" ? { error: body } : body);
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === "P2025") {
        response.status(HttpStatus.NOT_FOUND).json({ error: "not_found" });
        return;
      }
      if (exception.code === "P2002") {
        response.status(HttpStatus.BAD_REQUEST).json({
          error: "validation_failed",
          details: [{ field: "registry", message: "Registry must be unique" }],
        });
        return;
      }
      if (exception.code === "P2003") {
        response.status(HttpStatus.BAD_REQUEST).json({
          error: "validation_failed",
          details: [{ field: "ship_id", message: "Ship does not exist" }],
        });
        return;
      }
    }

    console.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "internal_server_error" });
  }
}
