package lk.ijse.hotel.service.impl;

import lk.ijse.hotel.dto.ServiceOrderDTO;
import lk.ijse.hotel.entity.Reservation;
import lk.ijse.hotel.entity.Service;
import lk.ijse.hotel.entity.ServiceOrder;
import lk.ijse.hotel.entity.Staff;
import lk.ijse.hotel.enums.ServiceOrderStatus;
import lk.ijse.hotel.repository.ReservationRepository;
import lk.ijse.hotel.repository.ServiceOrderRepository;
import lk.ijse.hotel.repository.ServiceRepository;
import lk.ijse.hotel.repository.StaffRepository;
import lk.ijse.hotel.service.ServiceOrderService;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
@Slf4j
public class ServiceOrderServiceImpl implements ServiceOrderService {

    private final ServiceOrderRepository serviceOrderRepository;
    private final ReservationRepository reservationRepository;
    private final ServiceRepository serviceRepository;
    private final StaffRepository staffRepository;

    public ServiceOrderServiceImpl(
            ServiceOrderRepository serviceOrderRepository,
            ReservationRepository reservationRepository,
            ServiceRepository serviceRepository,
            StaffRepository staffRepository) {
        this.serviceOrderRepository = serviceOrderRepository;
        this.reservationRepository = reservationRepository;
        this.serviceRepository = serviceRepository;
        this.staffRepository = staffRepository;
    }

