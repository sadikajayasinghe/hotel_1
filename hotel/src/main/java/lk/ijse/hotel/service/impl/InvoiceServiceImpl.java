package lk.ijse.hotel.service.impl;

import lk.ijse.hotel.dto.InvoiceDTO;
import lk.ijse.hotel.entity.Discount;
import lk.ijse.hotel.entity.Invoice;
import lk.ijse.hotel.entity.Reservation;
import lk.ijse.hotel.repository.DiscountRepository;
import lk.ijse.hotel.repository.InvoiceRepository;
import lk.ijse.hotel.repository.ReservationRepository;
import lk.ijse.hotel.service.InvoiceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ReservationRepository reservationRepository;
    private final DiscountRepository discountRepository;

    public InvoiceServiceImpl(
            InvoiceRepository invoiceRepository,
            ReservationRepository reservationRepository,
            DiscountRepository discountRepository) {
        this.invoiceRepository = invoiceRepository;
        this.reservationRepository = reservationRepository;
        this.discountRepository = discountRepository;
    }

    @Override
    public void saveInvoice(InvoiceDTO invoiceDTO) {
        log.info("Execute method saveInvoice()");
        try {
            Invoice invoice = new Invoice();

            if (invoiceDTO.getIssueDate() != null) {
                invoice.setIssueDate(invoiceDTO.getIssueDate());
            } else {
                invoice.setIssueDate(LocalDateTime.now());
            }

            invoice.setIsPaid(invoiceDTO.isPaid());

            double subTotal = invoiceDTO.getSubTotal();
            if (invoiceDTO.getReservationId() > 0) {
                Optional<Reservation> optionalReservation = reservationRepository.findById(invoiceDTO.getReservationId());
                if (optionalReservation.isPresent()) {
                    Reservation reservation = optionalReservation.get();
                    invoice.setReservation(reservation);
                    if (subTotal <= 0 && reservation.getTotalAmount() != null) {
                        subTotal = reservation.getTotalAmount();
                    }
                }
            }
            invoice.setSubTotal(subTotal);

            double discountAmount = invoiceDTO.getDiscountAmount();
            if (invoiceDTO.getDiscountId() != null && invoiceDTO.getDiscountId() > 0) {
                Optional<Discount> optionalDiscount = discountRepository.findById(invoiceDTO.getDiscountId());
                if (optionalDiscount.isPresent()) {
                    Discount discount = optionalDiscount.get();
                    invoice.setDiscount(discount);
                    if (discountAmount <= 0 && discount.getDiscountPercentage() != null) {
                        discountAmount = (subTotal * discount.getDiscountPercentage()) / 100.0;
                    }
                }
            } else if (invoiceDTO.getDiscountCode() != null && !invoiceDTO.getDiscountCode().isEmpty()) {
                Optional<Discount> optionalDiscount = discountRepository.findByCode(invoiceDTO.getDiscountCode());
                if (optionalDiscount.isPresent()) {
                    Discount discount = optionalDiscount.get();
                    invoice.setDiscount(discount);
                    if (discountAmount <= 0 && discount.getDiscountPercentage() != null) {
                        discountAmount = (subTotal * discount.getDiscountPercentage()) / 100.0;
                    }
                }
            }
            invoice.setDiscountAmount(discountAmount);

            double totalAmount = invoiceDTO.getTotalAmount();
            if (totalAmount <= 0) {
                totalAmount = Math.max(0.0, subTotal - discountAmount);
            }
            invoice.setTotalAmount(totalAmount);

            invoiceRepository.save(invoice);

        } catch (Exception e) {
            log.error("Error in saveInvoice : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<InvoiceDTO> filterInvoices(Long reservationId) {
        log.info("Execute method filterInvoices()");
        try {
            List<InvoiceDTO> responseList = new ArrayList<>();
            List<Invoice> invoiceList = invoiceRepository.filterInvoices(reservationId);

            for (Invoice invoice : invoiceList) {
                Long resId = invoice.getReservation() != null ? invoice.getReservation().getId() : 0L;
                String resNum = invoice.getReservation() != null ? invoice.getReservation().getReservationNumber() : "";
                Long discId = invoice.getDiscount() != null ? invoice.getDiscount().getId() : null;
                String discCode = invoice.getDiscount() != null ? invoice.getDiscount().getCode() : "";

                InvoiceDTO dto = new InvoiceDTO(
                        invoice.getId(),
                        resId,
                        resNum,
                        discId,
                        discCode,
                        invoice.getIssueDate(),
                        invoice.getSubTotal() != null ? invoice.getSubTotal() : 0.0,
                        invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : 0.0,
                        invoice.getTotalAmount() != null ? invoice.getTotalAmount() : 0.0,
                        invoice.getIsPaid() != null ? invoice.getIsPaid() : false
                );
                responseList.add(dto);
            }

            return responseList;

        } catch (Exception e) {
            log.error("Error in filterInvoices : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public InvoiceDTO getInvoiceDetails(long invoiceId) {
        log.info("Execute method getInvoiceDetails()");
        try {
            Optional<Invoice> optionalInvoice = invoiceRepository.findById(invoiceId);
            if (optionalInvoice.isEmpty()) {
                throw new RuntimeException("Sorry, related invoice is not found");
            }

            Invoice invoice = optionalInvoice.get();
            Long resId = invoice.getReservation() != null ? invoice.getReservation().getId() : 0L;
            String resNum = invoice.getReservation() != null ? invoice.getReservation().getReservationNumber() : "";
            Long discId = invoice.getDiscount() != null ? invoice.getDiscount().getId() : null;
            String discCode = invoice.getDiscount() != null ? invoice.getDiscount().getCode() : "";

            return new InvoiceDTO(
                    invoice.getId(),
                    resId,
                    resNum,
                    discId,
                    discCode,
                    invoice.getIssueDate(),
                    invoice.getSubTotal() != null ? invoice.getSubTotal() : 0.0,
                    invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : 0.0,
                    invoice.getTotalAmount() != null ? invoice.getTotalAmount() : 0.0,
                    invoice.getIsPaid() != null ? invoice.getIsPaid() : false
            );
        } catch (Exception e) {
            log.error("Error in getInvoiceDetails : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void updateInvoice(Long invoiceId, InvoiceDTO invoiceDTO) {
        log.info("Execute method updateInvoice()");
        try {
            Optional<Invoice> optionalInvoice = invoiceRepository.findById(invoiceId);
            if (optionalInvoice.isEmpty()) {
                throw new RuntimeException("Sorry, related invoice is not found");
            }

            Invoice invoice = optionalInvoice.get();

            if (invoiceDTO.getSubTotal() > 0) {
                invoice.setSubTotal(invoiceDTO.getSubTotal());
            }
            if (invoiceDTO.getDiscountAmount() >= 0) {
                invoice.setDiscountAmount(invoiceDTO.getDiscountAmount());
            }
            if (invoiceDTO.getTotalAmount() > 0) {
                invoice.setTotalAmount(invoiceDTO.getTotalAmount());
            }
            invoice.setIsPaid(invoiceDTO.isPaid());

            if (invoiceDTO.getReservationId() > 0) {
                reservationRepository.findById(invoiceDTO.getReservationId()).ifPresent(invoice::setReservation);
            }
            if (invoiceDTO.getDiscountId() != null && invoiceDTO.getDiscountId() > 0) {
                discountRepository.findById(invoiceDTO.getDiscountId()).ifPresent(invoice::setDiscount);
            }

            invoiceRepository.save(invoice);

        } catch (Exception e) {
            log.error("Error in updateInvoice : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void deleteInvoice(long invoiceId) {
        log.info("Execute method deleteInvoice()");
        try {
            if (!invoiceRepository.existsById(invoiceId)) {
                throw new RuntimeException("Invoice not found with id: " + invoiceId);
            }
            invoiceRepository.deleteById(invoiceId);
        } catch (Exception e) {
            log.error("Error in deleteInvoice : " + e.getMessage());
            throw e;
        }
    }
}