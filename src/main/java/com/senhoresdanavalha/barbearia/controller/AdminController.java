package com.senhoresdanavalha.barbearia.controller;

import com.senhoresdanavalha.barbearia.model.Barbeiro;
import com.senhoresdanavalha.barbearia.model.Servico;
import com.senhoresdanavalha.barbearia.model.TipoUsuario;
import com.senhoresdanavalha.barbearia.repository.BarbeiroRepository;
import com.senhoresdanavalha.barbearia.repository.ServicoRepository;
import com.senhoresdanavalha.barbearia.repository.UsuarioRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final ServicoRepository servicoRepository;
    private final BarbeiroRepository barbeiroRepository;

    public AdminController(UsuarioRepository usuarioRepository,
                          ServicoRepository servicoRepository,
                          BarbeiroRepository barbeiroRepository) {
        this.usuarioRepository = usuarioRepository;
        this.servicoRepository = servicoRepository;
        this.barbeiroRepository = barbeiroRepository;
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        long totalClientes = usuarioRepository.findAll().stream()
            .filter(usuario -> usuario.getTipoUsuario() == TipoUsuario.CLIENTE)
            .count();

        model.addAttribute("totalClientes", totalClientes);
        model.addAttribute("totalServicos", servicoRepository.count());
        model.addAttribute("totalBarbeiros", barbeiroRepository.count());
        model.addAttribute("servicos", servicoRepository.findAll());
        model.addAttribute("barbeiros", barbeiroRepository.findAll());
        return "admin-dashboard";
    }

    @GetMapping("/servicos")
    public String servicos(Model model) {
        model.addAttribute("servicos", servicoRepository.findAll());
        return "admin-servicos";
    }

    @GetMapping("/barbeiros")
    public String barbeiros(Model model) {
        model.addAttribute("barbeiros", barbeiroRepository.findAll());
        return "admin-barbeiros";
    }
}
