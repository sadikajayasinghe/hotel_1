package lk.ijse.hotel.controller;

import lk.ijse.hotel.dto.CommonResponse;
import lk.ijse.hotel.dto.CustomerDTO;
import lk.ijse.hotel.service.CustomerService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.hotel.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.hotel.constant.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping(value = "v1/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveCustomer(@RequestBody CustomerDTO customerDTO){
        customerService.saveCustomer(customerDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse filterCustomers(
            @RequestParam(value = "customerName", required = false) String customerName
    ){
        List<CustomerDTO> customerDTOS = customerService.filterCustomers(customerName);
        return new CommonResponse(OPERATION_SUCCESS, customerDTOS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/{customerId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getCustomerDetails(@PathVariable long customerId){
        CustomerDTO customerDetails = customerService.getCustomerDetails(customerId);
        return new CommonResponse(OPERATION_SUCCESS, customerDetails, SUCCESS_MESSAGE);
    }

    @PutMapping(value = "/{customerId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateCustomer(@PathVariable long customerId, @RequestBody CustomerDTO customerDTO){
        customerService.updateCustomer(customerId, customerDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{customerId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteCustomer(@PathVariable long customerId){
        customerService.deleteCustomer(customerId);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }
}
