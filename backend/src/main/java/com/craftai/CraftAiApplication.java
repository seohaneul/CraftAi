package com.craftai;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CraftAiApplication {
    public static void main(String[] args) {
        // .env 파일 로드하여 시스템 환경변수에 반영
        Dotenv dotenv = Dotenv.configure().directory("./").ignoreIfMissing().load();
        dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));

        SpringApplication.run(CraftAiApplication.class, args);
    }
}
