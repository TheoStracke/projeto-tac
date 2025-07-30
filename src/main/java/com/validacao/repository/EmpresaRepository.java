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
}
