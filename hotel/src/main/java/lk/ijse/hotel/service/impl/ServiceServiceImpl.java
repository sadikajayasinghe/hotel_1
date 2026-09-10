package lk.ijse.hotel.service.impl;

import lk.ijse.hotel.dto.ServiceDTO;
import lk.ijse.hotel.entity.Service;
import lk.ijse.hotel.repository.ServiceRepository;
import lk.ijse.hotel.service.ServiceService;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
@Slf4j
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;

    public ServiceServiceImpl(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @Override
    public void saveService(ServiceDTO serviceDTO) {
        log.info("Execute method saveService()");
        try {
            Service service = new Service();
            service.setServiceName(serviceDTO.getServiceName());
            service.setDescription(serviceDTO.getDescription());
            service.setPrice(serviceDTO.getPrice());
            serviceRepository.save(service);
        } catch (Exception e) {
            log.error("Error in saveService : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<ServiceDTO> filterServices(String serviceName) {
        log.info("Execute method filterServices()");
        try {
            List<ServiceDTO> responseList = new ArrayList<>();
            List<Service> serviceList = serviceRepository.filterServices(serviceName);

            for (Service service : serviceList) {
                ServiceDTO dto = new ServiceDTO(
                        service.getId(),
                        service.getServiceName(),
                        service.getDescription(),
                        service.getPrice() != null ? service.getPrice() : 0.0
                );
                responseList.add(dto);
            }

            return responseList;
        } catch (Exception e) {
            log.error("Error in filterServices : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public ServiceDTO getServiceDetails(long serviceId) {
        log.info("Execute method getServiceDetails()");
        try {
            Optional<Service> optionalService = serviceRepository.findById(serviceId);
            if (optionalService.isEmpty()) {
                throw new RuntimeException("Sorry, related service is not found");
            }

            Service service = optionalService.get();
            return new ServiceDTO(
                    service.getId(),
                    service.getServiceName(),
                    service.getDescription(),
                    service.getPrice() != null ? service.getPrice() : 0.0
            );
        } catch (Exception e) {
            log.error("Error in getServiceDetails : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void updateService(Long serviceId, ServiceDTO serviceDTO) {
        log.info("Execute method updateService()");
        try {
            Optional<Service> optionalService = serviceRepository.findById(serviceId);
            if (optionalService.isEmpty()) {
                throw new RuntimeException("Sorry, related service is not found");
            }

            Service service = optionalService.get();
            if (serviceDTO.getServiceName() != null) {
                service.setServiceName(serviceDTO.getServiceName());
            }
            if (serviceDTO.getDescription() != null) {
                service.setDescription(serviceDTO.getDescription());
            }
            if (serviceDTO.getPrice() > 0) {
                service.setPrice(serviceDTO.getPrice());
            }

            serviceRepository.save(service);
        } catch (Exception e) {
            log.error("Error in updateService : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void deleteService(long serviceId) {
        log.info("Execute method deleteService()");
        try {
            if (!serviceRepository.existsById(serviceId)) {
                throw new RuntimeException("Service not found with id: " + serviceId);
            }
            serviceRepository.deleteById(serviceId);
        } catch (Exception e) {
            log.error("Error in deleteService : " + e.getMessage());
            throw e;
        }
    }
}