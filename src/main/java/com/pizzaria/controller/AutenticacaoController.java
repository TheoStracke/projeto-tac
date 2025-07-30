package com.pizzaria.controller;

import org.springframework.beans.factory.annotation.Autowired;

import com.pizzaria.dto.LoginDTO;
import com.pizzaria.security.TokenService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/login"})
public class AutenticacaoController {

    @Autowired
    private TokenService tokenService;
   private final AuthenticationManager authenticationManager;

   public AutenticacaoController(AuthenticationManager authenticationManager) {
      this.authenticationManager = authenticationManager;
   }

   @PostMapping
   public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
      Authentication authentication = this.authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginDTO.login(), loginDTO.senha()));
      String token = tokenService.gerarToken(authentication.getName());
      return ResponseEntity.ok(Map.of("token", token));
   }
}
