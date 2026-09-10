package lk.ijse.hotel.service.impl;

import lk.ijse.hotel.dto.PaymentDTO;
import lk.ijse.hotel.entity.Payment;
import lk.ijse.hotel.entity.Reservation;
import lk.ijse.hotel.enums.PaymentMethod;
import lk.ijse.hotel.enums.PaymentStatus;
import lk.ijse.hotel.repository.PaymentRepository;
import lk.ijse.hotel.repository.ReservationRepository;
import lk.ijse.hotel.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository, ReservationRepository reservationRepository) {
        this.paymentRepository = paymentRepository;
        this.reservationRepository = reservationRepository;
    }

    @Override
    public void savePayment(PaymentDTO paymentDTO) {
        log.info("Execute method savePayment()");
        try {
            Payment payment = new Payment();

            payment.setAmount(paymentDTO.getAmount());

            if (paymentDTO.getPaymentDate() != null) {
                payment.setPaymentDate(paymentDTO.getPaymentDate());
            } else {
                payment.setPaymentDate(LocalDateTime.now());
            }

            if (paymentDTO.getPaymentMethod() != null && !paymentDTO.getPaymentMethod().isEmpty()) {
                try {
                    payment.setPaymentMethod(PaymentMethod.valueOf(paymentDTO.getPaymentMethod().toUpperCase()));
                } catch (Exception ignored) {
                    payment.setPaymentMethod(PaymentMethod.CASH);
                }
            } else {
                payment.setPaymentMethod(PaymentMethod.CASH);
            }

            if (paymentDTO.getPaymentStatus() != null && !paymentDTO.getPaymentStatus().isEmpty()) {
                try {
                    payment.setPaymentStatus(PaymentStatus.valueOf(paymentDTO.getPaymentStatus().toUpperCase()));
                } catch (Exception ignored) {
                    payment.setPaymentStatus(PaymentStatus.COMPLETED);
                }
            } else {
                payment.setPaymentStatus(PaymentStatus.COMPLETED);
            }

            String txn = paymentDTO.getTransactionId();
            if (txn == null || txn.trim().isEmpty()) {
                txn = "TXN-" + System.currentTimeMillis();
            }
            payment.setTransactionId(txn);

            if (paymentDTO.getReservationId() > 0) {
                Optional<Reservation> optionalReservation = reservationRepository.findById(paymentDTO.getReservationId());
                optionalReservation.ifPresent(payment::setReservation);
            }

            paymentRepository.save(payment);

        } catch (Exception e) {
            log.error("Error in savePayment : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<PaymentDTO> filterPayments(Long reservationId) {
        log.info("Execute method filterPayments()");
        try {
            List<PaymentDTO> responseList = new ArrayList<>();
            List<Payment> paymentList = paymentRepository.filterPayments(reservationId);

            for (Payment payment : paymentList) {
                Long resId = payment.getReservation() != null ? payment.getReservation().getId() : 0L;
                String resNum = payment.getReservation() != null ? payment.getReservation().getReservationNumber() : "";

                PaymentDTO dto = new PaymentDTO(
                        payment.getId(),
                        resId,
                        resNum,
                        payment.getAmount() != null ? payment.getAmount() : 0.0,
                        payment.getPaymentDate(),
                        payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : PaymentMethod.CASH.name(),
                        payment.getPaymentStatus() != null ? payment.getPaymentStatus().name() : PaymentStatus.COMPLETED.name(),
                        payment.getTransactionId()
                );
                responseList.add(dto);
            }

            return responseList;

        } catch (Exception e) {
            log.error("Error in filterPayments : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public PaymentDTO getPaymentDetails(long paymentId) {
        log.info("Execute method getPaymentDetails()");
        try {
            Optional<Payment> optionalPayment = paymentRepository.findById(paymentId);
            if (optionalPayment.isEmpty()) {
                throw new RuntimeException("Sorry, related payment is not found");
            }

            Payment payment = optionalPayment.get();
            Long resId = payment.getReservation() != null ? payment.getReservation().getId() : 0L;
            String resNum = payment.getReservation() != null ? payment.getReservation().getReservationNumber() : "";

            return new PaymentDTO(
                    payment.getId(),
                    resId,
                    resNum,
                    payment.getAmount() != null ? payment.getAmount() : 0.0,
                    payment.getPaymentDate(),
                    payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : PaymentMethod.CASH.name(),
                    payment.getPaymentStatus() != null ? payment.getPaymentStatus().name() : PaymentStatus.COMPLETED.name(),
                    payment.getTransactionId()
            );
        } catch (Exception e) {
            log.error("Error in getPaymentDetails : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void updatePayment(Long paymentId, PaymentDTO paymentDTO) {
        log.info("Execute method updatePayment()");
        try {
            Optional<Payment> optionalPayment = paymentRepository.findById(paymentId);
            if (optionalPayment.isEmpty()) {
                throw new RuntimeException("Sorry, related payment is not found");
            }

            Payment payment = optionalPayment.get();

            if (paymentDTO.getAmount() > 0) {
                payment.setAmount(paymentDTO.getAmount());
            }
            if (paymentDTO.getPaymentMethod() != null && !paymentDTO.getPaymentMethod().isEmpty()) {
                try {
                    payment.setPaymentMethod(PaymentMethod.valueOf(paymentDTO.getPaymentMethod().toUpperCase()));
                } catch (Exception ignored) {}
            }
            if (paymentDTO.getPaymentStatus() != null && !paymentDTO.getPaymentStatus().isEmpty()) {
                try {
                    payment.setPaymentStatus(PaymentStatus.valueOf(paymentDTO.getPaymentStatus().toUpperCase()));
                } catch (Exception ignored) {}
            }
            if (paymentDTO.getTransactionId() != null && !paymentDTO.getTransactionId().isEmpty()) {
                payment.setTransactionId(paymentDTO.getTransactionId());
            }
            if (paymentDTO.getReservationId() > 0) {
                reservationRepository.findById(paymentDTO.getReservationId()).ifPresent(payment::setReservation);
            }

            paymentRepository.save(payment);

        } catch (Exception e) {
            log.error("Error in updatePayment : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void deletePayment(long paymentId) {
        log.info("Execute method deletePayment()");
        try {
            if (!paymentRepository.existsById(paymentId)) {
                throw new RuntimeException("Payment not found with id: " + paymentId);
            }
            paymentRepository.deleteById(paymentId);
        } catch (Exception e) {
            log.error("Error in deletePayment : " + e.getMessage());
            throw e;
        }
    }
}