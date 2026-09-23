package com.senhoresdanavalha.barbearia.repository;

import com.senhoresdanavalha.barbearia.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServicoRepository extends JpaRepository<Servico, Long> {
}
