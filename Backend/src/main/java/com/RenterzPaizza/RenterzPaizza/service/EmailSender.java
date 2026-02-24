package com.RenterzPaizza.RenterzPaizza.service;

import org.springframework.stereotype.Service;

@Service
public class EmailSender {

    public boolean send(String email, String message) {

        try {
            // TODO email logic
            System.out.println("EMAIL SENT -> " + email);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
