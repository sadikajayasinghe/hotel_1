package lk.ijse.hotel.entity;

import jakarta.persistence.*;
import lk.ijse.hotel.enums.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomNumber;
    
    private Integer floor;

    private Double price;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    @ManyToOne
    private RoomType roomType;
}