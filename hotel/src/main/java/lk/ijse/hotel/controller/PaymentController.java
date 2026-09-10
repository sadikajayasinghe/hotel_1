package lk.ijse.hotel.controller;

import lk.ijse.hotel.dto.CommonResponse;
import lk.ijse.hotel.dto.PaymentDTO;
import lk.ijse.hotel.service.PaymentService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.hotel.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.hotel.constant.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping(value = "v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse savePayment(@RequestBody PaymentDTO paymentDTO) {
        paymentService.savePayment(paymentDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse filterPayments(
            @RequestParam(value = "reservationId", required = false) Long reservationId
    ) {
        List<PaymentDTO> paymentDTOS = paymentService.filterPayments(reservationId);
        return new CommonResponse(OPERATION_SUCCESS, paymentDTOS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/{paymentId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getPaymentDetails(@PathVariable long paymentId) {
        PaymentDTO paymentDetails = paymentService.getPaymentDetails(paymentId);
        return new CommonResponse(OPERATION_SUCCESS, paymentDetails, SUCCESS_MESSAGE);
    }

    @PutMapping(value = "/{paymentId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updatePayment(@PathVariable long paymentId, @RequestBody PaymentDTO paymentDTO) {
        paymentService.updatePayment(paymentId, paymentDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{paymentId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deletePayment(@PathVariable long paymentId) {
        paymentService.deletePayment(paymentId);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }
}