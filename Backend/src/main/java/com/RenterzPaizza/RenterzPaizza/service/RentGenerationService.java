package com.RenterzPaizza.RenterzPaizza.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class RentGenerationService {

    private final RentService rentService;

    public RentGenerationService(RentService rentService) {
        this.rentService = rentService;
    }

    @Scheduled(cron = "0 0 0 1 * *")
    public void runMonthlyGeneration() {
        rentService.generateMonthlyRent();
    }

    @Scheduled(cron = "0 0 1 * * *")
    public void detectOverdue() {
        rentService.markOverdueRents();
    }
}
