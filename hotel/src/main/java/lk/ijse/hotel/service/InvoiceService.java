package lk.ijse.hotel.service;

import lk.ijse.hotel.dto.InvoiceDTO;

import java.util.List;

public interface InvoiceService {

    void saveInvoice(InvoiceDTO invoiceDTO);

    List<InvoiceDTO> filterInvoices(Long reservationId);

    InvoiceDTO getInvoiceDetails(long invoiceId);

    void updateInvoice(Long invoiceId, InvoiceDTO invoiceDTO);

    void deleteInvoice(long invoiceId);
}