    @Override
    public void saveServiceOrder(ServiceOrderDTO serviceOrderDTO) {
        log.info("Execute method saveServiceOrder()");
        try {
            ServiceOrder serviceOrder = new ServiceOrder();

            int quantity = serviceOrderDTO.getQuantity() > 0 ? serviceOrderDTO.getQuantity() : 1;
            serviceOrder.setQuantity(quantity);

            if (serviceOrderDTO.getOrderDate() != null) {
                serviceOrder.setOrderDate(serviceOrderDTO.getOrderDate());
            } else {
                serviceOrder.setOrderDate(LocalDateTime.now());
            }

            if (serviceOrderDTO.getStatus() != null && !serviceOrderDTO.getStatus().isEmpty()) {
                try {
                    serviceOrder.setStatus(ServiceOrderStatus.valueOf(serviceOrderDTO.getStatus().toUpperCase()));
                } catch (Exception ignored) {
                    serviceOrder.setStatus(ServiceOrderStatus.REQUESTED);
                }
            } else {
                serviceOrder.setStatus(ServiceOrderStatus.REQUESTED);
            }

            if (serviceOrderDTO.getReservationId() > 0) {
                Optional<Reservation> optionalReservation = reservationRepository.findById(serviceOrderDTO.getReservationId());
                optionalReservation.ifPresent(serviceOrder::setReservation);
            }

            if (serviceOrderDTO.getServiceId() > 0) {
                Optional<Service> optionalService = serviceRepository.findById(serviceOrderDTO.getServiceId());
                if (optionalService.isPresent()) {
                    Service service = optionalService.get();
                    serviceOrder.setService(service);

                    if (serviceOrderDTO.getTotalPrice() <= 0) {
                        double price = service.getPrice() != null ? service.getPrice() : 0.0;
                        serviceOrder.setTotalPrice(price * quantity);
                    } else {
                        serviceOrder.setTotalPrice(serviceOrderDTO.getTotalPrice());
                    }
                } else {
                    serviceOrder.setTotalPrice(serviceOrderDTO.getTotalPrice());
                }
            } else {
                serviceOrder.setTotalPrice(serviceOrderDTO.getTotalPrice());
            }

            if (serviceOrderDTO.getStaffId() != null && serviceOrderDTO.getStaffId() > 0) {
                Optional<Staff> optionalStaff = staffRepository.findById(serviceOrderDTO.getStaffId());
                optionalStaff.ifPresent(serviceOrder::setAssignedStaff);
            }

            serviceOrderRepository.save(serviceOrder);

        } catch (Exception e) {
            log.error("Error in saveServiceOrder : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<ServiceOrderDTO> filterServiceOrders(Long reservationId) {
        log.info("Execute method filterServiceOrders()");
        try {
            List<ServiceOrderDTO> responseList = new ArrayList<>();
            List<ServiceOrder> orderList = serviceOrderRepository.filterServiceOrders(reservationId);

            for (ServiceOrder order : orderList) {
                Long resId = order.getReservation() != null ? order.getReservation().getId() : 0L;
                String resNumber = order.getReservation() != null ? order.getReservation().getReservationNumber() : "";
                Long srvId = order.getService() != null ? order.getService().getId() : 0L;
                String srvName = order.getService() != null ? order.getService().getServiceName() : "";
                Long stfId = order.getAssignedStaff() != null ? order.getAssignedStaff().getId() : null;
                String stfName = order.getAssignedStaff() != null ? order.getAssignedStaff().getFullName() : "";

                ServiceOrderDTO dto = new ServiceOrderDTO(
                        order.getId(),
                        resId,
                        resNumber,
                        srvId,
                        srvName,
                        order.getQuantity() != null ? order.getQuantity() : 1,
                        order.getTotalPrice() != null ? order.getTotalPrice() : 0.0,
                        order.getOrderDate(),
                        order.getStatus() != null ? order.getStatus().name() : ServiceOrderStatus.REQUESTED.name(),
                        stfId,
                        stfName
                );
                responseList.add(dto);
            }

            return responseList;

        } catch (Exception e) {
            log.error("Error in filterServiceOrders : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public ServiceOrderDTO getServiceOrderDetails(long serviceOrderId) {
        log.info("Execute method getServiceOrderDetails()");
        try {
            Optional<ServiceOrder> optionalOrder = serviceOrderRepository.findById(serviceOrderId);
            if (optionalOrder.isEmpty()) {
                throw new RuntimeException("Sorry, related service order is not found");
            }

            ServiceOrder order = optionalOrder.get();
            Long resId = order.getReservation() != null ? order.getReservation().getId() : 0L;
            String resNumber = order.getReservation() != null ? order.getReservation().getReservationNumber() : "";
            Long srvId = order.getService() != null ? order.getService().getId() : 0L;
            String srvName = order.getService() != null ? order.getService().getServiceName() : "";
            Long stfId = order.getAssignedStaff() != null ? order.getAssignedStaff().getId() : null;
            String stfName = order.getAssignedStaff() != null ? order.getAssignedStaff().getFullName() : "";

            return new ServiceOrderDTO(
                    order.getId(),
                    resId,
                    resNumber,
                    srvId,
                    srvName,
                    order.getQuantity() != null ? order.getQuantity() : 1,
                    order.getTotalPrice() != null ? order.getTotalPrice() : 0.0,
                    order.getOrderDate(),
                    order.getStatus() != null ? order.getStatus().name() : ServiceOrderStatus.REQUESTED.name(),
                    stfId,
                    stfName
            );
        } catch (Exception e) {
            log.error("Error in getServiceOrderDetails : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void updateServiceOrder(Long serviceOrderId, ServiceOrderDTO serviceOrderDTO) {
        log.info("Execute method updateServiceOrder()");
        try {
            Optional<ServiceOrder> optionalOrder = serviceOrderRepository.findById(serviceOrderId);
            if (optionalOrder.isEmpty()) {
                throw new RuntimeException("Sorry, related service order is not found");
            }

            ServiceOrder order = optionalOrder.get();

            if (serviceOrderDTO.getQuantity() > 0) {
                order.setQuantity(serviceOrderDTO.getQuantity());
            }
            if (serviceOrderDTO.getTotalPrice() > 0) {
                order.setTotalPrice(serviceOrderDTO.getTotalPrice());
            }
            if (serviceOrderDTO.getStatus() != null && !serviceOrderDTO.getStatus().isEmpty()) {
                try {
                    order.setStatus(ServiceOrderStatus.valueOf(serviceOrderDTO.getStatus().toUpperCase()));
                } catch (Exception ignored) {}
            }
            if (serviceOrderDTO.getReservationId() > 0) {
                reservationRepository.findById(serviceOrderDTO.getReservationId()).ifPresent(order::setReservation);
            }
            if (serviceOrderDTO.getServiceId() > 0) {
                serviceRepository.findById(serviceOrderDTO.getServiceId()).ifPresent(order::setService);
            }
            if (serviceOrderDTO.getStaffId() != null && serviceOrderDTO.getStaffId() > 0) {
                staffRepository.findById(serviceOrderDTO.getStaffId()).ifPresent(order::setAssignedStaff);
            }

            serviceOrderRepository.save(order);

        } catch (Exception e) {
            log.error("Error in updateServiceOrder : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void deleteServiceOrder(long serviceOrderId) {
        log.info("Execute method deleteServiceOrder()");
        try {
            if (!serviceOrderRepository.existsById(serviceOrderId)) {
                throw new RuntimeException("Service order not found with id: " + serviceOrderId);
            }
            serviceOrderRepository.deleteById(serviceOrderId);
        } catch (Exception e) {
            log.error("Error in deleteServiceOrder : " + e.getMessage());
            throw e;
        }
    }
}