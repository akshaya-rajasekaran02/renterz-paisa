package com.RenterzPaizza.RenterzPaizza.config;

import com.RenterzPaizza.RenterzPaizza.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {
                })
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/webhooks/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/admin/**").hasAnyRole("SUPER_ADMIN", "ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/owner/**").hasRole("OWNER")
                        .requestMatchers("/api/tenant/**").hasRole("TENANT")
                        .requestMatchers(HttpMethod.GET, "/api/common/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN", "OWNER", "TENANT")
                        .requestMatchers(HttpMethod.POST, "/api/common/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN", "OWNER", "TENANT")
                        .requestMatchers(HttpMethod.PUT, "/api/common/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN", "OWNER", "TENANT")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
