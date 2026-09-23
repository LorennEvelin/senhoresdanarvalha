package com.senhoresdanavalha.barbearia.repository;

import com.senhoresdanavalha.barbearia.model.Cancelamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CancelamentoRepository extends JpaRepository<Cancelamento, Long> {
}
