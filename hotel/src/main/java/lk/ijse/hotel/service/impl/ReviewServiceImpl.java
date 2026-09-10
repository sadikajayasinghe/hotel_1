package lk.ijse.hotel.service.impl;

import lk.ijse.hotel.dto.ReviewDTO;
import lk.ijse.hotel.entity.Customer;
import lk.ijse.hotel.entity.Reservation;
import lk.ijse.hotel.entity.Review;
import lk.ijse.hotel.repository.CustomerRepository;
import lk.ijse.hotel.repository.ReservationRepository;
import lk.ijse.hotel.repository.ReviewRepository;
import lk.ijse.hotel.service.ReviewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final CustomerRepository customerRepository;
    private final ReservationRepository reservationRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             CustomerRepository customerRepository,
                             ReservationRepository reservationRepository) {
        this.reviewRepository = reviewRepository;
        this.customerRepository = customerRepository;
        this.reservationRepository = reservationRepository;
    }

    @Override
    public void saveReview(ReviewDTO reviewDTO) {
        log.info("Execute method saveReview()");
        try {
            Review review = new Review();
            review.setRating(reviewDTO.getRating());
            review.setComment(reviewDTO.getComment());
            review.setCreatedAt(reviewDTO.getCreatedAt() != null ? reviewDTO.getCreatedAt() : LocalDateTime.now());

            if (reviewDTO.getCustomerId() != null) {
                Customer customer = customerRepository.findById(reviewDTO.getCustomerId())
                        .orElseThrow(() -> new RuntimeException("Customer not found with id: " + reviewDTO.getCustomerId()));
                review.setCustomer(customer);
            }

            if (reviewDTO.getReservationId() != null) {
                Reservation reservation = reservationRepository.findById(reviewDTO.getReservationId())
                        .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reviewDTO.getReservationId()));
                review.setReservation(reservation);
            }

            reviewRepository.save(review);

        } catch (Exception e) {
            log.error("Error in saveReview : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<ReviewDTO> filterReviews(Long customerId, Long reservationId) {
        log.info("Execute method filterReviews()");
        try {
            List<Review> reviewList;

            if (customerId != null) {
                reviewList = reviewRepository.findByCustomerId(customerId);
            } else if (reservationId != null) {
                reviewList = reviewRepository.findByReservationId(reservationId);
            } else {
                reviewList = reviewRepository.findAll();
            }

            List<ReviewDTO> responseList = new ArrayList<>();
            for (Review review : reviewList) {
                ReviewDTO dto = toDTO(review);
                responseList.add(dto);
            }

            return responseList;

        } catch (Exception e) {
            log.error("Error in filterReviews : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public ReviewDTO getReviewDetails(long reviewId) {
        log.info("Execute method getReviewDetails()");
        try {
            Optional<Review> optionalReview = reviewRepository.findById(reviewId);
            if (optionalReview.isEmpty()) {
                throw new RuntimeException("Sorry, related review is not found");
            }

            return toDTO(optionalReview.get());

        } catch (Exception e) {
            log.error("Error in getReviewDetails : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void updateReview(Long reviewId, ReviewDTO reviewDTO) {
        log.info("Execute method updateReview()");
        try {
            Optional<Review> optionalReview = reviewRepository.findById(reviewId);
            if (optionalReview.isEmpty()) {
                throw new RuntimeException("Sorry, related review is not found");
            }

            Review review = optionalReview.get();
            if (reviewDTO.getRating() != null) {
                review.setRating(reviewDTO.getRating());
            }
            if (reviewDTO.getComment() != null) {
                review.setComment(reviewDTO.getComment());
            }

            if (reviewDTO.getCustomerId() != null) {
                Customer customer = customerRepository.findById(reviewDTO.getCustomerId())
                        .orElseThrow(() -> new RuntimeException("Customer not found with id: " + reviewDTO.getCustomerId()));
                review.setCustomer(customer);
            }

            if (reviewDTO.getReservationId() != null) {
                Reservation reservation = reservationRepository.findById(reviewDTO.getReservationId())
                        .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reviewDTO.getReservationId()));
                review.setReservation(reservation);
            }

            reviewRepository.save(review);

        } catch (Exception e) {
            log.error("Error in updateReview : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void deleteReview(long reviewId) {
        log.info("Execute method deleteReview()");
        try {
            if (!reviewRepository.existsById(reviewId)) {
                throw new RuntimeException("Review not found with id: " + reviewId);
            }
            reviewRepository.deleteById(reviewId);
        } catch (Exception e) {
            log.error("Error in deleteReview : " + e.getMessage());
            throw e;
        }
    }

    private ReviewDTO toDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());

        if (review.getCustomer() != null) {
            dto.setCustomerId(review.getCustomer().getId());
            String fn = review.getCustomer().getFirstName() != null ? review.getCustomer().getFirstName() : "";
            String ln = review.getCustomer().getLastName() != null ? review.getCustomer().getLastName() : "";
            dto.setCustomerName((fn + " " + ln).trim());
        }

        if (review.getReservation() != null) {
            dto.setReservationId(review.getReservation().getId());
            dto.setReservationNumber(review.getReservation().getReservationNumber());
        }

        return dto;
    }
}
