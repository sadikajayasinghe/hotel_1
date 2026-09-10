package lk.ijse.hotel.controller;

import lk.ijse.hotel.dto.CommonResponse;
import lk.ijse.hotel.dto.InvoiceDTO;
import lk.ijse.hotel.service.InvoiceService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.hotel.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.hotel.constant.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping(value = "v1/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveInvoice(@RequestBody InvoiceDTO invoiceDTO) {
        invoiceService.saveInvoice(invoiceDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse filterInvoices(
            @RequestParam(value = "reservationId", required = false) Long reservationId
    ) {
        List<InvoiceDTO> invoiceDTOS = invoiceService.filterInvoices(reservationId);
        return new CommonResponse(OPERATION_SUCCESS, invoiceDTOS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/{invoiceId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getInvoiceDetails(@PathVariable long invoiceId) {
        InvoiceDTO invoiceDetails = invoiceService.getInvoiceDetails(invoiceId);
        return new CommonResponse(OPERATION_SUCCESS, invoiceDetails, SUCCESS_MESSAGE);
    }

    @PutMapping(value = "/{invoiceId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateInvoice(@PathVariable long invoiceId, @RequestBody InvoiceDTO invoiceDTO) {
        invoiceService.updateInvoice(invoiceId, invoiceDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{invoiceId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteInvoice(@PathVariable long invoiceId) {
        invoiceService.deleteInvoice(invoiceId);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }
}