package com.senhoresdanavalha.barbearia.repository;

import com.senhoresdanavalha.barbearia.model.ConfiguracaoBarbearia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfiguracaoBarbeariaRepository extends JpaRepository<ConfiguracaoBarbearia, Long> {
}
