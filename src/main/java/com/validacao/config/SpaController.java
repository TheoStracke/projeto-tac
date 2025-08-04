package com.validacao.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;


@Controller
public class SpaController {

    @RequestMapping("/{path:^(?!api|static|.*\\..*).*$}")
    public String forward() {
        return "forward:/index.html";
    }
}

