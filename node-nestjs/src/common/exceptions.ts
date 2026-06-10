import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ValidationError } from "class-validator";

export function validationFailed(details: Array<{ field: string; message: string }>): never {
  throw new BadRequestException({ error: "validation_failed", details });
}

export function notFound(): never {
  throw new NotFoundException({ error: "not_found" });
}

export function formatValidationErrors(errors: ValidationError[]): Array<{ field: string; message: string }> {
  const details: Array<{ field: string; message: string }> = [];

  const walk = (error: ValidationError, prefix = "") => {
    const field = prefix ? `${prefix}.${error.property}` : error.property;
    if (error.constraints) {
      const message = Object.values(error.constraints)[0] ?? "Invalid value";
      details.push({ field, message });
    }
    for (const child of error.children ?? []) {
      walk(child, field);
    }
  };

  for (const error of errors) {
    walk(error);
  }

  return details.length > 0 ? details : [{ field: "body", message: "Validation failed" }];
}
