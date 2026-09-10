package lk.ijse.hotel.service.impl;

import lk.ijse.hotel.dto.RoomDTO;
import lk.ijse.hotel.entity.Room;
import lk.ijse.hotel.entity.RoomType;
import lk.ijse.hotel.enums.RoomStatus;
import lk.ijse.hotel.repository.RoomRepository;
import lk.ijse.hotel.repository.RoomTypeRepository;
import lk.ijse.hotel.service.RoomService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    public RoomServiceImpl(RoomRepository roomRepository, RoomTypeRepository roomTypeRepository) {
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

    @Override
    public void saveRoom(RoomDTO roomDTO) {
        log.info("Execute method saveRoom()");
        try {
            Room room = new Room();
            room.setRoomNumber(roomDTO.getRoomNumber());
            room.setFloor(roomDTO.getFloor() > 0 ? roomDTO.getFloor() : 1);
            room.setPrice(roomDTO.getPrice());

            if (roomDTO.getStatus() != null && !roomDTO.getStatus().isEmpty()) {
                try {
                    room.setStatus(RoomStatus.valueOf(roomDTO.getStatus().toUpperCase()));
                } catch (Exception ignored) {
                    room.setStatus(RoomStatus.AVAILABLE);
                }
            } else {
                room.setStatus(RoomStatus.AVAILABLE);
            }

            if (roomDTO.getRoomType() != null && !roomDTO.getRoomType().isEmpty()) {
                RoomType roomType = roomTypeRepository.findByTypeName(roomDTO.getRoomType())
                        .orElseGet(() -> roomTypeRepository.save(RoomType.builder()
                                .typeName(roomDTO.getRoomType())
                                .basePrice(roomDTO.getPrice())
                                .capacity(2)
                                .build()));
                room.setRoomType(roomType);
            }

            roomRepository.save(room);

        } catch (Exception e) {
            log.error("Error in saveRoom : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<RoomDTO> filterRooms(String roomNumber) {
        log.info("Execute method filterRooms()");
        try {
            List<RoomDTO> responseList = new ArrayList<>();
            List<Room> roomList = roomRepository.filterRooms(roomNumber);

            for (Room room : roomList) {
                String typeName = room.getRoomType() != null ? room.getRoomType().getTypeName() : "";
                double price = room.getPrice() != null ? room.getPrice() : (room.getRoomType() != null && room.getRoomType().getBasePrice() != null ? room.getRoomType().getBasePrice() : 0.0);

                RoomDTO dto = new RoomDTO(
                        room.getId(),
                        room.getRoomNumber(),
                        typeName,
                        price,
                        room.getStatus() != null ? room.getStatus().name() : RoomStatus.AVAILABLE.name(),
                        room.getFloor() != null ? room.getFloor() : 1
                );

                responseList.add(dto);
            }

            return responseList;

        } catch (Exception e) {
            log.error("Error in filterRooms : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public RoomDTO getRoomDetails(long roomId) {
        log.info("Execute method getRoomDetails()");
        try {
            Optional<Room> optionalRoom = roomRepository.findById(roomId);
            if (optionalRoom.isEmpty()) {
                throw new RuntimeException("Sorry, related room is not found");
            }

            Room room = optionalRoom.get();
            String typeName = room.getRoomType() != null ? room.getRoomType().getTypeName() : "";
            double price = room.getPrice() != null ? room.getPrice() : (room.getRoomType() != null && room.getRoomType().getBasePrice() != null ? room.getRoomType().getBasePrice() : 0.0);

            return new RoomDTO(
                    room.getId(),
                    room.getRoomNumber(),
                    typeName,
                    price,
                    room.getStatus() != null ? room.getStatus().name() : RoomStatus.AVAILABLE.name(),
                    room.getFloor() != null ? room.getFloor() : 1
            );

        } catch (Exception e) {
            log.error("Error in getRoomDetails : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void updateRoom(Long roomId, RoomDTO roomDTO) {
        log.info("Execute method updateRoom()");
        try {
            Optional<Room> optionalRoom = roomRepository.findById(roomId);
            if (optionalRoom.isEmpty()) {
                throw new RuntimeException("Sorry, related room is not found");
            }

            Room room = optionalRoom.get();
            if (roomDTO.getRoomNumber() != null) {
                room.setRoomNumber(roomDTO.getRoomNumber());
            }
            if (roomDTO.getFloor() > 0) {
                room.setFloor(roomDTO.getFloor());
            }
            if (roomDTO.getPrice() > 0) {
                room.setPrice(roomDTO.getPrice());
            }
            if (roomDTO.getStatus() != null && !roomDTO.getStatus().isEmpty()) {
                try {
                    room.setStatus(RoomStatus.valueOf(roomDTO.getStatus().toUpperCase()));
                } catch (Exception ignored) {}
            }
            if (roomDTO.getRoomType() != null && !roomDTO.getRoomType().isEmpty()) {
                RoomType roomType = roomTypeRepository.findByTypeName(roomDTO.getRoomType())
                        .orElseGet(() -> roomTypeRepository.save(RoomType.builder()
                                .typeName(roomDTO.getRoomType())
                                .basePrice(roomDTO.getPrice())
                                .capacity(2)
                                .build()));
                room.setRoomType(roomType);
            }

            roomRepository.save(room);
        } catch (Exception e) {
            log.error("Error in updateRoom : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void deleteRoom(long roomId) {
        log.info("Execute method deleteRoom()");
        try {
            if (!roomRepository.existsById(roomId)) {
                throw new RuntimeException("Room not found with id: " + roomId);
            }
            roomRepository.deleteById(roomId);
        } catch (Exception e) {
            log.error("Error in deleteRoom : " + e.getMessage());
            throw e;
        }
    }
}