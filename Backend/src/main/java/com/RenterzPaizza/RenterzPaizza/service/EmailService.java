package com.RenterzPaizza.RenterzPaizza.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendRentReminder(String to, String name, String dueDate, double amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Friendly Reminder: Upcoming Rent Due Date 🏠");

        String emailContent = "Hi " + name + ",\n\n" +
                "This is a friendly reminder that your rent payment is due soon.\n\n" +
                "Please ensure the payment of ₹" + String.format("%.2f", amount) +
                " is completed on or before " + dueDate + " to avoid any late fees or inconvenience.\n\n" +
                "If you've already made the payment, thank you—please ignore this message.\n" +
                "If you have any questions or need assistance, feel free to reply to this email. We're happy to help.\n\n"
                +
                "Best regards,\n" +
                "Renterz Paisa";

        message.setText(emailContent);
        mailSender.send(message);
    }

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public void sendEmail(String email, String name) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Friendly Reminder: Upcoming Rent Due Date 🏠");

        String emailContent = "Hi " + name + ",\n\n" +
                "This is a friendly reminder that your rent payment is due soon.\n\n" +
                "Please ensure the payment of ₹15000" +
                " is completed on or before Next wednesday to avoid any late fees or inconvenience.\n\n" +
                "If you've already made the payment, thank you—please ignore this message.\n" +
                "If you have any questions or need assistance, feel free to reply to this email. We're happy to help.\n\n"
                +
                "Best regards,\n" +
                "Renterz Paisa";

        message.setText(emailContent);
        mailSender.send(message);
    }
}
