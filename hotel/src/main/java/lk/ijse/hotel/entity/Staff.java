package lk.ijse.hotel.entity;

import jakarta.persistence.*;
import lk.ijse.hotel.enums.StaffRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String phone;
    private String email;

    @Enumerated(EnumType.STRING)
    private StaffRole role;

    private Double salary;
}
