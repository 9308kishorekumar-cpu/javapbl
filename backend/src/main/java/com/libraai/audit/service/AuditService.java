package com.libraai.audit.service;

import com.libraai.audit.entity.AuditLog;
import com.libraai.audit.repository.AuditLogRepository;
import com.libraai.security.entity.User;
import com.libraai.security.repository.UserRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entityType, Long entityId, String details, String username, String ipAddress) {
        Long userId = null;
        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                userId = user.getId();
            }
        }

        AuditLog log = new AuditLog(userId, username, action, entityType, entityId, details, ipAddress);
        auditLogRepository.save(log);
    }
}
