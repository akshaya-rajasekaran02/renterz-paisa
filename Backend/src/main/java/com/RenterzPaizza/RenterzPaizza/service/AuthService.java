package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.dto.AuthResponse;
import com.RenterzPaizza.RenterzPaizza.dto.LoginRequest;
import com.RenterzPaizza.RenterzPaizza.dto.RegisterRequest;
import com.RenterzPaizza.RenterzPaizza.dto.UserResponse;
import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.entity.enums.Role;
import com.RenterzPaizza.RenterzPaizza.exception.BadRequestException;
import com.RenterzPaizza.RenterzPaizza.mapper.UserMapper;
import com.RenterzPaizza.RenterzPaizza.repository.UserRepository;
import com.RenterzPaizza.RenterzPaizza.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

        private final AuthenticationManager authenticationManager;
        private final UserRepository userRepository;
        private final JwtUtil jwtUtil;
        private final PasswordEncoder passwordEncoder;
        private final UserMapper userMapper;

        public AuthService(AuthenticationManager authenticationManager,
                        UserRepository userRepository,
                        JwtUtil jwtUtil,
                        PasswordEncoder passwordEncoder,
                        UserMapper userMapper) {
                this.authenticationManager = authenticationManager;
                this.userRepository = userRepository;
                this.jwtUtil = jwtUtil;
                this.passwordEncoder = passwordEncoder;
                this.userMapper = userMapper;
        }

        public AuthResponse login(LoginRequest request) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(),
                                                request.getPassword()));

                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                User user = userRepository.findByEmailAndDeletedFalse(request.getEmail().toLowerCase())
                                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

                return AuthResponse.builder()
                                .token(jwtUtil.generateToken(userDetails))
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .userId(user.getUserId())
                                .build();
        }

        public UserResponse register(RegisterRequest request) {
                if (userRepository.existsByEmailAndDeletedFalse(request.getEmail().toLowerCase())) {
                        throw new BadRequestException("Email already registered");
                }

                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail().toLowerCase())
                                .mobile(request.getMobile())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(Role.ADMIN)
                                .active(true)
                                .build();

                return userMapper.toResponse(userRepository.save(user));
        }
}
