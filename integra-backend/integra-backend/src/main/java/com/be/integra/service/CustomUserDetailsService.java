package com.be.integra.service;

import com.be.integra.entity.Account;
import com.be.integra.repository.AccountRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;

    public CustomUserDetailsService(AccountRepository userRepository) {
        this.accountRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Cerca l'utente nel database
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // Converte AppUser in UserDetails
        return User.withUsername(account.getEmail())
                .password(account.getPassword()) // La password deve essere codificata
                //.authorities(account.getRoles().stream().toArray(String[]::new))
                .build();
    }
}
