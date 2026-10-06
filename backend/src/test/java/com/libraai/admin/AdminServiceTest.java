package com.libraai.admin;

import com.libraai.admin.dto.*;
import com.libraai.admin.service.AdminService;
import com.libraai.security.entity.User;
import com.libraai.security.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class AdminServiceTest {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testGetAllUsers() {
        Page<UserManagementDto> users = adminService.getAllUsers(PageRequest.of(0, 10));
        assertNotNull(users);
        assertTrue(users.getTotalElements() >= 3, "Should return seeded accounts");
    }

    @Test
    void testUpdateUserRoles() {
        User member = userRepository.findByUsername("member").orElseThrow();
        UpdateUserRolesRequest req = new UpdateUserRolesRequest(List.of("ROLE_MEMBER", "ROLE_LIBRARIAN"));

        UserManagementDto updated = adminService.updateUserRoles(member.getId(), req, "admin");
        assertNotNull(updated);
        assertTrue(updated.getRoles().contains("ROLE_LIBRARIAN"));
    }

    @Test
    void testUpdateUserStatus() {
        User member = userRepository.findByUsername("member").orElseThrow();
        UpdateUserStatusRequest req = new UpdateUserStatusRequest("SUSPENDED");

        UserManagementDto updated = adminService.updateUserStatus(member.getId(), req, "admin");
        assertNotNull(updated);
        assertEquals("SUSPENDED", updated.getMembershipStatus());
    }

    @Test
    void testUpdateSystemConfig() {
        UpdateSystemConfigRequest req = new UpdateSystemConfigRequest(8, 3, 21, BigDecimal.valueOf(1.50));
        SystemConfigDto config = adminService.updateSystemConfig(req, "admin");

        assertNotNull(config);
        assertEquals(8, config.getMaxBooksPerMember());
        assertEquals(3, config.getMaxRenewalCount());
        assertEquals(21, config.getDefaultLoanPeriodDays());
        assertEquals(BigDecimal.valueOf(1.50), config.getDailyFineRate());
    }
}
