package com.be.integra.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;


@Data
@Entity
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@Table(schema = "integra", name = "account", uniqueConstraints = {
	    @UniqueConstraint(columnNames = {"email"})
})
public class Account implements Serializable {
	@Serial
	private static final long serialVersionUID = 1L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	@Column(name = "id")
    private Long id;	
	
	@Column(name = "email")
    private String email;
	
	@Column(name = "password")
    private String password;
	
	@Column(name = "active")
    private Boolean active;
	
	@Column(name = "name")
    private String name;
	
	@Column(name = "surname")
    private String surname;

	@Column(name = "token")
	private String token;

	@Column(name = "reset_token")
	private String resetToken;

	@Column(name = "login_date_time")
    private Instant loginDateTime;
	
	@Column(name = "account_expired")
    private Instant accountExpired;
	
	@Column(name = "password_insert_date_time")
    private Instant passwordInsertDateTime;
	
	@Column(name = "failed_attempts")
    private Integer failedAttempts;
	
	@Column(name = "must_change_password")
    private Boolean mustChangePassword;
	
}
