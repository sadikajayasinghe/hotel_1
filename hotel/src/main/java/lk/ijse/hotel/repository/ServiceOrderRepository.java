package lk.ijse.hotel.repository;

import lk.ijse.hotel.entity.ServiceOrder;
import lk.ijse.hotel.enums.ServiceOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Long> {

    List<ServiceOrder> findByReservationId(Long reservationId);

    List<ServiceOrder> findByAssignedStaffId(Long staffId);

    List<ServiceOrder> findByStatus(ServiceOrderStatus status);

    @Query("SELECT so FROM ServiceOrder so WHERE ?1 IS NULL OR ?1 = 0 OR so.reservation.id = ?1")
    List<ServiceOrder> filterServiceOrders(Long reservationId);
}