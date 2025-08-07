package com.validacao.repository;

import com.validacao.model.PedidoDocumentos;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoDocumentosRepository extends JpaRepository<PedidoDocumentos, Long> {
    java.util.List<PedidoDocumentos> findByEmpresaRemetenteId(Long empresaId);
}
