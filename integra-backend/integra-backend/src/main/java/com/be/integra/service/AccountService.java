package com.be.integra.service;

import com.be.integra.dto.ResultDTO;
import com.be.integra.entity.Account;
import com.be.integra.repository.AccountRepository;
import com.be.integra.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;
    @Autowired
    private final JwtUtil jwtTokenUtil;

    public Optional<Account> findByEmail(String email) {
        return accountRepository.findByEmail(email);
    }

    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return new BCryptPasswordEncoder().matches(rawPassword, encodedPassword);
    }

    public String encodePassword(String rawPassword) {
        return new BCryptPasswordEncoder().encode(rawPassword);
    }

    public void sendPasswordResetToken(String email) {
        Account user = accountRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Utente non trovato"));
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        accountRepository.save(user);
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    public ResultDTO<Account> register(Account account) {
        Optional<Account> existingAccount = accountRepository.findByEmail(account.getEmail());

        if (existingAccount.isPresent()) {
            throw new IllegalArgumentException("An account with the provided email already exists.");
        }

        Account newAccount = new Account();
        newAccount.setEmail(account.getEmail());
        newAccount.setPassword(passwordEncoder.encode(account.getPassword())); // Password crittografata
        newAccount.setName(account.getName());
        newAccount.setSurname(account.getSurname());
        newAccount.setActive(Boolean.TRUE);
        newAccount.setMustChangePassword(Boolean.FALSE);
        newAccount.setLoginDateTime(new Date().toInstant());

        // Salva il nuovo account nel repository
        accountRepository.save(newAccount);

        // Recupera l'account appena salvato dal repository per sicurezza
        Account savedAccount = accountRepository.findByEmail(account.getEmail())
                .orElseThrow(() -> new IllegalStateException("Account could not be retrieved after saving."));

        // Restituisce il risultato come DTO
        return new ResultDTO<>(savedAccount);
    }


    public void resetPassword(String token, String newPassword) {
        Account account = accountRepository.findByResetToken(token).orElseThrow(() -> new RuntimeException("Token invalido"));
        account.setPassword(passwordEncoder.encode(newPassword));
        account.setResetToken(null);
        accountRepository.save(account);
    }

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

}
