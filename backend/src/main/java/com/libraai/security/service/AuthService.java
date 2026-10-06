package com.libraai.security.service;

import com.libraai.common.exception.BadRequestException;
import com.libraai.common.exception.ResourceNotFoundException;
import com.libraai.security.dto.AuthResponse;
import com.libraai.security.dto.LoginRequest;
import com.libraai.security.dto.RegisterRequest;
import com.libraai.security.dto.UserSummaryDto;
import com.libraai.security.entity.Role;
import com.libraai.security.entity.User;
import com.libraai.security.jwt.JwtTokenProvider;
import com.libraai.security.repository.RoleRepository;
import com.libraai.security.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getMembershipStatus())) {
            throw new BadRequestException("User account is inactive or suspended");
        }

        String token = tokenProvider.generateToken(user);
        return new AuthResponse(token, mapToSummary(user));
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken: " + request.getUsername());
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName()
        );

        Role memberRole = roleRepository.findByName("ROLE_MEMBER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_MEMBER")));

        user.getRoles().add(memberRole);
        User savedUser = userRepository.save(user);

        String token = tokenProvider.generateToken(savedUser);
        return new AuthResponse(token, mapToSummary(savedUser));
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return mapToSummary(user);
    }

    public UserSummaryDto mapToSummary(User user) {
        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return new UserSummaryDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getMembershipStatus(),
                roleNames,
                user.getCreatedAt()
        );
    }
}
