package lk.ijse.hotel.dto;

import lk.ijse.hotel.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserDTO {
    private long userId;
    private String userName;
    private String password;
    private String userRoles;
    private UserStatus userStatus;

    public UserDTO(long userId, String userName, String password) {
        this.userId = userId;
        this.userName = userName;
        this.password = password;
    }

    public UserDTO(String userName, String password) {
        this.userName = userName;
        this.password = password;
    }

    public UserDTO(long userId, String userName, String userRoles, UserStatus userStatus) {
        this.userId = userId;
        this.userName = userName;
        this.userRoles = userRoles;
        this.userStatus = userStatus;
    }

    public UserDTO(String userName, long userId, String password, String userRoles, UserStatus userStatus) {
        this.userName = userName;
        this.userId = userId;
        this.password = password;
        this.userRoles = userRoles;
        this.userStatus = userStatus;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUserRoles() {
        return userRoles;
    }

    public void setUserRoles(String userRoles) {
        this.userRoles = userRoles;
    }

    public UserStatus getUserStatus() {
        return userStatus;
    }

    public void setUserStatus(UserStatus userStatus) {
        this.userStatus = userStatus;
    }

    @Override
    public String toString() {
        return "UserDTO{" +
                "userId=" + userId +
                ", userName='" + userName + '\'' +
                ", password='" + password + '\'' +
                ", userRoles='" + userRoles + '\'' +
                ", userStatus=" + userStatus +
                '}';
    }
}
