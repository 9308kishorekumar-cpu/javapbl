package com.libraai.admin.dto;

import java.time.Instant;
import java.util.List;

public class MemberProfileDto {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String membershipStatus;
    private List<String> roles;
    private Instant createdAt;
    private long membershipAgeDays;

    public MemberProfileDto() {}

    public MemberProfileDto(Long id, String username, String email, String fullName,
                            String membershipStatus, List<String> roles, Instant createdAt, long membershipAgeDays) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.membershipStatus = membershipStatus;
        this.roles = roles;
        this.createdAt = createdAt;
        this.membershipAgeDays = membershipAgeDays;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getMembershipStatus() {
        return membershipStatus;
    }

    public void setMembershipStatus(String membershipStatus) {
        this.membershipStatus = membershipStatus;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public long getMembershipAgeDays() {
        return membershipAgeDays;
    }

    public void setMembershipAgeDays(long membershipAgeDays) {
        this.membershipAgeDays = membershipAgeDays;
    }
}
