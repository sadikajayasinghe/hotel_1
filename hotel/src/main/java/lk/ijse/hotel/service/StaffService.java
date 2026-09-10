package lk.ijse.hotel.service;

import lk.ijse.hotel.dto.StaffDTO;

import java.util.List;

public interface StaffService {

    void saveStaff(StaffDTO staffDTO);

    List<StaffDTO> filterStaff(String role);

    StaffDTO getStaffDetails(long staffId);

    void updateStaff(Long staffId, StaffDTO staffDTO);

    void deleteStaff(long staffId);
}
