package lk.ijse.hotel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime issueDate;
    private Double subTotal;
    private Double discountAmount;
    private Double totalAmount;
    private Boolean isPaid;

    @OneToOne
    private Reservation reservation;

    @ManyToOne
    private Discount discount;
}