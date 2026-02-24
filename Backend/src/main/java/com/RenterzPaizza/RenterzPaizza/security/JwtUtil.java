package com.RenterzPaizza.RenterzPaizza.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UserDetails userDetails) {
        Date now = new Date();
        Date expiresAt = new Date(now.getTime() + expiration);

        // Get role from userDetails - authorities are stored as ROLE_ADMIN,
        // ROLE_SUPER_ADMIN etc.
        String role = "";
        try {
            var authorities = userDetails.getAuthorities();
            if (!authorities.isEmpty()) {
                String authority = authorities.iterator().next().getAuthority();
                // Strip ROLE_ prefix if present
                if (authority.startsWith("ROLE_")) {
                    role = authority.substring(5);
                } else {
                    role = authority;
                }
            }
        } catch (Exception e) {
            // Ignore and use default empty role
        }

        var builder = Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(now)
                .expiration(expiresAt);

        if (!role.isEmpty()) {
            builder.claim("role", role);
        }

        return builder.signWith(getSigningKey()).compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claimsResolver.apply(claims);
    }
}
