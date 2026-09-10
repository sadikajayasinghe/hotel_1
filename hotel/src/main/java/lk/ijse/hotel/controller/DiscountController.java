package lk.ijse.hotel.controller;

import lk.ijse.hotel.dto.CommonResponse;
import lk.ijse.hotel.dto.DiscountDTO;
import lk.ijse.hotel.service.DiscountService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.hotel.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.hotel.constant.ResponseMessage.SUCCESS_MESSAGE;

@RestController
@RequestMapping(value = "v1/discounts")
public class DiscountController {

    private final DiscountService discountService;

    public DiscountController(DiscountService discountService) {
        this.discountService = discountService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveDiscount(@RequestBody DiscountDTO discountDTO) {
        discountService.saveDiscount(discountDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse filterDiscounts(
            @RequestParam(value = "code", required = false) String code
    ) {
        List<DiscountDTO> discountDTOS = discountService.filterDiscounts(code);
        return new CommonResponse(OPERATION_SUCCESS, discountDTOS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/{discountId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getDiscountDetails(@PathVariable long discountId) {
        DiscountDTO discountDetails = discountService.getDiscountDetails(discountId);
        return new CommonResponse(OPERATION_SUCCESS, discountDetails, SUCCESS_MESSAGE);
    }

    @PutMapping(value = "/{discountId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateDiscount(@PathVariable long discountId, @RequestBody DiscountDTO discountDTO) {
        discountService.updateDiscount(discountId, discountDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{discountId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteDiscount(@PathVariable long discountId) {
        discountService.deleteDiscount(discountId);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }
}