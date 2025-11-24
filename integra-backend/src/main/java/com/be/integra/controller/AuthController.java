package com.be.integra.controller;

import com.be.integra.dto.ResultDTO;
import com.be.integra.entity.Account;
import com.be.integra.security.authentication.AuthRequest;
import com.be.integra.security.authentication.ForgotPasswordRequest;
import com.be.integra.security.authentication.ResetPasswordRequest;
import com.be.integra.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AccountService accountService;

    @PostMapping("/register")
    public ResponseEntity<ResultDTO<Account>> register(@RequestBody Account account) {
        return new ResponseEntity<>(accountService.register(account), HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<ResultDTO<Account>> login(@RequestBody AuthRequest authRequest) {
        return new ResponseEntity<>(accountService.login(authRequest.getEmail(), authRequest.getPassword()), HttpStatus.OK);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        accountService.sendPasswordResetToken(request.getEmail());
        return ResponseEntity.ok("Email di recupero inviata");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ResultDTO<Void>> resetPassword(@RequestBody ResetPasswordRequest request) throws Exception {
        accountService.resetPassword(request.getToken(), request.getNewPassword());
        return new ResponseEntity<>(ResultDTO.success(), HttpStatus.OK);
    }
}
