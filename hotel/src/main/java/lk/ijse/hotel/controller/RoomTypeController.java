package lk.ijse.hotel.controller;

import lk.ijse.hotel.dto.CommonResponse;
import lk.ijse.hotel.dto.RoomTypeDTO;
import lk.ijse.hotel.service.RoomTypeService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.hotel.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.hotel.constant.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping(value = "v1/room-types")
public class RoomTypeController {

    private final RoomTypeService roomTypeService;

    public RoomTypeController(RoomTypeService roomTypeService) {
        this.roomTypeService = roomTypeService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveRoomType(@RequestBody RoomTypeDTO roomTypeDTO) {
        roomTypeService.saveRoomType(roomTypeDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse filterRoomTypes(@RequestParam(value = "typeName", required = false) String typeName) {
        List<RoomTypeDTO> dtos = roomTypeService.filterRoomTypes(typeName);
        return new CommonResponse(OPERATION_SUCCESS, dtos, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/{roomTypeId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getRoomTypeDetails(@PathVariable long roomTypeId) {
        RoomTypeDTO dto = roomTypeService.getRoomTypeDetails(roomTypeId);
        return new CommonResponse(OPERATION_SUCCESS, dto, SUCCESS_MESSAGE);
    }

    @PutMapping(value = "/{roomTypeId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateRoomType(@PathVariable long roomTypeId, @RequestBody RoomTypeDTO roomTypeDTO) {
        roomTypeService.updateRoomType(roomTypeId, roomTypeDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{roomTypeId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteRoomType(@PathVariable long roomTypeId) {
        roomTypeService.deleteRoomType(roomTypeId);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }
}


