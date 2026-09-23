package com.senhoresdanavalha.barbearia.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping({"/", "/home"})
    public String home(Model model) {
        model.addAttribute("pageTitle", "Barbearia Senhores da Navalha");
        return "index";
    }

    @GetMapping("/sobre")
    public String sobre() {
        return "sobre";
    }

    @GetMapping("/servicos")
    public String servicos() {
        return "servicos";
    }

    @GetMapping("/equipe")
    public String equipe() {
        return "equipe";
    }

    @GetMapping("/contato")
    public String contato() {
        return "contato";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/cadastro")
    public String cadastro() {
        return "cadastro";
    }

    @GetMapping("/agenda")
    public String agenda() {
        return "agenda";
    }

    @GetMapping("/esqueci-senha")
    public String esqueciSenha() {
        return "forgot-password";
    }

    @GetMapping("/resetar-senha")
    public String resetarSenha() {
        return "reset-password";
    }
}
