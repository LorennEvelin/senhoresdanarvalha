package com.senhoresdanavalha.barbearia.model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "configuracoes_barbearia")
public class ConfiguracaoBarbearia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeLoja = "Senhores da Navalha";

    @Column(nullable = false)
    private String telefone = "(11) 99999-0000";

    @Column(nullable = false)
    private String endereco = "Rua das Barbas, 120 - Centro";

    @Column(nullable = false)
    private LocalTime horarioAbertura = LocalTime.of(9, 0);

    @Column(nullable = false)
    private LocalTime horarioFechamento = LocalTime.of(19, 0);

    @Column(nullable = false)
    private Integer intervaloMinutos = 30;

    @Column(nullable = false)
    private String diasFuncionamento = "Segunda a Sábado";

    @Column(length = 500)
    private String textoBanner = "Estilo que fala por si";

    public ConfiguracaoBarbearia() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomeLoja() { return nomeLoja; }
    public void setNomeLoja(String nomeLoja) { this.nomeLoja = nomeLoja; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public LocalTime getHorarioAbertura() { return horarioAbertura; }
    public void setHorarioAbertura(LocalTime horarioAbertura) { this.horarioAbertura = horarioAbertura; }

    public LocalTime getHorarioFechamento() { return horarioFechamento; }
    public void setHorarioFechamento(LocalTime horarioFechamento) { this.horarioFechamento = horarioFechamento; }

    public Integer getIntervaloMinutos() { return intervaloMinutos; }
    public void setIntervaloMinutos(Integer intervaloMinutos) { this.intervaloMinutos = intervaloMinutos; }

    public String getDiasFuncionamento() { return diasFuncionamento; }
    public void setDiasFuncionamento(String diasFuncionamento) { this.diasFuncionamento = diasFuncionamento; }

    public String getTextoBanner() { return textoBanner; }
    public void setTextoBanner(String textoBanner) { this.textoBanner = textoBanner; }
}
