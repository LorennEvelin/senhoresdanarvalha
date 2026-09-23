package com.senhoresdanavalha.barbearia.controller;

import com.senhoresdanavalha.barbearia.repository.BarbeiroRepository;
import com.senhoresdanavalha.barbearia.repository.ServicoRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    private final ServicoRepository servicoRepository;
    private final BarbeiroRepository barbeiroRepository;

    public HomeController(ServicoRepository servicoRepository, BarbeiroRepository barbeiroRepository) {
        this.servicoRepository = servicoRepository;
        this.barbeiroRepository = barbeiroRepository;
    }

    @GetMapping({"/", "/home"})
    public String home(Model model) {
        model.addAttribute("pageTitle", "Barbearia Senhores da Navalha");
        model.addAttribute("servicos", servicoRepository.findAll());
        model.addAttribute("barbeiros", barbeiroRepository.findAll());
        return "index";
    }

    @GetMapping("/sobre")
    public String sobre() {
        return "sobre";
    }

    @GetMapping("/servicos")
    public String servicos(Model model) {
        model.addAttribute("servicos", servicoRepository.findAll());
        return "servicos";
    }

    @GetMapping("/equipe")
    public String equipe(Model model) {
        model.addAttribute("barbeiros", barbeiroRepository.findAll());
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
