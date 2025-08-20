package com.validacao.repository;

import com.validacao.model.Empresa;
import com.validacao.model.TipoEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;





@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    Optional<Empresa> findByCnpj(String cnpj);
    List<Empresa> findByTipo(TipoEmpresa tipo);

    // Busca despachantes por CNPJ parcial (apenas tipo DESPACHANTE)
    @org.springframework.data.jpa.repository.Query("SELECT e FROM Empresa e WHERE e.tipo = com.validacao.model.TipoEmpresa.DESPACHANTE AND REPLACE(REPLACE(REPLACE(REPLACE(e.cnpj, '.', ''), '-', ''), '/', ''), ' ', '') LIKE %:cnpjParcial%")
    java.util.List<Empresa> buscarDespachantesPorCnpjParcial(@org.springframework.data.repository.query.Param("cnpjParcial") String cnpjParcial);
}
