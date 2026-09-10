package lk.ijse.hotel.controller;

import lk.ijse.hotel.dto.CommonResponse;
import lk.ijse.hotel.dto.ServiceOrderDTO;
import lk.ijse.hotel.service.ServiceOrderService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.hotel.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.hotel.constant.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping(value = "v1/service-orders")
public class ServiceOrderController {

    private final ServiceOrderService serviceOrderService;

    public ServiceOrderController(ServiceOrderService serviceOrderService) {
        this.serviceOrderService = serviceOrderService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveServiceOrder(@RequestBody ServiceOrderDTO serviceOrderDTO) {
        serviceOrderService.saveServiceOrder(serviceOrderDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse filterServiceOrders(
            @RequestParam(value = "reservationId", required = false) Long reservationId
    ) {
        List<ServiceOrderDTO> serviceOrderDTOS = serviceOrderService.filterServiceOrders(reservationId);
        return new CommonResponse(OPERATION_SUCCESS, serviceOrderDTOS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/{serviceOrderId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getServiceOrderDetails(@PathVariable long serviceOrderId) {
        ServiceOrderDTO serviceOrderDetails = serviceOrderService.getServiceOrderDetails(serviceOrderId);
        return new CommonResponse(OPERATION_SUCCESS, serviceOrderDetails, SUCCESS_MESSAGE);
    }

    @PutMapping(value = "/{serviceOrderId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateServiceOrder(@PathVariable long serviceOrderId, @RequestBody ServiceOrderDTO serviceOrderDTO) {
        serviceOrderService.updateServiceOrder(serviceOrderId, serviceOrderDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{serviceOrderId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteServiceOrder(@PathVariable long serviceOrderId) {
        serviceOrderService.deleteServiceOrder(serviceOrderId);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }
}