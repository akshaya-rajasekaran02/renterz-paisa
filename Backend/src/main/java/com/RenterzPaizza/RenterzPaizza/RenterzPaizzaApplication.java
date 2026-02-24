package com.RenterzPaizza.RenterzPaizza;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RenterzPaizzaApplication {

	public static void main(String[] args) {
		SpringApplication.run(RenterzPaizzaApplication.class, args);
	}

}
