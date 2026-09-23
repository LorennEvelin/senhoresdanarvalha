package com.senhoresdanavalha.barbearia.repository;

import com.senhoresdanavalha.barbearia.model.Agendamento;
import com.senhoresdanavalha.barbearia.model.Barbeiro;
import com.senhoresdanavalha.barbearia.model.StatusAgendamento;
import com.senhoresdanavalha.barbearia.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    List<Agendamento> findByUsuarioOrderByDataAgendamentoDescHorarioDesc(Usuario usuario);

    List<Agendamento> findByBarbeiroAndDataAgendamentoOrderByHorario(Barbeiro barbeiro, LocalDate data);

    @Query("SELECT a FROM Agendamento a WHERE a.barbeiro.id = :barbeiroId AND a.dataAgendamento = :data AND a.horario = :horario AND a.status <> 'CANCELADO'")
    List<Agendamento> findByBarbeiroDataAndHorario(Long barbeiroId, LocalDate data, LocalTime horario);

    List<Agendamento> findByStatus(StatusAgendamento status);
}
