package com.validacao.repository;

import com.validacao.model.EnvioCertificado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EnvioCertificadoRepository extends JpaRepository<EnvioCertificado, Long> {
    List<EnvioCertificado> findByDespachanteIdOrderByDataEnvioDesc(Long despachanteId);
    List<EnvioCertificado> findByMotoristaIdOrderByDataEnvioDesc(Long motoristaId);

    @Query("SELECT ec FROM EnvioCertificado ec WHERE ec.dataEnvio BETWEEN :inicio AND :fim")
    List<EnvioCertificado> findByDataEnvioBetween(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
