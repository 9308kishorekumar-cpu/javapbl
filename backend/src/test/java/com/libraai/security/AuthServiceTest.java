package com.libraai.security;

import com.libraai.common.exception.BadRequestException;
import com.libraai.security.dto.AuthResponse;
import com.libraai.security.dto.LoginRequest;
import com.libraai.security.dto.RegisterRequest;
import com.libraai.security.entity.User;
import com.libraai.security.repository.UserRepository;
import com.libraai.security.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        // Ensure default seeded accounts have standard password
        userRepository.findByUsername("admin").ifPresent(u -> {
            u.setPasswordHash(passwordEncoder.encode("password123"));
            userRepository.save(u);
        });
        userRepository.findByUsername("librarian").ifPresent(u -> {
            u.setPasswordHash(passwordEncoder.encode("password123"));
            userRepository.save(u);
        });
        userRepository.findByUsername("member").ifPresent(u -> {
            u.setPasswordHash(passwordEncoder.encode("password123"));
            userRepository.save(u);
        });
    }

    @Test
    void testBCryptEncoding() {
        String hash = passwordEncoder.encode("password123");
        System.out.println("GENERATED_BCRYPT_HASH: " + hash);
        assertTrue(passwordEncoder.matches("password123", hash));
    }

    @Test
    void testLoginAdminSuccess() {
        LoginRequest req = new LoginRequest("admin", "password123");
        AuthResponse response = authService.login(req);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("admin", response.getUser().getUsername());
        assertTrue(response.getUser().getRoles().contains("ROLE_ADMIN"));
    }

    @Test
    void testLoginLibrarianSuccess() {
        LoginRequest req = new LoginRequest("librarian", "password123");
        AuthResponse response = authService.login(req);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("librarian", response.getUser().getUsername());
        assertTrue(response.getUser().getRoles().contains("ROLE_LIBRARIAN"));
    }

    @Test
    void testLoginMemberSuccess() {
        LoginRequest req = new LoginRequest("member", "password123");
        AuthResponse response = authService.login(req);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("member", response.getUser().getUsername());
        assertTrue(response.getUser().getRoles().contains("ROLE_MEMBER"));
    }

    @Test
    void testLoginInvalidPasswordFails() {
        LoginRequest req = new LoginRequest("admin", "wrongpassword");
        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }

    @Test
    void testRegisterNewUserSuccess() {
        RegisterRequest req = new RegisterRequest(
                "newreader",
                "newreader@test.com",
                "securePass123",
                "Bob Reader"
        );

        AuthResponse response = authService.register(req);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("newreader", response.getUser().getUsername());
        assertTrue(response.getUser().getRoles().contains("ROLE_MEMBER"));
    }

    @Test
    void testRegisterDuplicateUsernameFails() {
        RegisterRequest req = new RegisterRequest(
                "admin",
                "unique@test.com",
                "password123",
                "Admin Duplicate"
        );

        assertThrows(BadRequestException.class, () -> authService.register(req));
    }
}
