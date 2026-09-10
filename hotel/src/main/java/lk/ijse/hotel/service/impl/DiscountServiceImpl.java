package lk.ijse.hotel.service.impl;

import lk.ijse.hotel.dto.DiscountDTO;
import lk.ijse.hotel.entity.Discount;
import lk.ijse.hotel.repository.DiscountRepository;
import lk.ijse.hotel.service.DiscountService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class DiscountServiceImpl implements DiscountService {

    private final DiscountRepository discountRepository;

    public DiscountServiceImpl(DiscountRepository discountRepository) {
        this.discountRepository = discountRepository;
    }

    @Override
    public void saveDiscount(DiscountDTO discountDTO) {
        log.info("Execute method saveDiscount()");
        try {
            Discount discount = new Discount();
            discount.setCode(discountDTO.getCode());
            discount.setDescription(discountDTO.getDescription());
            discount.setDiscountPercentage(discountDTO.getDiscountPercentage());
            discount.setStartDate(discountDTO.getStartDate());
            discount.setEndDate(discountDTO.getEndDate());
            discount.setIsActive(discountDTO.isActive());

            discountRepository.save(discount);
        } catch (Exception e) {
            log.error("Error in saveDiscount : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<DiscountDTO> filterDiscounts(String code) {
        log.info("Execute method filterDiscounts()");
        try {
            List<DiscountDTO> responseList = new ArrayList<>();
            List<Discount> discountList = discountRepository.filterDiscounts(code);

            for (Discount discount : discountList) {
                DiscountDTO dto = new DiscountDTO(
                        discount.getId(),
                        discount.getCode(),
                        discount.getDescription(),
                        discount.getDiscountPercentage() != null ? discount.getDiscountPercentage() : 0.0,
                        discount.getStartDate(),
                        discount.getEndDate(),
                        discount.getIsActive() != null ? discount.getIsActive() : true
                );
                responseList.add(dto);
            }

            return responseList;
        } catch (Exception e) {
            log.error("Error in filterDiscounts : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public DiscountDTO getDiscountDetails(long discountId) {
        log.info("Execute method getDiscountDetails()");
        try {
            Optional<Discount> optionalDiscount = discountRepository.findById(discountId);
            if (optionalDiscount.isEmpty()) {
                throw new RuntimeException("Sorry, related discount is not found");
            }

            Discount discount = optionalDiscount.get();
            return new DiscountDTO(
                    discount.getId(),
                    discount.getCode(),
                    discount.getDescription(),
                    discount.getDiscountPercentage() != null ? discount.getDiscountPercentage() : 0.0,
                    discount.getStartDate(),
                    discount.getEndDate(),
                    discount.getIsActive() != null ? discount.getIsActive() : true
            );
        } catch (Exception e) {
            log.error("Error in getDiscountDetails : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void updateDiscount(Long discountId, DiscountDTO discountDTO) {
        log.info("Execute method updateDiscount()");
        try {
            Optional<Discount> optionalDiscount = discountRepository.findById(discountId);
            if (optionalDiscount.isEmpty()) {
                throw new RuntimeException("Sorry, related discount is not found");
            }

            Discount discount = optionalDiscount.get();

            if (discountDTO.getCode() != null) {
                discount.setCode(discountDTO.getCode());
            }
            if (discountDTO.getDescription() != null) {
                discount.setDescription(discountDTO.getDescription());
            }
            if (discountDTO.getDiscountPercentage() > 0) {
                discount.setDiscountPercentage(discountDTO.getDiscountPercentage());
            }
            if (discountDTO.getStartDate() != null) {
                discount.setStartDate(discountDTO.getStartDate());
            }
            if (discountDTO.getEndDate() != null) {
                discount.setEndDate(discountDTO.getEndDate());
            }
            discount.setIsActive(discountDTO.isActive());

            discountRepository.save(discount);
        } catch (Exception e) {
            log.error("Error in updateDiscount : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void deleteDiscount(long discountId) {
        log.info("Execute method deleteDiscount()");
        try {
            if (!discountRepository.existsById(discountId)) {
                throw new RuntimeException("Discount not found with id: " + discountId);
            }
            discountRepository.deleteById(discountId);
        } catch (Exception e) {
            log.error("Error in deleteDiscount : " + e.getMessage());
            throw e;
        }
    }
}