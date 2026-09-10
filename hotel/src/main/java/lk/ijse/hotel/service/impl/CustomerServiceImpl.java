package lk.ijse.hotel.service.impl;

import lk.ijse.hotel.dto.CustomerDTO;
import lk.ijse.hotel.entity.Customer;
import lk.ijse.hotel.repository.CustomerRepository;
import lk.ijse.hotel.service.CustomerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public void saveCustomer(CustomerDTO customerDTO) {
        log.info("Execute method saveCustomer()");
        try {
            Customer customer = new Customer();

            String name = customerDTO.getCustomerName();
            if (name != null) {
                String[] parts = name.trim().split(" ", 2);
                customer.setFirstName(parts[0]);
                customer.setLastName(parts.length > 1 ? parts[1] : "");
            }

            customer.setPhone(customerDTO.getContact());
            customer.setEmail(customerDTO.getEmail());
            customer.setNicOrPassport(customerDTO.getNicOrPassport());
            customer.setAddress(customerDTO.getAddress());

            customerRepository.save(customer);

        } catch (Exception e) {
            log.error("Error in saveCustomer : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<CustomerDTO> filterCustomers(String customerName) {
        log.info("Execute method filterCustomers()");
        try {
            List<CustomerDTO> responseList = new ArrayList<>();
            List<Customer> customerList = customerRepository.filterCustomers(customerName);

            for (Customer customer : customerList) {
                String fn = customer.getFirstName() != null ? customer.getFirstName() : "";
                String ln = customer.getLastName() != null ? customer.getLastName() : "";
                String fullName = (fn + " " + ln).trim();

                CustomerDTO dto = new CustomerDTO(
                        customer.getId(),
                        fullName,
                        customer.getPhone() != null ? customer.getPhone() : "",
                        customer.getEmail(),
                        customer.getNicOrPassport(),
                        customer.getAddress()
                );

                responseList.add(dto);
            }

            return responseList;

        } catch (Exception e) {
            log.error("Error in filterCustomers : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public CustomerDTO getCustomerDetails(long customerId) {
        log.info("Execute method getCustomerDetails()");
        try {
            Optional<Customer> optionalCustomer = customerRepository.findById(customerId);
            if (optionalCustomer.isEmpty()) {
                throw new RuntimeException("Sorry, related customer is not found");
            }

            Customer customer = optionalCustomer.get();
            String fn = customer.getFirstName() != null ? customer.getFirstName() : "";
            String ln = customer.getLastName() != null ? customer.getLastName() : "";
            String fullName = (fn + " " + ln).trim();

            return new CustomerDTO(
                    customer.getId(),
                    fullName,
                    customer.getPhone() != null ? customer.getPhone() : "",
                    customer.getEmail(),
                    customer.getNicOrPassport(),
                    customer.getAddress()
            );

        } catch (Exception e) {
            log.error("Error in getCustomerDetails : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void updateCustomer(Long customerId, CustomerDTO customerDTO) {
        log.info("Execute method updateCustomer()");
        try {
            Optional<Customer> optionalCustomer = customerRepository.findById(customerId);
            if (optionalCustomer.isEmpty()) {
                throw new RuntimeException("Sorry, related customer is not found");
            }

            Customer customer = optionalCustomer.get();

            String name = customerDTO.getCustomerName();
            if (name != null) {
                String[] parts = name.trim().split(" ", 2);
                customer.setFirstName(parts[0]);
                customer.setLastName(parts.length > 1 ? parts[1] : "");
            }

            if (customerDTO.getContact() != null) {
                customer.setPhone(customerDTO.getContact());
            }
            if (customerDTO.getEmail() != null) {
                customer.setEmail(customerDTO.getEmail());
            }
            if (customerDTO.getNicOrPassport() != null) {
                customer.setNicOrPassport(customerDTO.getNicOrPassport());
            }
            if (customerDTO.getAddress() != null) {
                customer.setAddress(customerDTO.getAddress());
            }

            customerRepository.save(customer);

        } catch (Exception e) {
            log.error("Error in updateCustomer : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void deleteCustomer(long customerId) {
        log.info("Execute method deleteCustomer()");
        try {
            if (!customerRepository.existsById(customerId)) {
                throw new RuntimeException("Customer not found with id: " + customerId);
            }
            customerRepository.deleteById(customerId);
        } catch (Exception e) {
            log.error("Error in deleteCustomer : " + e.getMessage());
            throw e;
        }
    }
}