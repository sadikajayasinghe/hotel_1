package lk.ijse.hotel.service;

import lk.ijse.hotel.dto.RoomDTO;

import java.util.List;

public interface RoomService {

    void saveRoom(RoomDTO roomDTO);

    List<RoomDTO> filterRooms(String roomNumber);

    RoomDTO getRoomDetails(long roomId);

    void updateRoom(Long roomId, RoomDTO roomDTO);

    void deleteRoom(long roomId);
}

