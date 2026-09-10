package lk.ijse.hotel.controller;

import lk.ijse.hotel.dto.CommonResponse;
import lk.ijse.hotel.dto.StaffDTO;
import lk.ijse.hotel.service.StaffService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.hotel.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.hotel.constant.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping(value = "v1/staff")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveStaff(@RequestBody StaffDTO staffDTO) {
        staffService.saveStaff(staffDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse filterStaff(
            @RequestParam(value = "role", required = false) String role
    ) {
        List<StaffDTO> staffDTOS = staffService.filterStaff(role);
        return new CommonResponse(OPERATION_SUCCESS, staffDTOS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/{staffId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getStaffDetails(@PathVariable long staffId) {
        StaffDTO staffDetails = staffService.getStaffDetails(staffId);
        return new CommonResponse(OPERATION_SUCCESS, staffDetails, SUCCESS_MESSAGE);
    }

    @PutMapping(value = "/{staffId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateStaff(@PathVariable long staffId, @RequestBody StaffDTO staffDTO) {
        staffService.updateStaff(staffId, staffDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{staffId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteStaff(@PathVariable long staffId) {
        staffService.deleteStaff(staffId);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }
}
