package lk.ijse.hotel.service.impl;

import lk.ijse.hotel.dto.UserDTO;
import lk.ijse.hotel.entity.User;
import lk.ijse.hotel.enums.UserStatus;
import lk.ijse.hotel.repository.UserRepository;
import lk.ijse.hotel.service.UserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserDTO getUserDetails(String username, String password) {
        log.info("Execute method getUserDetails()");
        Optional<User> optionalUser = userRepository.findByUserNameAndPassword(username,password);
        if(optionalUser.isEmpty()){
            throw new RuntimeException("Sorry no user");
        }

        User user = optionalUser.get();
        if(user.getUserStatus().equals(UserStatus.INACTIVE)){
            throw new RuntimeException("Invalid User");
        }
        return new UserDTO(
                user.getId() != null ? user.getId() : 0L,
                user.getUsername(),
                user.getPassword(),
                user.getRole() != null ? user.getRole().name() : null,
                user.getUserStatus()
        );
    }

    @Override
    public void saveUser(UserDTO userDTO) {
        log.info("Execute method saveUser()");
        try{
            User user = new User();
            user.setUsername(userDTO.getUserName());
            if (userDTO.getUserRoles() != null && !userDTO.getUserRoles().trim().isEmpty()) {
                try {
                    user.setRole(lk.ijse.hotel.enums.UserRole.valueOf(userDTO.getUserRoles().trim().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    user.setRole(lk.ijse.hotel.enums.UserRole.RECEPTIONIST);
                }
            } else {
                user.setRole(lk.ijse.hotel.enums.UserRole.RECEPTIONIST);
            }
            user.setPassword(userDTO.getPassword());
            user.setUserStatus(userDTO.getUserStatus() != null ? userDTO.getUserStatus() : UserStatus.ACTIVE);

            userRepository.save(user);
        } catch (Exception e) {
            log.error("Error in method saveUser");
            throw new RuntimeException(e);
        }
    }

    @Override
    public UserDTO getUserById(long userId) {
        log.info("Execute method getUserById()");
        Optional<User> optionalUser = userRepository.findById(userId);
        if(optionalUser.isEmpty()){
            throw new RuntimeException("Sorry user Not found!");
        }
        User user = optionalUser.get();
        return new UserDTO(
                user.getId() != null ? user.getId() : 0L,
                user.getUsername(),
                null,
                user.getRole() != null ? user.getRole().name() : null,
                user.getUserStatus()
        );
    }

    @Override
    public void updateUser(long userId, UserDTO userDTO) {
        log.info("Execute method updateUser()");
        try{
            Optional<User> optionalUser = userRepository.findById(userId);
            if(optionalUser.isEmpty()){
                throw new RuntimeException("Sorry user Not found!");
            }
            User user = optionalUser.get();

            if(userDTO.getUserName() != null && !userDTO.getUserName().trim().isEmpty()){
                Optional<User> existing = userRepository.findByUsername(userDTO.getUserName().trim());
                if(existing.isPresent() && existing.get().getId() != userId){
                    throw new RuntimeException("Username already taken");
                }
                user.setUsername(userDTO.getUserName().trim());
            }
            if(userDTO.getPassword() != null && !userDTO.getPassword().trim().isEmpty()){
                user.setPassword(userDTO.getPassword());
            }
            if(userDTO.getUserRoles() != null && !userDTO.getUserRoles().trim().isEmpty()){
                try {
                    user.setRole(lk.ijse.hotel.enums.UserRole.valueOf(userDTO.getUserRoles().trim().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    user.setRole(lk.ijse.hotel.enums.UserRole.RECEPTIONIST);
                }
            }
            if(userDTO.getUserStatus() != null){
                user.setUserStatus(userDTO.getUserStatus());
            }

            userRepository.save(user);
        } catch (RuntimeException e) {
            log.error("Error in method updateUser()");
            throw e;
        } catch (Exception e) {
            log.error("Error in method updateUser()");
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<UserDTO> getAllUsers() {
        log.info("Execute method getAllUsers()");
        try{
            List<User> users = userRepository.findAll();
            List<UserDTO> dtos = new ArrayList<>();
            for(User u : users){
                UserDTO userDTO = new UserDTO();
                userDTO.setUserId(u.getId() != null ? u.getId() : 0L);
                userDTO.setUserName(u.getUsername());
                userDTO.setUserRoles(u.getRole() != null ? u.getRole().name() : null);
                userDTO.setUserStatus(u.getUserStatus());
                dtos.add(userDTO);
            }
            return dtos;
        } catch (Exception e) {
            log.error("Error in method getAllUsers");
            throw new RuntimeException(e);
        }
    }

    @Override
    public void deleteUser(long userId) {
        log.info("Execute method deleteUser()");
        try{
            Optional<User> optionalUser = userRepository.findById(userId);
            if(optionalUser.isEmpty()){
                throw new RuntimeException("Sorry user Not found!");
            }
            User user = optionalUser.get();
            user.setUserStatus(UserStatus.INACTIVE);
            userRepository.save(user);
        }
        catch (Exception e)   {
            log.error("Error in method deleteUser()");
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<UserDTO> filterUser(String userName, String userRole) {
        log.info("Execute method filterUsers()");

        try{
            List<UserDTO> userList = userRepository.filterUsers(userName, userRole);
            return userList;
        }
        catch (Exception e) {
            log.error("Error in method filterUsers()");
            throw new RuntimeException(e);
        }
    }
}

