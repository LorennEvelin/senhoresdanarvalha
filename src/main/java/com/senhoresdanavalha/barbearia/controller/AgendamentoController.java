package com.senhoresdanavalha.barbearia.controller;

import com.senhoresdanavalha.barbearia.model.*;
import com.senhoresdanavalha.barbearia.repository.AgendamentoRepository;
import com.senhoresdanavalha.barbearia.repository.BarbeiroRepository;
import com.senhoresdanavalha.barbearia.repository.ServicoRepository;
import com.senhoresdanavalha.barbearia.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AgendamentoController {

    private final AgendamentoRepository agendamentoRepository;
    private final BarbeiroRepository barbeiroRepository;
    private final ServicoRepository servicoRepository;
    private final UsuarioRepository usuarioRepository;

    public AgendamentoController(AgendamentoRepository agendamentoRepository,
                                BarbeiroRepository barbeiroRepository,
                                ServicoRepository servicoRepository,
                                UsuarioRepository usuarioRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.barbeiroRepository = barbeiroRepository;
        this.servicoRepository = servicoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/servicos")
    public List<Servico> listarServicos() {
        return servicoRepository.findAll();
    }

    @GetMapping("/barbeiros")
    public List<Barbeiro> listarBarbeiros() {
        return barbeiroRepository.findAll();
    }

    @GetMapping("/agendamentos/disponibilidade")
    public ResponseEntity<Map<String, Object>> disponibilidade(@RequestParam Long barbeiroId,
                                                              @RequestParam String data) {
        Barbeiro barbeiro = barbeiroRepository.findById(barbeiroId).orElseThrow();
        LocalDate localDate = LocalDate.parse(data);
        List<Agendamento> agendamentos = agendamentoRepository.findByBarbeiroAndDataAgendamentoOrderByHorario(barbeiro, localDate);

        Map<String, Object> response = new HashMap<>();
        response.put("data", localDate.toString());
        response.put("ocupados", agendamentos.stream().map(Agendamento::getHorario).toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/agendamentos")
    public ResponseEntity<Map<String, Object>> criarAgendamento(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();

        try {
            Long barbeiroId = Long.valueOf(payload.get("barbeiroId").toString());
            Long servicoId = Long.valueOf(payload.get("servicoId").toString());
            LocalDate data = LocalDate.parse(payload.get("data").toString());
            LocalTime horario = LocalTime.parse(payload.get("horario").toString());

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Usuario usuario = usuarioRepository.findByEmail(authentication.getName()).orElseThrow();
            Barbeiro barbeiro = barbeiroRepository.findById(barbeiroId).orElseThrow();
            Servico servico = servicoRepository.findById(servicoId).orElseThrow();

            List<Agendamento> conflitos = agendamentoRepository.findByBarbeiroDataAndHorario(barbeiroId, data, horario);
            if (!conflitos.isEmpty()) {
                response.put("success", false);
                response.put("message", "Este horário já está ocupado para o barbeiro selecionado.");
                return ResponseEntity.badRequest().body(response);
            }

            Agendamento agendamento = new Agendamento();
            agendamento.setUsuario(usuario);
            agendamento.setBarbeiro(barbeiro);
            agendamento.setServico(servico);
            agendamento.setDataAgendamento(data);
            agendamento.setHorario(horario);
            agendamento.setStatus(StatusAgendamento.PENDENTE);
            agendamentoRepository.save(agendamento);

            response.put("success", true);
            response.put("message", "Agendamento realizado com sucesso!");
            response.put("agendamentoId", agendamento.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Não foi possível criar o agendamento: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/agendamentos/{id}/cancelar")
    public ResponseEntity<Map<String, Object>> cancelarAgendamento(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Usuario usuario = usuarioRepository.findByEmail(authentication.getName()).orElseThrow();
            Agendamento agendamento = agendamentoRepository.findById(id).orElseThrow();

            if (!agendamento.getUsuario().getId().equals(usuario.getId())) {
                response.put("success", false);
                response.put("message", "Você não pode cancelar este agendamento.");
                return ResponseEntity.status(403).body(response);
            }

            if (agendamento.getStatus() == StatusAgendamento.CANCELADO) {
                response.put("success", true);
                response.put("message", "Este agendamento já está cancelado.");
                return ResponseEntity.ok(response);
            }

            agendamento.setStatus(StatusAgendamento.CANCELADO);
            agendamentoRepository.save(agendamento);

            response.put("success", true);
            response.put("message", "Agendamento cancelado com sucesso.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Não foi possível cancelar o agendamento.");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
