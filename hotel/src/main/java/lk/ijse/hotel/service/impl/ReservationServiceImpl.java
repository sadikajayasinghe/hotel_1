package lk.ijse.hotel.service.impl;

import lk.ijse.hotel.dto.ReservationDTO;
import lk.ijse.hotel.entity.Customer;
import lk.ijse.hotel.entity.Reservation;
import lk.ijse.hotel.entity.Room;
import lk.ijse.hotel.entity.User;
import lk.ijse.hotel.enums.ReservationStatus;
import lk.ijse.hotel.repository.CustomerRepository;
import lk.ijse.hotel.repository.ReservationRepository;
import lk.ijse.hotel.repository.RoomRepository;
import lk.ijse.hotel.repository.UserRepository;
import lk.ijse.hotel.service.ReservationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final CustomerRepository customerRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public ReservationServiceImpl(
            ReservationRepository reservationRepository,
            CustomerRepository customerRepository,
            RoomRepository roomRepository,
            UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.customerRepository = customerRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void saveReservation(ReservationDTO reservationDTO) {
        log.info("Execute method saveReservation()");
        try {
            Reservation reservation = new Reservation();

            String resNumber = reservationDTO.getReservationNumber();
            if (resNumber == null || resNumber.trim().isEmpty()) {
                resNumber = "RES-" + System.currentTimeMillis();
            }
            reservation.setReservationNumber(resNumber);

            reservation.setCheckInDate(reservationDTO.getCheckInDate());
            reservation.setCheckOutDate(reservationDTO.getCheckOutDate());
            reservation.setNumberOfGuests(reservationDTO.getNumberOfGuests() > 0 ? reservationDTO.getNumberOfGuests() : 1);

            if (reservationDTO.getStatus() != null && !reservationDTO.getStatus().isEmpty()) {
                try {
                    reservation.setStatus(ReservationStatus.valueOf(reservationDTO.getStatus().toUpperCase()));
                } catch (Exception ignored) {
                    reservation.setStatus(ReservationStatus.CONFIRMED);
                }
            } else {
                reservation.setStatus(ReservationStatus.CONFIRMED);
            }

            if (reservationDTO.getCustomerId() > 0) {
                Optional<Customer> optionalCustomer = customerRepository.findById(reservationDTO.getCustomerId());
                optionalCustomer.ifPresent(reservation::setCustomer);
            }

            if (reservationDTO.getRoomId() > 0) {
                Optional<Room> optionalRoom = roomRepository.findById(reservationDTO.getRoomId());
                if (optionalRoom.isPresent()) {
                    Room room = optionalRoom.get();
                    reservation.setRoom(room);

                    if (reservationDTO.getTotalAmount() <= 0 && reservationDTO.getCheckInDate() != null && reservationDTO.getCheckOutDate() != null) {
                        long days = ChronoUnit.DAYS.between(reservationDTO.getCheckInDate(), reservationDTO.getCheckOutDate());
                        if (days <= 0) days = 1;
                        double pricePerNight = room.getPrice() != null ? room.getPrice() : 0.0;
                        reservation.setTotalAmount(days * pricePerNight);
                    } else {
                        reservation.setTotalAmount(reservationDTO.getTotalAmount());
                    }
                } else {
                    reservation.setTotalAmount(reservationDTO.getTotalAmount());
                }
            } else {
                reservation.setTotalAmount(reservationDTO.getTotalAmount());
            }

            if (reservationDTO.getUserId() > 0) {
                Optional<User> optionalUser = userRepository.findById(reservationDTO.getUserId());
                optionalUser.ifPresent(reservation::setUser);
            }

            reservationRepository.save(reservation);

        } catch (Exception e) {
            log.error("Error in saveReservation : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<ReservationDTO> filterReservations(String reservationNumber) {
        log.info("Execute method filterReservations()");
        try {
            List<ReservationDTO> responseList = new ArrayList<>();
            List<Reservation> reservationList = reservationRepository.filterReservations(reservationNumber);

            for (Reservation reservation : reservationList) {
                Long custId = reservation.getCustomer() != null ? reservation.getCustomer().getId() : 0L;
                String custName = "";
                if (reservation.getCustomer() != null) {
                    String fn = reservation.getCustomer().getFirstName() != null ? reservation.getCustomer().getFirstName() : "";
                    String ln = reservation.getCustomer().getLastName() != null ? reservation.getCustomer().getLastName() : "";
                    custName = (fn + " " + ln).trim();
                }

                Long roomId = reservation.getRoom() != null ? reservation.getRoom().getId() : 0L;
                String roomNum = reservation.getRoom() != null ? reservation.getRoom().getRoomNumber() : "";
                Long userId = reservation.getUser() != null ? reservation.getUser().getId() : 0L;

                ReservationDTO dto = new ReservationDTO(
                        reservation.getId(),
                        reservation.getReservationNumber(),
                        reservation.getCheckInDate(),
                        reservation.getCheckOutDate(),
                        reservation.getNumberOfGuests() != null ? reservation.getNumberOfGuests() : 1,
                        reservation.getTotalAmount() != null ? reservation.getTotalAmount() : 0.0,
                        reservation.getStatus() != null ? reservation.getStatus().name() : ReservationStatus.CONFIRMED.name(),
                        custId,
                        custName,
                        roomId,
                        roomNum,
                        userId
                );
                responseList.add(dto);
            }

            return responseList;

        } catch (Exception e) {
            log.error("Error in filterReservations : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public ReservationDTO getReservationDetails(long reservationId) {
        log.info("Execute method getReservationDetails()");
        try {
            Optional<Reservation> optionalReservation = reservationRepository.findById(reservationId);
            if (optionalReservation.isEmpty()) {
                throw new RuntimeException("Sorry, related reservation is not found");
            }

            Reservation reservation = optionalReservation.get();
            Long custId = reservation.getCustomer() != null ? reservation.getCustomer().getId() : 0L;
            String custName = "";
            if (reservation.getCustomer() != null) {
                String fn = reservation.getCustomer().getFirstName() != null ? reservation.getCustomer().getFirstName() : "";
                String ln = reservation.getCustomer().getLastName() != null ? reservation.getCustomer().getLastName() : "";
                custName = (fn + " " + ln).trim();
            }

            Long roomId = reservation.getRoom() != null ? reservation.getRoom().getId() : 0L;
            String roomNum = reservation.getRoom() != null ? reservation.getRoom().getRoomNumber() : "";
            Long userId = reservation.getUser() != null ? reservation.getUser().getId() : 0L;

            return new ReservationDTO(
                    reservation.getId(),
                    reservation.getReservationNumber(),
                    reservation.getCheckInDate(),
                    reservation.getCheckOutDate(),
                    reservation.getNumberOfGuests() != null ? reservation.getNumberOfGuests() : 1,
                    reservation.getTotalAmount() != null ? reservation.getTotalAmount() : 0.0,
                    reservation.getStatus() != null ? reservation.getStatus().name() : ReservationStatus.CONFIRMED.name(),
                    custId,
                    custName,
                    roomId,
                    roomNum,
                    userId
            );
        } catch (Exception e) {
            log.error("Error in getReservationDetails : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void updateReservation(Long reservationId, ReservationDTO reservationDTO) {
        log.info("Execute method updateReservation()");
        try {
            Optional<Reservation> optionalReservation = reservationRepository.findById(reservationId);
            if (optionalReservation.isEmpty()) {
                throw new RuntimeException("Sorry, related reservation is not found");
            }

            Reservation reservation = optionalReservation.get();

            if (reservationDTO.getReservationNumber() != null && !reservationDTO.getReservationNumber().isEmpty()) {
                reservation.setReservationNumber(reservationDTO.getReservationNumber());
            }
            if (reservationDTO.getCheckInDate() != null) {
                reservation.setCheckInDate(reservationDTO.getCheckInDate());
            }
            if (reservationDTO.getCheckOutDate() != null) {
                reservation.setCheckOutDate(reservationDTO.getCheckOutDate());
            }
            if (reservationDTO.getNumberOfGuests() > 0) {
                reservation.setNumberOfGuests(reservationDTO.getNumberOfGuests());
            }
            if (reservationDTO.getTotalAmount() > 0) {
                reservation.setTotalAmount(reservationDTO.getTotalAmount());
            }
            if (reservationDTO.getStatus() != null && !reservationDTO.getStatus().isEmpty()) {
                try {
                    reservation.setStatus(ReservationStatus.valueOf(reservationDTO.getStatus().toUpperCase()));
                } catch (Exception ignored) {}
            }
            if (reservationDTO.getCustomerId() > 0) {
                customerRepository.findById(reservationDTO.getCustomerId()).ifPresent(reservation::setCustomer);
            }
            if (reservationDTO.getRoomId() > 0) {
                roomRepository.findById(reservationDTO.getRoomId()).ifPresent(reservation::setRoom);
            }
            if (reservationDTO.getUserId() > 0) {
                userRepository.findById(reservationDTO.getUserId()).ifPresent(reservation::setUser);
            }

            reservationRepository.save(reservation);

        } catch (Exception e) {
            log.error("Error in updateReservation : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void deleteReservation(long reservationId) {
        log.info("Execute method deleteReservation()");
        try {
            if (!reservationRepository.existsById(reservationId)) {
                throw new RuntimeException("Reservation not found with id: " + reservationId);
            }
            reservationRepository.deleteById(reservationId);
        } catch (Exception e) {
            log.error("Error in deleteReservation : " + e.getMessage());
            throw e;
        }
    }
}