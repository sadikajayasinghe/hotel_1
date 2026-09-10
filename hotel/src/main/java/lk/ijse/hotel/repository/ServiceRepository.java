package lk.ijse.hotel.repository;

import lk.ijse.hotel.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    Optional<Service> findByServiceName(String serviceName);

    @Query("SELECT s FROM Service s WHERE :serviceName IS NULL OR :serviceName = '' OR LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :serviceName, '%'))")
    List<Service> filterServices(@Param("serviceName") String serviceName);
}