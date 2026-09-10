package lk.ijse.hotel.service;

import lk.ijse.hotel.dto.DiscountDTO;

import java.util.List;

public interface DiscountService {

    void saveDiscount(DiscountDTO discountDTO);

    List<DiscountDTO> filterDiscounts(String code);

    DiscountDTO getDiscountDetails(long discountId);

    void updateDiscount(Long discountId, DiscountDTO discountDTO);

    void deleteDiscount(long discountId);
}