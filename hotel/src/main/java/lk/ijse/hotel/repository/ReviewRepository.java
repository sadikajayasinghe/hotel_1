package lk.ijse.hotel.repository;

import lk.ijse.hotel.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCustomerId(Long customerId);
    List<Review> findByReservationId(Long reservationId);
}

