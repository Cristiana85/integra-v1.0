package com.be.integra.controller;

import com.be.integra.security.authentication.AuthRequest;
import com.be.integra.security.authentication.ForgotPasswordRequest;
import com.be.integra.security.authentication.ResetPasswordRequest;
import com.be.integra.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRequest authRequest) {
        userService.register(authRequest.getEmail(), authRequest.getPassword());
        return ResponseEntity.ok("Registrazione completata");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthRequest authRequest) {
        return ResponseEntity.ok("Login riuscito");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        userService.sendPasswordResetToken(request.getEmail());
        return ResponseEntity.ok("Email di recupero inviata");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Password aggiornata");
    }
}
