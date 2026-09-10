package lk.ijse.hotel.service.impl;

import lk.ijse.hotel.dto.StaffDTO;
import lk.ijse.hotel.entity.Staff;
import lk.ijse.hotel.enums.StaffRole;
import lk.ijse.hotel.repository.StaffRepository;
import lk.ijse.hotel.service.StaffService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;

    public StaffServiceImpl(StaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    @Override
    public void saveStaff(StaffDTO staffDTO) {
        log.info("Execute method saveStaff()");
        try {
            Staff staff = new Staff();
            staff.setFullName(staffDTO.getFullName());
            staff.setPhone(staffDTO.getPhone());
            staff.setEmail(staffDTO.getEmail());

            if (staffDTO.getRole() != null && !staffDTO.getRole().trim().isEmpty()) {
                try {
                    staff.setRole(StaffRole.valueOf(staffDTO.getRole().trim().toUpperCase()));
                } catch (Exception ignored) {
                    staff.setRole(StaffRole.HOUSEKEEPER);
                }
            } else {
                staff.setRole(StaffRole.HOUSEKEEPER);
            }

            staff.setSalary(staffDTO.getSalary());

            staffRepository.save(staff);

        } catch (Exception e) {
            log.error("Error in saveStaff : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<StaffDTO> filterStaff(String role) {
        log.info("Execute method filterStaff()");
        try {
            List<Staff> staffList;
            if (role != null && !role.trim().isEmpty()) {
                try {
                    StaffRole staffRole = StaffRole.valueOf(role.trim().toUpperCase());
                    staffList = staffRepository.findByRole(staffRole);
                } catch (Exception ignored) {
                    staffList = staffRepository.findAll();
                }
            } else {
                staffList = staffRepository.findAll();
            }

            List<StaffDTO> responseList = new ArrayList<>();
            for (Staff staff : staffList) {
                StaffDTO dto = new StaffDTO(
                        staff.getId(),
                        staff.getFullName(),
                        staff.getPhone(),
                        staff.getEmail(),
                        staff.getRole() != null ? staff.getRole().name() : null,
                        staff.getSalary()
                );
                responseList.add(dto);
            }

            return responseList;

        } catch (Exception e) {
            log.error("Error in filterStaff : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public StaffDTO getStaffDetails(long staffId) {
        log.info("Execute method getStaffDetails()");
        try {
            Optional<Staff> optionalStaff = staffRepository.findById(staffId);
            if (optionalStaff.isEmpty()) {
                throw new RuntimeException("Sorry, related staff is not found");
            }

            Staff staff = optionalStaff.get();
            return new StaffDTO(
                    staff.getId(),
                    staff.getFullName(),
                    staff.getPhone(),
                    staff.getEmail(),
                    staff.getRole() != null ? staff.getRole().name() : null,
                    staff.getSalary()
            );

        } catch (Exception e) {
            log.error("Error in getStaffDetails : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void updateStaff(Long staffId, StaffDTO staffDTO) {
        log.info("Execute method updateStaff()");
        try {
            Optional<Staff> optionalStaff = staffRepository.findById(staffId);
            if (optionalStaff.isEmpty()) {
                throw new RuntimeException("Sorry, related staff is not found");
            }

            Staff staff = optionalStaff.get();
            if (staffDTO.getFullName() != null) {
                staff.setFullName(staffDTO.getFullName());
            }
            if (staffDTO.getPhone() != null) {
                staff.setPhone(staffDTO.getPhone());
            }
            if (staffDTO.getEmail() != null) {
                staff.setEmail(staffDTO.getEmail());
            }
            if (staffDTO.getRole() != null && !staffDTO.getRole().trim().isEmpty()) {
                try {
                    staff.setRole(StaffRole.valueOf(staffDTO.getRole().trim().toUpperCase()));
                } catch (Exception ignored) {}
            }
            if (staffDTO.getSalary() != null) {
                staff.setSalary(staffDTO.getSalary());
            }

            staffRepository.save(staff);

        } catch (Exception e) {
            log.error("Error in updateStaff : " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void deleteStaff(long staffId) {
        log.info("Execute method deleteStaff()");
        try {
            if (!staffRepository.existsById(staffId)) {
                throw new RuntimeException("Staff not found with id: " + staffId);
            }
            staffRepository.deleteById(staffId);
        } catch (Exception e) {
            log.error("Error in deleteStaff : " + e.getMessage());
            throw e;
        }
    }
}
