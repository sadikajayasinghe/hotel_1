package lk.ijse.hotel.repository;

import lk.ijse.hotel.entity.Payment;
import lk.ijse.hotel.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByReservationId(Long reservationId);

    List<Payment> findByPaymentStatus(PaymentStatus paymentStatus);

    @Query("SELECT p FROM Payment p WHERE :reservationId IS NULL OR :reservationId = 0 OR p.reservation.id = :reservationId")
    List<Payment> filterPayments(@Param("reservationId") Long reservationId);
}