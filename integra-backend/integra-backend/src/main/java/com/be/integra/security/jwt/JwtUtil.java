package com.be.integra.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private SecretKey secretKey; // Chiave segreta
    private final long validityInMilliseconds = 3600000; // 1 ora di validità (in millisecondi)

    // Inizializza la chiave segreta al caricamento del bean
    @PostConstruct
    public void init() {
        this.secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256); // Genera una chiave una volta
    }

    // Genera il token con username e expiration
    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .setSubject(username) // Imposta lo username come "subject"
                .setIssuedAt(now) // Data di creazione
                .setExpiration(expiryDate) // Data di scadenza
                .signWith(secretKey) // Firma con la chiave segreta
                .compact();
    }

    // Estrae lo username dal token
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey) // Chiave segreta per verificare il token
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    // Valida il token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(secretKey) // Chiave segreta per la validazione
                    .build()
                    .parseClaimsJws(token); // Decodifica e verifica il token
            return true; // Se non ci sono eccezioni, il token è valido
        } catch (JwtException | IllegalArgumentException e) {
            // Token non valido o malformato
            return false;
        }
    }

    // Controlla se il token è scaduto
    private boolean isTokenExpired(String token) {
        Date expiration = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
        return expiration.before(new Date());
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey) // Usa la chiave segreta per decodificare il token
                .build()
                .parseClaimsJws(token) // Parsing del token JWT
                .getBody() // Ottieni il corpo dei claims
                .getSubject(); // Recupera il campo "subject"
    }

}
