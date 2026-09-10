package lk.ijse.hotel.security;

import lk.ijse.hotel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerUserDetailService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Optional<lk.ijse.hotel.entity.User> optionalUser = userRepository.findByUsername(username);

        if (optionalUser.isEmpty())
            throw new RuntimeException("Sorry no user");

        return User.builder()
                .username(optionalUser.get().getUsername())
                .password(optionalUser.get().getPassword())
                .roles(optionalUser.get().getRole().name())
                .build();
    }
}
