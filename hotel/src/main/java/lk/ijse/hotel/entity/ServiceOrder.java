package lk.ijse.hotel.entity;

import jakarta.persistence.*;
import lk.ijse.hotel.enums.ServiceOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer quantity;
    private Double totalPrice;
    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    private ServiceOrderStatus status;

    @ManyToOne
    private Reservation reservation;

    @ManyToOne
    private Service service;

    @ManyToOne
    private Staff assignedStaff;
}