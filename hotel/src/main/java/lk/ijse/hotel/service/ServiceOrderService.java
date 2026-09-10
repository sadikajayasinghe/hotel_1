package lk.ijse.hotel.service;

import lk.ijse.hotel.dto.ServiceOrderDTO;

import java.util.List;

public interface ServiceOrderService {

    void saveServiceOrder(ServiceOrderDTO serviceOrderDTO);

    List<ServiceOrderDTO> filterServiceOrders(Long reservationId);

    ServiceOrderDTO getServiceOrderDetails(long serviceOrderId);

    void updateServiceOrder(Long serviceOrderId, ServiceOrderDTO serviceOrderDTO);

    void deleteServiceOrder(long serviceOrderId);
}