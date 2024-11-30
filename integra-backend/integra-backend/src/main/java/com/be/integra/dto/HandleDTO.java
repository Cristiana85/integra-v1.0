package com.be.integra.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NonNull;

import java.io.Serial;
import java.io.Serializable;

@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class HandleDTO implements Serializable {
	@Serial
	private static final long serialVersionUID = 1L;

	@NonNull
	@EqualsAndHashCode.Include
	private Long accountId;
	private String username;

	public HandleDTO(Long accountId, String username) {
		this.accountId = accountId;
		this.username = username;
	}
}
