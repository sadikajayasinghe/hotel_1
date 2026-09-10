package lk.ijse.hotel.repository;

import lk.ijse.hotel.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByPhone(String phone);

    @Query("SELECT c FROM Customer c WHERE c.nicOrPassport = :nicOrPassport")
    Optional<Customer> findByNicOrPassport(@Param("nicOrPassport") String nicOrPassport);

    @Query("SELECT c FROM Customer c WHERE :customerName IS NULL OR c.firstName LIKE %:customerName% OR c.lastName LIKE %:customerName%")
    List<Customer> filterCustomers(@Param("customerName") String customerName);
}
