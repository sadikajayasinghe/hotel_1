package lk.ijse.hotel.controller;

import lk.ijse.hotel.security.JwtUtil;
import lk.ijse.hotel.dto.AuthDTO;
import lk.ijse.hotel.dto.CommonResponse;
import lk.ijse.hotel.dto.UserDTO;
import lk.ijse.hotel.dto.UserDetailDto;
import lk.ijse.hotel.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = {"v1/users", "v1/test"})
@AllArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @GetMapping(value = "/testing")
    public String testSecurity(){
        return "API Security Successful";
    }

    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse authLogin(@RequestBody AuthDTO authDTO){
        UserDTO userDetails = userService.getUserDetails(authDTO.getUserName(), authDTO.getPassword());
        System.out.println("API called here");
        String token = jwtUtil.generateToken(userDetails);
        UserDetailDto userDetailDto = new UserDetailDto();
        userDetailDto.setToken(token);
        userDetailDto.setUserId(userDetails.getUserId());
        return new CommonResponse(0, userDetailDto, "JWT Token");
    }

    @PostMapping(value = {"", "/save"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveUser(@RequestBody UserDTO userDTO){
        userService.saveUser(userDTO);
        UserDTO userDetails = userService.getUserDetails(userDTO.getUserName(), userDTO.getPassword());
        String token = jwtUtil.generateToken(userDetails);
        UserDetailDto userDetailDto = new UserDetailDto();
        userDetailDto.setUserId(userDetails.getUserId());
        userDetailDto.setToken(token);
        return new CommonResponse(0, userDetailDto, "Saved!");
    }

    @GetMapping(value = {"", "/getAll"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllUsers(){
        return new CommonResponse(0, userService.getAllUsers(), "Successful");
    }

    @GetMapping(value = {"/filter", "/filterUser"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getByName(
            @RequestParam(value = "userName", required = false) String userName,
            @RequestParam(value = "userRole", required = false) String userRole){
        return new CommonResponse(0, userService.filterUser(userName, userRole), "Successful");
    }

    @GetMapping(value = "/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getUserById(@PathVariable long userId){
        return new CommonResponse(0, userService.getUserById(userId), "Successful");
    }

    @PutMapping(value = "/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateUser(@PathVariable long userId, @RequestBody UserDTO userDTO){
        userService.updateUser(userId, userDTO);
        return new CommonResponse(0, "Updated!");
    }

    @DeleteMapping(value = "/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteUser(@PathVariable long userId){
        userService.deleteUser(userId);
        return new CommonResponse(0, "Deleted!");
    }
}
