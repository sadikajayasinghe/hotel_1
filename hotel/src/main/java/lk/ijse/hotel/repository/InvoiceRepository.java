package lk.ijse.hotel.repository;

import lk.ijse.hotel.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByReservationId(Long reservationId);

    @Query("SELECT i FROM Invoice i WHERE :reservationId IS NULL OR :reservationId = 0 OR i.reservation.id = :reservationId")
    List<Invoice> filterInvoices(@Param("reservationId") Long reservationId);
}