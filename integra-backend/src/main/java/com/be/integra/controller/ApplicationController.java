package com.be.integra.controller;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@EnableScheduling
@RequestMapping("/api")
public class ApplicationController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Ciao, Spring Boot!";
    }
}
