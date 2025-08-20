package com.validacao.repository;

import com.validacao.model.Motorista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MotoristaRepository extends JpaRepository<Motorista, Long> {
    @Query("SELECT m FROM Motorista m WHERE m.cpf LIKE %:termo% OR UPPER(m.nome) LIKE UPPER(CONCAT('%', :termo, '%')) ORDER BY m.nome")
    List<Motorista> findByCpfOrNomeContaining(@Param("termo") String termo);
    Optional<Motorista> findByCpf(String cpf);
}
