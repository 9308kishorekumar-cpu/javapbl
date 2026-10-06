package com.libraai.admin.service;

import com.libraai.admin.dto.*;
import com.libraai.audit.service.AuditService;
import com.libraai.common.exception.BadRequestException;
import com.libraai.common.exception.ResourceNotFoundException;
import com.libraai.security.entity.Role;
import com.libraai.security.entity.User;
import com.libraai.security.repository.RoleRepository;
import com.libraai.security.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditService auditService;

    @Value("${libraai.rules.max-books-per-member:5}")
    private int maxBooksPerMember;

    @Value("${libraai.rules.max-renewal-count:2}")
    private int maxRenewalCount;

    @Value("${libraai.rules.loan-period-days:14}")
    private int defaultLoanPeriodDays;

    @Value("${libraai.rules.daily-fine-rate:1.00}")
    private BigDecimal dailyFineRate;

    public AdminService(UserRepository userRepository,
                        RoleRepository roleRepository,
                        AuditService auditService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public Page<UserManagementDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToDto);
    }

    @Transactional
    public UserManagementDto updateUserRoles(Long userId, UpdateUserRolesRequest request, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Set<Role> roles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            String formatted = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
            Role role = roleRepository.findByName(formatted)
                    .orElseThrow(() -> new BadRequestException("Role not found: " + formatted));
            roles.add(role);
        }

        user.setRoles(roles);
        User updated = userRepository.save(user);

        String roleList = request.getRoles().stream().collect(Collectors.joining(", "));
        auditService.log("USER_ROLES_UPDATED", "User", user.getId(),
                "Updated roles for user '" + user.getUsername() + "' to: [" + roleList + "]",
                adminUsername, null);

        return mapToDto(updated);
    }

    @Transactional
    public UserManagementDto updateUserStatus(Long userId, UpdateUserStatusRequest request, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String oldStatus = user.getMembershipStatus();
        user.setMembershipStatus(request.getStatus().toUpperCase());
        User updated = userRepository.save(user);

        auditService.log("USER_STATUS_UPDATED", "User", user.getId(),
                "Changed status of user '" + user.getUsername() + "' from " + oldStatus + " to " + user.getMembershipStatus(),
                adminUsername, null);

        return mapToDto(updated);
    }

    @Transactional(readOnly = true)
    public SystemConfigDto getSystemConfig() {
        return new SystemConfigDto(
                maxBooksPerMember,
                maxRenewalCount,
                defaultLoanPeriodDays,
                dailyFineRate,
                true,
                true,
                true
        );
    }

    @Transactional
    public SystemConfigDto updateSystemConfig(UpdateSystemConfigRequest request, String adminUsername) {
        if (request.getMaxBooksPerMember() != null && request.getMaxBooksPerMember() > 0) {
            this.maxBooksPerMember = request.getMaxBooksPerMember();
        }
        if (request.getMaxRenewalCount() != null && request.getMaxRenewalCount() >= 0) {
            this.maxRenewalCount = request.getMaxRenewalCount();
        }
        if (request.getDefaultLoanPeriodDays() != null && request.getDefaultLoanPeriodDays() > 0) {
            this.defaultLoanPeriodDays = request.getDefaultLoanPeriodDays();
        }
        if (request.getDailyFineRate() != null && request.getDailyFineRate().compareTo(BigDecimal.ZERO) >= 0) {
            this.dailyFineRate = request.getDailyFineRate();
        }

        auditService.log("CONFIG_UPDATED", "SystemConfig", 1L,
                "Updated system parameters: LoanPeriod=" + this.defaultLoanPeriodDays + "d, FineRate=₹" + this.dailyFineRate + "/d, MaxLoans=" + this.maxBooksPerMember,
                adminUsername, null);

        return getSystemConfig();
    }

    private UserManagementDto mapToDto(User u) {
        List<String> roleNames = u.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return new UserManagementDto(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getFullName(),
                roleNames,
                u.getMembershipStatus(),
                u.getCreatedAt()
        );
    }
}
