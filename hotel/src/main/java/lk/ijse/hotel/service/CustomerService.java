package lk.ijse.hotel.service;

import lk.ijse.hotel.dto.CustomerDTO;

import java.util.List;

public interface CustomerService {

    void saveCustomer(CustomerDTO customerDTO);

    List<CustomerDTO> filterCustomers(String customerName);

    CustomerDTO getCustomerDetails(long customerId);

    void updateCustomer(Long customerId, CustomerDTO customerDTO);

    void deleteCustomer(long customerId);
}
