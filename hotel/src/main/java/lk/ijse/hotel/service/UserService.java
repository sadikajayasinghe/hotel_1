package lk.ijse.hotel.service;

import lk.ijse.hotel.dto.UserDTO;

import java.util.List;

public interface UserService {

    UserDTO getUserDetails(String username, String password);

    void saveUser(UserDTO userDTO);

    UserDTO getUserById(long userId);

    void updateUser(long userId, UserDTO userDTO);

    List<UserDTO> getAllUsers();

    void deleteUser(long userId);

    List<UserDTO> filterUser(String userName, String userRole);

}

