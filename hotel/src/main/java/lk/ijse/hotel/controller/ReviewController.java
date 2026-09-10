package lk.ijse.hotel.controller;

import lk.ijse.hotel.dto.CommonResponse;
import lk.ijse.hotel.dto.ReviewDTO;
import lk.ijse.hotel.service.ReviewService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.hotel.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.hotel.constant.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping(value = "v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveReview(@RequestBody ReviewDTO reviewDTO) {
        reviewService.saveReview(reviewDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse filterReviews(
            @RequestParam(value = "customerId", required = false) Long customerId,
            @RequestParam(value = "reservationId", required = false) Long reservationId
    ) {
        List<ReviewDTO> reviewDTOS = reviewService.filterReviews(customerId, reservationId);
        return new CommonResponse(OPERATION_SUCCESS, reviewDTOS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/{reviewId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getReviewDetails(@PathVariable long reviewId) {
        ReviewDTO reviewDetails = reviewService.getReviewDetails(reviewId);
        return new CommonResponse(OPERATION_SUCCESS, reviewDetails, SUCCESS_MESSAGE);
    }

    @PutMapping(value = "/{reviewId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateReview(@PathVariable long reviewId, @RequestBody ReviewDTO reviewDTO) {
        reviewService.updateReview(reviewId, reviewDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{reviewId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteReview(@PathVariable long reviewId) {
        reviewService.deleteReview(reviewId);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }
}
