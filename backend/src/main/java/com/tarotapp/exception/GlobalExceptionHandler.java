package com.tarotapp.exception;

import com.tarotapp.api.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

/**
 * Zentrale Fehlerbehandlung fuer REST-Endpunkte.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatusException(
            ResponseStatusException ex,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String message = ex.getReason() != null && !ex.getReason().isBlank()
                ? ex.getReason()
                : status.getReasonPhrase();

        return ResponseEntity.status(status)
                .body(new ApiError(
                        status.value(),
                        status.name(),
                        message,
                        request.getRequestURI()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(Exception ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        logger.error("Unerwarteter Fehler bei Request {}", request.getRequestURI(), ex);

        return ResponseEntity.status(status)
                .body(new ApiError(
                        status.value(),
                        status.name(),
                        "Ein unerwarteter Fehler ist aufgetreten.",
                        request.getRequestURI()
                ));
    }
}



