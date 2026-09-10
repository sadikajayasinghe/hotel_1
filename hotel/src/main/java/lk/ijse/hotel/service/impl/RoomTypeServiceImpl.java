package lk.ijse.hotel.service.impl;

import lk.ijse.hotel.dto.RoomTypeDTO;
import lk.ijse.hotel.entity.RoomType;
import lk.ijse.hotel.repository.RoomTypeRepository;
import lk.ijse.hotel.service.RoomTypeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class RoomTypeServiceImpl implements RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;

    public RoomTypeServiceImpl(RoomTypeRepository roomTypeRepository) {
        this.roomTypeRepository = roomTypeRepository;
    }

    @Override
    public void saveRoomType(RoomTypeDTO roomTypeDTO) {
        log.info("Execute method saveRoomType()");
        try {
            RoomType roomType = new RoomType();
            roomType.setTypeName(roomTypeDTO.getTypeName());
            roomType.setDescription(roomTypeDTO.getDescription());
            roomType.setBasePrice(roomTypeDTO.getBasePrice());
            roomType.setCapacity(roomTypeDTO.getCapacity() != null ? roomTypeDTO.getCapacity() : 2);
            roomTypeRepository.save(roomType);
        } catch (Exception e) {
            log.error("Error in saveRoomType : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<RoomTypeDTO> filterRoomTypes(String typeName) {
        log.info("Execute method filterRoomTypes()");
        try {
            List<RoomTypeDTO> responseList = new ArrayList<>();
            List<RoomType> list = roomTypeRepository.filterRoomTypes(typeName);
            for (RoomType rt : list) {
                RoomTypeDTO dto = new RoomTypeDTO(
                        rt.getId(),
                        rt.getTypeName(),
                        rt.getDescription(),
                        rt.getBasePrice(),
                        rt.getCapacity()
                );
                responseList.add(dto);
            }
            return responseList;
        } catch (Exception e) {
            log.error("Error in filterRoomTypes : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public RoomTypeDTO getRoomTypeDetails(long roomTypeId) {
        log.info("Execute method getRoomTypeDetails()");
        try {
            Optional<RoomType> optional = roomTypeRepository.findById(roomTypeId);
            if (optional.isEmpty()) {
                throw new RuntimeException("Sorry, related room type is not found");
            }
            RoomType rt = optional.get();
            return new RoomTypeDTO(
                    rt.getId(),
                    rt.getTypeName(),
                    rt.getDescription(),
                    rt.getBasePrice(),
                    rt.getCapacity()
            );
        } catch (Exception e) {
            log.error("Error in getRoomTypeDetails : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void updateRoomType(Long roomTypeId, RoomTypeDTO roomTypeDTO) {
        log.info("Execute method updateRoomType()");
        try {
            Optional<RoomType> optional = roomTypeRepository.findById(roomTypeId);
            if (optional.isEmpty()) {
                throw new RuntimeException("Sorry, related room type is not found");
            }
            RoomType rt = optional.get();
            if (roomTypeDTO.getTypeName() != null) rt.setTypeName(roomTypeDTO.getTypeName());
            if (roomTypeDTO.getDescription() != null) rt.setDescription(roomTypeDTO.getDescription());
            if (roomTypeDTO.getBasePrice() != null) rt.setBasePrice(roomTypeDTO.getBasePrice());
            if (roomTypeDTO.getCapacity() != null) rt.setCapacity(roomTypeDTO.getCapacity());
            roomTypeRepository.save(rt);
        } catch (Exception e) {
            log.error("Error in updateRoomType : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void deleteRoomType(long roomTypeId) {
        log.info("Execute method deleteRoomType()");
        try {
            if (!roomTypeRepository.existsById(roomTypeId)) {
                throw new RuntimeException("Room type not found with id: " + roomTypeId);
            }
            roomTypeRepository.deleteById(roomTypeId);
        } catch (Exception e) {
            log.error("Error in deleteRoomType : " + e.getMessage());
            throw e;
        }
    }
}