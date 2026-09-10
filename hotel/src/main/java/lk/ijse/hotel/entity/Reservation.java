package lk.ijse.hotel.entity;

import jakarta.persistence.*;
import lk.ijse.hotel.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String reservationNumber;

    private LocalDate checkInDate;

    private LocalDate checkOutDate;

    private Integer numberOfGuests;

    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;

    @ManyToOne
    private Customer customer;

    @ManyToOne
    private Room room;

    @ManyToOne
    private User user;
}