package com.spaceship.exception

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleNotFound(): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "not_found"))

    @ExceptionHandler(ValidationException::class)
    fun handleValidation(ex: ValidationException): ResponseEntity<Map<String, Any>> =
        ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            mapOf("error" to "validation_failed", "details" to ex.details)
        )

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleBeanValidation(ex: MethodArgumentNotValidException): ResponseEntity<Map<String, Any>> {
        val details = ex.bindingResult.fieldErrors.map {
            mapOf("field" to it.field, "message" to (it.defaultMessage ?: "Invalid value"))
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            mapOf("error" to "validation_failed", "details" to details)
        )
    }
}
