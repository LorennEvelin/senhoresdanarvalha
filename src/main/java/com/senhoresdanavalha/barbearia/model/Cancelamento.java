package com.senhoresdanavalha.barbearia.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cancelamentos")
public class Cancelamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agendamento_id", nullable = false, unique = true)
    private Agendamento agendamento;

    @Column(nullable = false, length = 1000)
    private String motivo;

    @Column(nullable = false)
    private LocalDateTime dataCancelamento = LocalDateTime.now();

    public Cancelamento() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Agendamento getAgendamento() { return agendamento; }
    public void setAgendamento(Agendamento agendamento) { this.agendamento = agendamento; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public LocalDateTime getDataCancelamento() { return dataCancelamento; }
    public void setDataCancelamento(LocalDateTime dataCancelamento) { this.dataCancelamento = dataCancelamento; }
}
