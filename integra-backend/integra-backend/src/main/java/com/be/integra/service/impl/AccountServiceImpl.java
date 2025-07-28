package com.be.integra.service.impl;

import com.be.integra.dto.*;
import com.be.integra.entity.Account;
import com.be.integra.repository.AccountRepository;
import com.be.integra.security.jwt.JwtUtil;
import com.be.integra.service.*;
import com.be.integra.util.IntegraModelMapper;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtTokenUtil;
    private final IntegraModelMapper modelMapper;

    @Override
    public Optional<Account> findByEmail(String email) {
        return accountRepository.findByEmail(email);
    }

    @Override
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return new BCryptPasswordEncoder().matches(rawPassword, encodedPassword);
    }

    @Override
    public String encodePassword(String rawPassword) {
        return new BCryptPasswordEncoder().encode(rawPassword);
    }

    @Override
    public void sendPasswordResetToken(String email) {
        Account user = accountRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Utente non trovato"));
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        accountRepository.save(user);
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    @Override
    public ResultDTO<Account> register(Account account) {
        Optional<Account> existingAccount = accountRepository.findByEmail(account.getEmail());

        if (existingAccount.isPresent()) {
            throw new IllegalArgumentException("An account with the provided email already exists.");
        }

        Account newAccount = new Account();
        newAccount.setEmail(account.getEmail());
        newAccount.setPassword(passwordEncoder.encode(account.getPassword()));
        newAccount.setName(account.getName());
        newAccount.setSurname(account.getSurname());
        newAccount.setActive(Boolean.TRUE);
        newAccount.setMustChangePassword(Boolean.FALSE);
        newAccount.setLoginDateTime(new Date().toInstant());

        accountRepository.save(newAccount);

        Account savedAccount = accountRepository.findByEmail(account.getEmail())
                .orElseThrow(() -> new IllegalStateException("Account could not be retrieved after saving."));

        return new ResultDTO<>(savedAccount);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        Account account = accountRepository.findByResetToken(token).orElseThrow(() -> new RuntimeException("Invalid token"));
        account.setPassword(passwordEncoder.encode(newPassword));
        account.setResetToken(null);
        accountRepository.save(account);
    }

    @Override
    public ResultDTO<Account> login(String email, String password) {
        Optional<Account> optionalAccount = accountRepository.findByEmail(email);

        if (optionalAccount.isPresent() && verifyPassword(password, optionalAccount.get().getPassword())) {
            Account user = optionalAccount.get();
            String token = jwtTokenUtil.generateToken(user.getEmail(), user.getId());
            user.setToken(token);
            return new ResultDTO<>(user);
        }

        throw new IllegalArgumentException("Invalid email or password");
    }

    @Override
    @SneakyThrows
    public AccountDTO getAccountById(@NonNull Long id) {
        return modelMapper.map(accountRepository.findById(id),
                AccountDTO.class);
    }
}
