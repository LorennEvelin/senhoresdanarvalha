package com.senhoresdanavalha.barbearia.controller;

import com.senhoresdanavalha.barbearia.model.Servico;
import com.senhoresdanavalha.barbearia.repository.ServicoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiConfiguracaoController {

    private final ServicoRepository servicoRepository;

    public ApiConfiguracaoController(ServicoRepository servicoRepository) {
        this.servicoRepository = servicoRepository;
    }

    @PutMapping("/servicos/{id}")
    public ResponseEntity<Map<String, Object>> atualizarServico(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();

        Servico servico = servicoRepository.findById(id).orElse(null);
        if (servico == null) {
            response.put("success", false);
            response.put("message", "Serviço não encontrado.");
            return ResponseEntity.badRequest().body(response);
        }

        servico.setNome(String.valueOf(payload.getOrDefault("nome", servico.getNome())));
        servico.setDescricao(String.valueOf(payload.getOrDefault("descricao", servico.getDescricao())));
        servico.setValor(new java.math.BigDecimal(String.valueOf(payload.getOrDefault("valor", servico.getValor()))));
        servico.setDuracao(Integer.parseInt(String.valueOf(payload.getOrDefault("duracao", servico.getDuracao()))));

        servicoRepository.save(servico);

        response.put("success", true);
        response.put("message", "Serviço atualizado com sucesso.");
        return ResponseEntity.ok(response);
    }
}
