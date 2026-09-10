package lk.ijse.hotel.repository;

import lk.ijse.hotel.entity.Reservation;
import lk.ijse.hotel.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByReservationNumber(String reservationNumber);

    List<Reservation> findByCustomerId(Long customerId);

    List<Reservation> findByRoomId(Long roomId);

    List<Reservation> findByStatus(ReservationStatus status);

    @Query("SELECT r FROM Reservation r WHERE :reservationNumber IS NULL OR :reservationNumber = '' OR r.reservationNumber LIKE %:reservationNumber%")
    List<Reservation> filterReservations(@Param("reservationNumber") String reservationNumber);
}