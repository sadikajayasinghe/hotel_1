package lk.ijse.hotel.controller;

import lk.ijse.hotel.dto.CommonResponse;
import lk.ijse.hotel.dto.ReservationDTO;
import lk.ijse.hotel.service.ReservationService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.hotel.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.hotel.constant.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping(value = "v1/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveReservation(@RequestBody ReservationDTO reservationDTO) {
        reservationService.saveReservation(reservationDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse filterReservations(
            @RequestParam(value = "reservationNumber", required = false) String reservationNumber
    ) {
        List<ReservationDTO> reservationDTOS = reservationService.filterReservations(reservationNumber);
        return new CommonResponse(OPERATION_SUCCESS, reservationDTOS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/{reservationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getReservationDetails(@PathVariable long reservationId) {
        ReservationDTO reservationDetails = reservationService.getReservationDetails(reservationId);
        return new CommonResponse(OPERATION_SUCCESS, reservationDetails, SUCCESS_MESSAGE);
    }

    @PutMapping(value = "/{reservationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateReservation(@PathVariable long reservationId, @RequestBody ReservationDTO reservationDTO) {
        reservationService.updateReservation(reservationId, reservationDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{reservationId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteReservation(@PathVariable long reservationId) {
        reservationService.deleteReservation(reservationId);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }
}