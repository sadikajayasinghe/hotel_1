package lk.ijse.hotel.service;

import lk.ijse.hotel.dto.RoomTypeDTO;
import java.util.List;

public interface RoomTypeService {

    void saveRoomType(RoomTypeDTO roomTypeDTO);

    List<RoomTypeDTO> filterRoomTypes(String typeName);

    RoomTypeDTO getRoomTypeDetails(long roomTypeId);

    void updateRoomType(Long roomTypeId, RoomTypeDTO roomTypeDTO);

    void deleteRoomType(long roomTypeId);
}

