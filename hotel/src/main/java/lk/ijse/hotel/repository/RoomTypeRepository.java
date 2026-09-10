package lk.ijse.hotel.repository;

import lk.ijse.hotel.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {

    Optional<RoomType> findByTypeName(String typeName);

    @Query("SELECT rt FROM RoomType rt WHERE :typeName IS NULL OR :typeName = '' OR LOWER(rt.typeName) LIKE LOWER(CONCAT('%', :typeName, '%'))")
    List<RoomType> filterRoomTypes(@Param("typeName") String typeName);
}