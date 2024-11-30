package com.be.integra.service;

import com.be.integra.entity.Account;
import com.be.integra.repository.AccountRepository;
import com.be.integra.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
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

    public Account register(String email, String password) {
        Account user = new Account();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        return accountRepository.save(user);
    }

    public void resetPassword(String token, String newPassword) {
        Account account = accountRepository.findByResetToken(token).orElseThrow(() -> new RuntimeException("Token invalido"));
        account.setPassword(passwordEncoder.encode(newPassword));
        account.setResetToken(null);
        accountRepository.save(account);
    }

    public ResponseEntity<?> login(String email, String password) {
        Optional<Account> account = accountRepository.findByEmail(email);

        if (account.isPresent() && verifyPassword(password, account.get().getPassword())) {
            String token = jwtTokenUtil.generateToken(account.get().getEmail());
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("accountId", account.get().getId());

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenziali non valide");
    }
}
