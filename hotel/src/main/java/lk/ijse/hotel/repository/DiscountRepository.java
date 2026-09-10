package lk.ijse.hotel.repository;

import lk.ijse.hotel.entity.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long> {

    Optional<Discount> findByCodeAndIsActiveTrue(String code);

    Optional<Discount> findByCode(String code);

    @Query("SELECT d FROM Discount d WHERE :code IS NULL OR :code = '' OR LOWER(d.code) LIKE LOWER(CONCAT('%', :code, '%'))")
    List<Discount> filterDiscounts(@Param("code") String code);
}