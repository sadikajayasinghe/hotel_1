package lk.ijse.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class InvoiceDTO {
    private long invoiceId;
    private long reservationId;
    private String reservationNumber;
    private Long discountId;
    private String discountCode;
    private LocalDateTime issueDate;
    private double subTotal;
    private double discountAmount;
    private double totalAmount;
    private boolean isPaid;

    public InvoiceDTO(long invoiceId, long reservationId, double totalAmount, boolean isPaid) {
        this.invoiceId = invoiceId;
        this.reservationId = reservationId;
        this.totalAmount = totalAmount;
        this.isPaid = isPaid;
    }

    public long getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(long invoiceId) {
        this.invoiceId = invoiceId;
    }

    public long getReservationId() {
        return reservationId;
    }

    public void setReservationId(long reservationId) {
        this.reservationId = reservationId;
    }

    public String getReservationNumber() {
        return reservationNumber;
    }

    public void setReservationNumber(String reservationNumber) {
        this.reservationNumber = reservationNumber;
    }

    public Long getDiscountId() {
        return discountId;
    }

    public void setDiscountId(Long discountId) {
        this.discountId = discountId;
    }

    public String getDiscountCode() {
        return discountCode;
    }

    public void setDiscountCode(String discountCode) {
        this.discountCode = discountCode;
    }

    public LocalDateTime getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDateTime issueDate) {
        this.issueDate = issueDate;
    }

    public double getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(double subTotal) {
        this.subTotal = subTotal;
    }

    public double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(double discountAmount) {
        this.discountAmount = discountAmount;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public boolean isPaid() {
        return isPaid;
    }

    public void setPaid(boolean paid) {
        isPaid = paid;
    }

    @Override
    public String toString() {
        return "InvoiceDTO{" +
                "invoiceId=" + invoiceId +
                ", reservationId=" + reservationId +
                ", reservationNumber='" + reservationNumber + '\'' +
                ", discountId=" + discountId +
                ", discountCode='" + discountCode + '\'' +
                ", issueDate=" + issueDate +
                ", subTotal=" + subTotal +
                ", discountAmount=" + discountAmount +
                ", totalAmount=" + totalAmount +
                ", isPaid=" + isPaid +
                '}';
    }
}