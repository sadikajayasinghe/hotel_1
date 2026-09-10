package lk.ijse.hotel.repository;

import lk.ijse.hotel.dto.UserDTO;
import lk.ijse.hotel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u FROM User u WHERE u.username = :username AND u.password = :password")
    Optional<User> findByUserNameAndPassword(@Param("username") String username, @Param("password") String password);

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    @Query(value = "SELECT new lk.ijse.hotel.dto.UserDTO(u.id, u.username, CAST(u.role as string), u.userStatus) FROM User u " +
            "WHERE (:userName IS NULL OR u.username LIKE %:userName%) " +
            "AND (:userRole IS NULL OR CAST(u.role as string) LIKE %:userRole%)")
    List<UserDTO> filterUsers(@Param("userName") String userName, @Param("userRole") String userRole);
}
