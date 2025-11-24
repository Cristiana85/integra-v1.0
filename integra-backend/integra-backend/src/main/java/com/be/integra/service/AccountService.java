package com.be.integra.service;

import com.be.integra.dto.AccountDTO;
import com.be.integra.dto.ResultDTO;
import com.be.integra.entity.Account;

import java.util.Optional;

public interface AccountService {

    Optional<Account> findByEmail(String email);

    boolean verifyPassword(String rawPassword, String encodedPassword);

    String encodePassword(String rawPassword);

    void sendPasswordResetToken(String email);

    ResultDTO<Account> register(Account account);

    void resetPassword(String token, String newPassword);

    ResultDTO<Account> login(String email, String password);

    AccountDTO getAccountById(Long id);
}

