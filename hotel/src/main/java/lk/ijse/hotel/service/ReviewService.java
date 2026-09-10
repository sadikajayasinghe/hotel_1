package lk.ijse.hotel.service;

import lk.ijse.hotel.dto.ReviewDTO;

import java.util.List;

public interface ReviewService {

    void saveReview(ReviewDTO reviewDTO);

    List<ReviewDTO> filterReviews(Long customerId, Long reservationId);

    ReviewDTO getReviewDetails(long reviewId);

    void updateReview(Long reviewId, ReviewDTO reviewDTO);

    void deleteReview(long reviewId);
}
