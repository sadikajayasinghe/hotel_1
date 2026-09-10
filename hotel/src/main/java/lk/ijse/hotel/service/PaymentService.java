package lk.ijse.hotel.service;

import lk.ijse.hotel.dto.PaymentDTO;

import java.util.List;

public interface PaymentService {

    void savePayment(PaymentDTO paymentDTO);

    List<PaymentDTO> filterPayments(Long reservationId);

    PaymentDTO getPaymentDetails(long paymentId);

    void updatePayment(Long paymentId, PaymentDTO paymentDTO);

    void deletePayment(long paymentId);
}