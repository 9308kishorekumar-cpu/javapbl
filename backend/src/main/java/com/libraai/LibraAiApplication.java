package com.libraai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LibraAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(LibraAiApplication.class, args);
    }
}
