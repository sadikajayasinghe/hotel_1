package lk.ijse.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReviewDTO {
    private long id;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private Long customerId;
    private String customerName;
    private Long reservationId;
    private String reservationNumber;

    public ReviewDTO(long id, Integer rating, String comment, LocalDateTime createdAt, Long customerId, Long reservationId) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.customerId = customerId;
        this.reservationId = reservationId;
    }
}
