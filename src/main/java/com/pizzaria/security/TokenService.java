package com.pizzaria.security;

import org.springframework.stereotype.Service;

@Service
public class TokenService {
    public String gerarToken(String username) {
        return "token_para_" + username;
    }
}
