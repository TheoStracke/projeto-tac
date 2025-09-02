
package com.validacao.controller;

import com.validacao.model.PedidoDocumentos;
import com.validacao.model.Documento;
import com.validacao.model.Empresa;
import com.validacao.model.Motorista;
import com.validacao.repository.EmpresaRepository;
import com.validacao.repository.PedidoDocumentosRepository;
import com.validacao.repository.MotoristaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoDocumentosController {
    @Autowired
    private PedidoDocumentosRepository pedidoRepository;
    @Autowired
    private EmpresaRepository empresaRepository;
    @Autowired
    private MotoristaRepository motoristaRepository;

    // LOGS DE DEBUG PARA O FRONTEND
    private static final List<String> debugLogs = new CopyOnWriteArrayList<>();

    private void addDebugLog(String msg) {
        String log = LocalDateTime.now() + " | " + msg;
        debugLogs.add(log);
        if (debugLogs.size() > 100) debugLogs.remove(0);
        System.out.println(log);
    }

    @GetMapping("/debug/logs")
    public ResponseEntity<List<String>> getDebugLogs() {
        return ResponseEntity.ok(new ArrayList<>(debugLogs));
    }

    @PostMapping("/enviar")
    public ResponseEntity<?> enviarPedido(
            @RequestParam("arquivos") List<MultipartFile> arquivos,
            @RequestParam("titulo") String titulo,
            @RequestParam("descricao") String descricao,
            @RequestParam("motoristaId") Long motoristaId,
            @RequestParam("empresaId") Long empresaId
    ) {
        if (arquivos == null || arquivos.size() < 2 || arquivos.size() > 3) {
            return ResponseEntity.badRequest().body("É obrigatório enviar entre 2 e 3 arquivos.");
        }
        Empresa empresa = empresaRepository.findById(empresaId).orElse(null);
        if (empresa == null) {
            return ResponseEntity.badRequest().body("Empresa não encontrada");
        }
        // Busca motorista
        Motorista motorista = motoristaRepository.findById(motoristaId).orElse(null);
        if (motorista == null) {
            return ResponseEntity.badRequest().body("Motorista não encontrado");
        }
        PedidoDocumentos pedido = new PedidoDocumentos();
        pedido.setEmpresaRemetente(empresa);
        pedido.setTitulo(titulo);
        pedido.setDescricao(descricao);
        pedido.setNomeMotorista(motorista.getNome());
        pedido.setCpf(motorista.getCpf());
        pedido.setDataNascimento(motorista.getDataNascimento() != null ? motorista.getDataNascimento().toString() : null);
        pedido.setSexo(motorista.getSexo());
        pedido.setEmail(motorista.getEmail());
        pedido.setIdentidade(null); // Se quiser, adicione campo no Motorista
        pedido.setOrgaoEmissor(null); // Se quiser, adicione campo no Motorista
        pedido.setUfEmissor(null); // Se quiser, adicione campo no Motorista
        pedido.setTelefone(motorista.getTelefone());
        pedido.setCurso(null); // Se quiser, adicione campo no Motorista
        addDebugLog("[SALVANDO PEDIDO] curso=" + pedido.getCurso() + ", ufEmissor=" + pedido.getUfEmissor());
        pedido.setDataEnvio(LocalDateTime.now());
        pedido.setStatus("PENDENTE");
        List<Documento> docs = new ArrayList<>();
        for (int i = 0; i < arquivos.size(); i++) {
            Documento doc = new Documento();
            doc.setTitulo(titulo);
            doc.setDescricao(descricao);
            doc.setNomeMotorista(motorista.getNome());
            doc.setCpf(motorista.getCpf());
            doc.setDataNascimento(motorista.getDataNascimento() != null ? motorista.getDataNascimento().toString() : null);
            doc.setSexo(motorista.getSexo());
            doc.setEmail(motorista.getEmail());
            doc.setIdentidade(null); // Se quiser, adicione campo no Motorista
            doc.setOrgaoEmissor(null); // Se quiser, adicione campo no Motorista
            doc.setUfEmissor(null); // Se quiser, adicione campo no Motorista
            doc.setTelefone(motorista.getTelefone());
            doc.setCurso(null); // Se quiser, adicione campo no Motorista
            addDebugLog("[SALVANDO DOCUMENTO] curso=" + doc.getCurso() + ", ufEmissor=" + doc.getUfEmissor());
            doc.setCursoTACCompleto(false);
            doc.setCursoRTCompleto(false);
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
        addDebugLog("[ENVIAR PEDIDO] Salvando pedido para empresaRemetente.id=" + (empresa != null ? empresa.getId() : "null"));
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

    /**
     * Endpoint para listar pedidos de uma empresa específica (despachante)
     */
    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<PedidoDocumentos>> listarPedidosPorEmpresa(@PathVariable Long empresaId) {
        List<PedidoDocumentos> pedidosEmpresa = pedidoRepository.findByEmpresaRemetenteId(empresaId);
        addDebugLog("[LISTAR PEDIDOS POR EMPRESA] empresaId=" + empresaId + ", encontrados=" + pedidosEmpresa.size());
        for (PedidoDocumentos p : pedidosEmpresa) {
            addDebugLog("  Pedido id=" + p.getId() + ", empresaRemetente.id=" + (p.getEmpresaRemetente() != null ? p.getEmpresaRemetente().getId() : "null") + ", status=" + p.getStatus());
        }
        return ResponseEntity.ok(pedidosEmpresa);
    }
}
