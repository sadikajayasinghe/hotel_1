package lk.ijse.hotel.service;

import lk.ijse.hotel.dto.ReservationDTO;

import java.util.List;

public interface ReservationService {

    void saveReservation(ReservationDTO reservationDTO);

    List<ReservationDTO> filterReservations(String reservationNumber);

    ReservationDTO getReservationDetails(long reservationId);

    void updateReservation(Long reservationId, ReservationDTO reservationDTO);

    void deleteReservation(long reservationId);
}