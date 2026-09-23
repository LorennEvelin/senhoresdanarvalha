package com.senhoresdanavalha.barbearia.controller;

import com.senhoresdanavalha.barbearia.model.Agendamento;
import com.senhoresdanavalha.barbearia.model.Usuario;
import com.senhoresdanavalha.barbearia.repository.AgendamentoRepository;
import com.senhoresdanavalha.barbearia.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/cliente")
public class ClienteController {

    private final UsuarioRepository usuarioRepository;
    private final AgendamentoRepository agendamentoRepository;

    public ClienteController(UsuarioRepository usuarioRepository, AgendamentoRepository agendamentoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.agendamentoRepository = agendamentoRepository;
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();

        List<Agendamento> historico = agendamentoRepository.findByUsuarioOrderByDataAgendamentoDescHorarioDesc(usuario);
        model.addAttribute("usuario", usuario);
        model.addAttribute("historico", historico);
        return "cliente-dashboard";
    }

    @GetMapping("/agendar")
    public String agendar(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();
        model.addAttribute("usuario", usuario);
        return "cliente-agendar";
    }

    @GetMapping("/historico")
    public String historico(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();
        model.addAttribute("historico", agendamentoRepository.findByUsuarioOrderByDataAgendamentoDescHorarioDesc(usuario));
        model.addAttribute("usuario", usuario);
        return "historico";
    }
}
