package com.be.integra.dto;

import com.be.integra.enums.AccountType;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.Instant;

@Data
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class AccountDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @EqualsAndHashCode.Include
    private Long id;

    private String email;
    private Boolean active;
    private String name;
    private String surname;
    private AccountType type;
    private String token;
    private String resetToken;
    private Instant loginDateTime;
    private Instant accountExpired;
    private Instant passwordInsertDateTime;
    private Integer failedAttempts;
    private Boolean mustChangePassword;

    /*@JsonProperty("lAccountSetting")
    private List<AccountSettingDTO> lAccountSetting;

    @JsonProperty("lAccountRole")
    private List<AccountRoleDTO> lAccountRole;*/

//    private OrganizationDTO organization;
//    private TenantDTO tenant;


}

