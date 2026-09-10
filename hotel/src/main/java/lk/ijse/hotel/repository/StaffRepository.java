package lk.ijse.hotel.repository;

import lk.ijse.hotel.entity.Staff;
import lk.ijse.hotel.enums.StaffRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    List<Staff> findByRole(StaffRole role);
}

