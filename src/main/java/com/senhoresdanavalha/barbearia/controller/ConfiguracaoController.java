package com.senhoresdanavalha.barbearia.controller;

import com.senhoresdanavalha.barbearia.model.ConfiguracaoBarbearia;
import com.senhoresdanavalha.barbearia.repository.ConfiguracaoBarbeariaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/admin")
public class ConfiguracaoController {

    private final ConfiguracaoBarbeariaRepository configuracaoBarbeariaRepository;

    public ConfiguracaoController(ConfiguracaoBarbeariaRepository configuracaoBarbeariaRepository) {
        this.configuracaoBarbeariaRepository = configuracaoBarbeariaRepository;
    }

    @GetMapping("/configuracoes")
    public String configuracoes(Model model) {
        ConfiguracaoBarbearia config = configuracaoBarbeariaRepository.findAll().stream().findFirst()
            .orElseGet(() -> {
                ConfiguracaoBarbearia novo = new ConfiguracaoBarbearia();
                return configuracaoBarbeariaRepository.save(novo);
            });
        model.addAttribute("configuracao", config);
        return "admin-configuracoes";
    }

    @PostMapping("/configuracoes")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> salvarConfiguracao(@RequestBody ConfiguracaoBarbearia configuracao) {
        Map<String, Object> response = new HashMap<>();

        ConfiguracaoBarbearia atual = configuracaoBarbeariaRepository.findAll().stream().findFirst()
            .orElse(new ConfiguracaoBarbearia());

        atual.setNomeLoja(configuracao.getNomeLoja());
        atual.setTelefone(configuracao.getTelefone());
        atual.setEndereco(configuracao.getEndereco());
        atual.setHorarioAbertura(configuracao.getHorarioAbertura());
        atual.setHorarioFechamento(configuracao.getHorarioFechamento());
        atual.setIntervaloMinutos(configuracao.getIntervaloMinutos());
        atual.setDiasFuncionamento(configuracao.getDiasFuncionamento());
        atual.setTextoBanner(configuracao.getTextoBanner());

        configuracaoBarbeariaRepository.save(atual);

        response.put("success", true);
        response.put("message", "Configurações salvas com sucesso!");
        return ResponseEntity.ok(response);
    }
}
