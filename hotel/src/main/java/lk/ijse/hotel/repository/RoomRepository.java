package lk.ijse.hotel.repository;

import lk.ijse.hotel.entity.Room;
import lk.ijse.hotel.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findByRoomNumber(String roomNumber);

    List<Room> findByStatus(RoomStatus status);

    List<Room> findByRoomTypeId(Long roomTypeId);

    @Query("SELECT r FROM Room r WHERE ?1 IS NULL OR ?1 = '' OR r.roomNumber LIKE %?1%")
    List<Room> filterRooms(String roomNumber);
}
