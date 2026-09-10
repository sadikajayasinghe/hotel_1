package lk.ijse.hotel.service;

import lk.ijse.hotel.dto.ServiceDTO;

import java.util.List;

public interface ServiceService {

    void saveService(ServiceDTO serviceDTO);

    List<ServiceDTO> filterServices(String serviceName);

    ServiceDTO getServiceDetails(long serviceId);

    void updateService(Long serviceId, ServiceDTO serviceDTO);

    void deleteService(long serviceId);
}