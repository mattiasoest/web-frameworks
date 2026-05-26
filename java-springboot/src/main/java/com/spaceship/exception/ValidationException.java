package com.spaceship.exception;

import java.util.List;
import java.util.Map;

public class ValidationException extends RuntimeException {
    private final List<Map<String, String>> details;

    public ValidationException(List<Map<String, String>> details) {
        this.details = details;
    }

    public List<Map<String, String>> getDetails() {
        return details;
    }
}
