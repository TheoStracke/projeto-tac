package com.validacao.controller;

import com.validacao.model.Empresa;
import com.validacao.service.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {

    @Autowired
    private EmpresaService empresaService;

    // Endpoint profissional para autocomplete de despachante por CNPJ
    @GetMapping("/buscar")
    public ResponseEntity<List<Empresa>> buscarEmpresasPorCnpj(@RequestParam String cnpj) {
        List<Empresa> empresas = empresaService.buscarDespachantesPorCnpjParcial(cnpj);
        return ResponseEntity.ok(empresas);
    }
}
