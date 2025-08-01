package com.validacao.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {"/{path:^(?!api|static|.*\\..*).*$}", "/**/{path:^(?!api|static|.*\\..*).*$}"})
    public String forward() {
        // Encaminha todas as rotas desconhecidas para index.html do frontend
        return "forward:/index.html";
    }
}
