package com.RenterzPaizza.RenterzPaizza.config;

import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.entity.enums.Role;
import com.RenterzPaizza.RenterzPaizza.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                List<User> defaultUsers = List.of(
                        User.builder()
                                .name("Super Admin")
                                .email("superadmin@renterz.com")
                                .mobile("9876543210")
                                .password(passwordEncoder.encode("password123"))
                                .role(Role.SUPER_ADMIN)
                                .active(true)
                                .build(),
                        User.builder()
                                .name("Building Admin")
                                .email("buildingadmin@renterz.com")
                                .mobile("9876543211")
                                .password(passwordEncoder.encode("password123"))
                                .role(Role.ADMIN)
                                .active(true)
                                .build(),
                        User.builder()
                                .name("Owner User")
                                .email("owner@renterz.com")
                                .mobile("9876543212")
                                .password(passwordEncoder.encode("password123"))
                                .role(Role.OWNER)
                                .active(true)
                                .build(),
                        User.builder()
                                .name("Tenant User")
                                .email("tenant@renterz.com")
                                .mobile("9876543213")
                                .password(passwordEncoder.encode("password123"))
                                .role(Role.TENANT)
                                .active(true)
                                .build());
                userRepository.saveAll(defaultUsers);
                System.out.println("Default users created successfully!");
            }
        };
    }
}
