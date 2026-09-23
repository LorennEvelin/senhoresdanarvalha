package com.senhoresdanavalha.barbearia.repository;

import com.senhoresdanavalha.barbearia.model.Barbeiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BarbeiroRepository extends JpaRepository<Barbeiro, Long> {
}
