package com.RenterzPaizza.RenterzPaizza.controller;

import com.RenterzPaizza.RenterzPaizza.dto.EmailRequest;
import com.RenterzPaizza.RenterzPaizza.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    @Autowired
    private EmailService emailService;

//    @PostMapping("/send")
//    public ResponseEntity<?> sendEmail(@RequestBody EmailRequest request) {
//        try {
//            emailService.sendRentReminder(
//                    request.getEmail(),
//                    request.getName(),
//                    request.getDueDate(),
//                    request.getAmount());
//            return ResponseEntity.ok(Map.of("message", "Email sent successfully"));
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", "Failed to send email: " + e.getMessage()));
//        }
//    }
//}

//    @PostMapping("/send")
//    public String sendEmail(@RequestBody EmailRequest request) {
//        emailService.sendEmail(request.getEmail(), request.getName());
//        return "Email sent successfully";
//    }

    @PostMapping("/send")
    public ResponseEntity<?> sendEmail(@RequestBody EmailRequest request) {

        emailService.sendEmail(request.getEmail(), request.getName());

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Email sent successfully"
                )
        );
    }


}
