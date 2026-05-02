//package com.substring.chat.config;
//
//import lombok.Getter;
//import lombok.Setter;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//
//@Getter
//@Setter
//public class AppConstant {
//
//    @Value("${frontend.url}")
//    private  String FRONT_END_BASE_URL;
//
//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        registry.addMapping("/**")
//                .allowedOrigins(FRONT_END_BASE_URL)
//                .allowedMethods("*")
//                .allowedHeaders("*")
//                .allowCredentials(true);
//    }
//
//}
