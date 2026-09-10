package lk.ijse.hotel.controller;

import lk.ijse.hotel.dto.CommonResponse;
import lk.ijse.hotel.dto.RoomDTO;
import lk.ijse.hotel.service.RoomService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.hotel.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.hotel.constant.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping(value = "v1/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveRoom(@RequestBody RoomDTO roomDTO){
        roomService.saveRoom(roomDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse filterRooms(
            @RequestParam(value = "roomNumber", required = false) String roomNumber
    ){
        List<RoomDTO> roomDTOS = roomService.filterRooms(roomNumber);
        return new CommonResponse(OPERATION_SUCCESS, roomDTOS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/{roomId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getRoomDetails(@PathVariable long roomId){
        RoomDTO roomDetails = roomService.getRoomDetails(roomId);
        return new CommonResponse(OPERATION_SUCCESS, roomDetails, SUCCESS_MESSAGE);
    }

    @PutMapping(value = "/{roomId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateRoom(@PathVariable long roomId, @RequestBody RoomDTO roomDTO){
        roomService.updateRoom(roomId, roomDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{roomId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteRoom(@PathVariable long roomId){
        roomService.deleteRoom(roomId);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }
}

