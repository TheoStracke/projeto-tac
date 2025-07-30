package com.validacao.repository;

import com.validacao.model.Documento;
import com.validacao.model.StatusDocumento;
import com.validacao.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface DocumentoRepository extends JpaRepository<Documento, Long> {
    Optional<Documento> findByTokenAprovacao(String tokenAprovacao);
    List<Documento> findByEmpresaRemetente(Empresa empresa);
    List<Documento> findByStatus(StatusDocumento status);
    List<Documento> findByEmpresaRemetenteOrderByDataEnvioDesc(Empresa empresa);
}
