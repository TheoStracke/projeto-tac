package com.validacao.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/cors")
    public ResponseEntity<Map<String, String>> testCors() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "CORS está funcionando!");
        response.put("timestamp", new java.util.Date().toString());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cors")
    public ResponseEntity<Map<String, String>> testCorsPost(@RequestBody(required = false) Map<String, Object> body) {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "POST CORS está funcionando!");
        response.put("received", body != null ? body.toString() : "null");
        response.put("timestamp", new java.util.Date().toString());
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/cors", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> corsOptions() {
        return ResponseEntity.ok().build();
    }
}
