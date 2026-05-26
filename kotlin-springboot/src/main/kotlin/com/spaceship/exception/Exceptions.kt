package com.spaceship.exception

class ResourceNotFoundException : RuntimeException()

class ValidationException(val details: List<Map<String, String>>) : RuntimeException()
