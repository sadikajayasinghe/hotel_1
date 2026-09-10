package lk.ijse.hotel.controller;

import lk.ijse.hotel.dto.CommonResponse;
import lk.ijse.hotel.dto.ServiceDTO;
import lk.ijse.hotel.service.ServiceService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.hotel.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.hotel.constant.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping(value = "v1/services")
public class ServiceController {

    private final ServiceService serviceService;

    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveService(@RequestBody ServiceDTO serviceDTO) {
        serviceService.saveService(serviceDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse filterServices(
            @RequestParam(value = "serviceName", required = false) String serviceName
    ) {
        List<ServiceDTO> serviceDTOS = serviceService.filterServices(serviceName);
        return new CommonResponse(OPERATION_SUCCESS, serviceDTOS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/{serviceId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getServiceDetails(@PathVariable long serviceId) {
        ServiceDTO serviceDetails = serviceService.getServiceDetails(serviceId);
        return new CommonResponse(OPERATION_SUCCESS, serviceDetails, SUCCESS_MESSAGE);
    }

    @PutMapping(value = "/{serviceId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateService(@PathVariable long serviceId, @RequestBody ServiceDTO serviceDTO) {
        serviceService.updateService(serviceId, serviceDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{serviceId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteService(@PathVariable long serviceId) {
        serviceService.deleteService(serviceId);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }
}