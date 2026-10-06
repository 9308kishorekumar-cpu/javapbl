package com.libraai.admin.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class UpdateUserRolesRequest {

    @NotEmpty(message = "At least one role is required")
    private List<String> roles;

    public UpdateUserRolesRequest() {}

    public UpdateUserRolesRequest(List<String> roles) {
        this.roles = roles;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
