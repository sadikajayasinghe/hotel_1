package lk.ijse.hotel.exception;

import lk.ijse.hotel.dto.CommonResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class AppExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value = {Exception.class})
    public ResponseEntity<CommonResponse> handleServerException(Exception ex, WebRequest webRequest){
        ex.printStackTrace();
        String reason = ex.getMessage() != null ? ex.getMessage() : "UNEXPECTED_ERROR";
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new CommonResponse(500, reason));
    }

    @ExceptionHandler(value = {CustomException.class})
    public ResponseEntity<CommonResponse> handleCustomException(CustomException ex, WebRequest webRequest){
        ex.printStackTrace();
        return ResponseEntity.ok(new CommonResponse(ex.getStatus(), ex.getMessage()));
    }

}

