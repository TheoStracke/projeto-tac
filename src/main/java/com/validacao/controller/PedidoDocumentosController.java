package com.validacao.controller;

import com.validacao.model.PedidoDocumentos;
import com.validacao.model.Documento;
import com.validacao.model.Empresa;
import com.validacao.repository.EmpresaRepository;
import com.validacao.repository.PedidoDocumentosRepository;
// ...existing code...
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoDocumentosController {
    @Autowired
    private PedidoDocumentosRepository pedidoRepository;
    @Autowired
    private EmpresaRepository empresaRepository;
    // ...existing code...

    @PostMapping("/enviar")
    public ResponseEntity<?> enviarPedido(
            @RequestParam("arquivos") List<MultipartFile> arquivos,
            @RequestParam("titulo") String titulo,
            @RequestParam("descricao") String descricao,
            @RequestParam("nomeMotorista") String nomeMotorista,
            @RequestParam("cpf") String cpf,
            @RequestParam("dataNascimento") String dataNascimento,
            @RequestParam("sexo") String sexo,
            @RequestParam("email") String email,
            @RequestParam("identidade") String identidade,
            @RequestParam("orgaoEmissor") String orgaoEmissor,
            @RequestParam("ufEmissor") String ufEmissor,
            @RequestParam("telefone") String telefone,
            @RequestParam("curso") String curso,
            @RequestParam("empresaId") Long empresaId
    ) {
        if (arquivos == null || arquivos.size() < 2 || arquivos.size() > 3) {
            return ResponseEntity.badRequest().body("É obrigatório enviar entre 2 e 3 arquivos.");
        }
        if (!"TAC".equalsIgnoreCase(curso) && !"RT".equalsIgnoreCase(curso)) {
            return ResponseEntity.badRequest().body("Curso deve ser 'TAC' ou 'RT'");
        }
        Empresa empresa = empresaRepository.findById(empresaId).orElse(null);
        if (empresa == null) {
            return ResponseEntity.badRequest().body("Empresa não encontrada");
        }
        PedidoDocumentos pedido = new PedidoDocumentos();
        pedido.setEmpresaRemetente(empresa);
        pedido.setTitulo(titulo);
        pedido.setDescricao(descricao);
        pedido.setNomeMotorista(nomeMotorista);
        pedido.setCpf(cpf);
        pedido.setDataNascimento(dataNascimento);
        pedido.setSexo(sexo);
        pedido.setEmail(email);
        pedido.setIdentidade(identidade);
        pedido.setOrgaoEmissor(orgaoEmissor);
        pedido.setUfEmissor(ufEmissor);
        pedido.setTelefone(telefone);
        pedido.setCurso(curso);
        pedido.setDataEnvio(LocalDateTime.now());
        pedido.setStatus("PENDENTE");
        List<Documento> docs = new ArrayList<>();
        for (MultipartFile unused : arquivos) { // variável não utilizada
            Documento doc = new Documento();
            doc.setTitulo(titulo);
            doc.setDescricao(descricao);
            doc.setNomeMotorista(nomeMotorista);
            doc.setCpf(cpf);
            doc.setDataNascimento(dataNascimento);
            doc.setSexo(sexo);
            doc.setEmail(email);
            doc.setIdentidade(identidade);
            doc.setOrgaoEmissor(orgaoEmissor);
            doc.setUfEmissor(ufEmissor);
            doc.setTelefone(telefone);
            // Define o curso correto
            doc.setCursoTACCompleto("TAC".equalsIgnoreCase(curso));
            doc.setCursoRTCompleto("RT".equalsIgnoreCase(curso));
            doc.setEmpresaRemetente(empresa);
            doc.setDataEnvio(LocalDateTime.now());
            doc.setStatus(com.validacao.model.StatusDocumento.PENDENTE);
            doc.setPedido(pedido);
            // Salvar arquivo físico e setar caminho/nome
            // doc.setArquivoPath(...);
            // doc.setNomeArquivoOriginal(arquivo.getOriginalFilename());
            docs.add(doc);
        }
        pedido.setDocumentos(docs);
        pedidoRepository.save(pedido);
        // Os arquivos ainda precisam ser salvos fisicamente!
        return ResponseEntity.ok(pedido);
    }
    /**
     * Endpoint para listar todos os pedidos com seus documentos (admin)
     */
    @GetMapping
    public ResponseEntity<List<PedidoDocumentos>> listarPedidos() {
        List<PedidoDocumentos> pedidos = pedidoRepository.findAll();
        return ResponseEntity.ok(pedidos);
    }
}
