# Relatório Completo - Backend para Funcionalidade "Enviar Certificado"

## 📋 Visão Geral

Este relatório detalha a implementação necessária no backend (Spring Boot) para suportar a funcionalidade "Enviar Certificado" desenvolvida no frontend React. A funcionalidade permite que administradores enviem certificados por e-mail para despachantes selecionados, associados a motoristas específicos.

## 🎯 Funcionalidades Implementadas no Frontend

### 1. **EnviarCertificadoModal.jsx**
- Modal responsivo com Material-UI
- Busca de despachantes por CNPJ (autocomplete)
- Busca de motoristas por CPF ou nome (autocomplete)
- Upload de arquivos com validação (PDF, JPG, PNG até 10MB)
- Campo opcional para observações
- Barra de progresso durante envio
- Validações completas no frontend

### 2. **Dashboard.jsx - Área do Administrador**
- Botão "Enviar Certificado" visível apenas para administradores (tipo ESTRADA_FACIL)
- Integração com o modal de envio
- Feedback visual de sucesso/erro

### 3. **api.js - Serviços Frontend**
- `buscarEmpresasPorCnpj(cnpj)` - GET /api/empresas/buscar?cnpj={cnpj}
- `buscarMotoristasPorCpfOuNome(termo)` - GET /api/motoristas/buscar?termo={termo}
- `enviarCertificado(dados)` - POST /api/certificados/enviar (multipart/form-data)

## 🏗️ Estrutura Backend Necessária

### 1. **Modelos (Entities)**

#### 1.1 Empresa/Despachante (provavelmente já existe)
```java
@Entity
@Table(name = "empresas")
public class Empresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String razaoSocial;
    
    @Column(unique = true, nullable = false)
    private String cnpj;
    
    @Column(nullable = false)
    private String email;
    
    @Enumerated(EnumType.STRING)
    private TipoEmpresa tipo; // DESPACHANTE, ESTRADA_FACIL
    
    private String telefone;
    private String endereco;
    
    // getters e setters
}
```

#### 1.2 Motorista (provavelmente já existe)
```java
@Entity
@Table(name = "motoristas")
public class Motorista {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nome;
    
    @Column(unique = true, nullable = false)
    private String cpf;
    
    private String cnh;
    private String email;
    private String telefone;
    
    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;
    
    // getters e setters
}
```

#### 1.3 EnvioCertificado (nova entidade)
```java
@Entity
@Table(name = "envios_certificado")
public class EnvioCertificado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "despachante_id", nullable = false)
    private Empresa despachante;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorista_id", nullable = false)
    private Motorista motorista;
    
    @Column(name = "nome_arquivo_original", nullable = false)
    private String nomeArquivoOriginal;
    
    @Column(name = "caminho_arquivo", nullable = false)
    private String caminhoArquivo;
    
    @Column(name = "tipo_arquivo")
    private String tipoArquivo;
    
    @Column(name = "tamanho_arquivo")
    private Long tamanhoArquivo;
    
    @Column(columnDefinition = "TEXT")
    private String observacoes;
    
    @Column(name = "data_envio", nullable = false)
    private LocalDateTime dataEnvio;
    
    @Column(name = "enviado_por", nullable = false)
    private String enviadoPor; // ID ou nome do admin
    
    @Enumerated(EnumType.STRING)
    private StatusEnvio status; // ENVIADO, ERRO, PENDENTE
    
    // getters e setters
}

enum StatusEnvio {
    PENDENTE, ENVIADO, ERRO
}
```

### 2. **Repositories**

#### 2.1 EmpresaRepository
```java
@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    
    @Query("SELECT e FROM Empresa e WHERE e.cnpj LIKE %:cnpj% AND e.tipo = 'DESPACHANTE'")
    List<Empresa> findDespachantesByCnpjContaining(@Param("cnpj") String cnpj);
    
    @Query("SELECT e FROM Empresa e WHERE e.tipo = 'DESPACHANTE' ORDER BY e.razaoSocial")
    List<Empresa> findAllDespachantes();
}
```

#### 2.2 MotoristaRepository
```java
@Repository
public interface MotoristaRepository extends JpaRepository<Motorista, Long> {
    
    @Query("SELECT m FROM Motorista m WHERE m.cpf LIKE %:termo% OR " +
           "UPPER(m.nome) LIKE UPPER(CONCAT('%', :termo, '%')) ORDER BY m.nome")
    List<Motorista> findByCpfOrNomeContaining(@Param("termo") String termo);
    
    Optional<Motorista> findByCpf(String cpf);
}
```

#### 2.3 EnvioCertificadoRepository
```java
@Repository
public interface EnvioCertificadoRepository extends JpaRepository<EnvioCertificado, Long> {
    
    List<EnvioCertificado> findByDespachanteIdOrderByDataEnvioDesc(Long despachanteId);
    
    List<EnvioCertificado> findByMotoristaIdOrderByDataEnvioDesc(Long motoristaId);
    
    @Query("SELECT ec FROM EnvioCertificado ec WHERE ec.dataEnvio BETWEEN :inicio AND :fim")
    List<EnvioCertificado> findByDataEnvioBetween(
        @Param("inicio") LocalDateTime inicio, 
        @Param("fim") LocalDateTime fim
    );
}
```

### 3. **DTOs**

#### 3.1 EmpresaDTO
```java
public class EmpresaDTO {
    private Long id;
    private String razaoSocial;
    private String cnpj;
    private String email;
    private String telefone;
    
    // constructors, getters e setters
    
    public static EmpresaDTO fromEntity(Empresa empresa) {
        return new EmpresaDTO(
            empresa.getId(),
            empresa.getRazaoSocial(),
            empresa.getCnpj(),
            empresa.getEmail(),
            empresa.getTelefone()
        );
    }
}
```

#### 3.2 MotoristaDTO
```java
public class MotoristaDTO {
    private Long id;
    private String nome;
    private String cpf;
    private String cnh;
    
    // constructors, getters e setters
    
    public static MotoristaDTO fromEntity(Motorista motorista) {
        return new MotoristaDTO(
            motorista.getId(),
            motorista.getNome(),
            motorista.getCpf(),
            motorista.getCnh()
        );
    }
}
```

#### 3.3 EnviarCertificadoRequest
```java
public class EnviarCertificadoRequest {
    @NotNull
    private Long despachanteId;
    
    @NotNull
    private Long motoristaId;
    
    private String observacoes;
    
    // getters e setters
}
```

### 4. **Controllers**

#### 4.1 EmpresaController (adicionar endpoint)
```java
@RestController
@RequestMapping("/api/empresas")
@PreAuthorize("hasRole('ADMIN')") // Apenas admins
public class EmpresaController {
    
    @Autowired
    private EmpresaService empresaService;
    
    @GetMapping("/buscar")
    public ResponseEntity<List<EmpresaDTO>> buscarEmpresasPorCnpj(
            @RequestParam String cnpj) {
        
        List<EmpresaDTO> empresas = empresaService.buscarDespachantesPorCnpj(cnpj);
        return ResponseEntity.ok(empresas);
    }
}
```

#### 4.2 MotoristaController (adicionar endpoint)
```java
@RestController
@RequestMapping("/api/motoristas")
@PreAuthorize("hasRole('ADMIN')") // Apenas admins
public class MotoristaController {
    
    @Autowired
    private MotoristaService motoristaService;
    
    @GetMapping("/buscar")
    public ResponseEntity<List<MotoristaDTO>> buscarMotoristas(
            @RequestParam String termo) {
        
        List<MotoristaDTO> motoristas = motoristaService.buscarPorCpfOuNome(termo);
        return ResponseEntity.ok(motoristas);
    }
}
```

#### 4.3 CertificadoController (novo)
```java
@RestController
@RequestMapping("/api/certificados")
@PreAuthorize("hasRole('ADMIN')") // Apenas admins
public class CertificadoController {
    
    @Autowired
    private CertificadoService certificadoService;
    
    @PostMapping("/enviar")
    public ResponseEntity<?> enviarCertificado(
            @RequestParam("despachanteId") Long despachanteId,
            @RequestParam("motoristaId") Long motoristaId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "observacoes", required = false) String observacoes,
            Authentication authentication) {
        
        try {
            // Validações
            if (arquivo.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Arquivo é obrigatório"));
            }
            
            // Validar tipo de arquivo
            String contentType = arquivo.getContentType();
            if (!Arrays.asList("application/pdf", "image/jpeg", "image/png", "image/jpg")
                    .contains(contentType)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Tipo de arquivo não permitido"));
            }
            
            // Validar tamanho (10MB)
            if (arquivo.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Arquivo muito grande. Máximo: 10MB"));
            }
            
            EnviarCertificadoRequest request = new EnviarCertificadoRequest();
            request.setDespachanteId(despachanteId);
            request.setMotoristaId(motoristaId);
            request.setObservacoes(observacoes);
            
            EnvioCertificado resultado = certificadoService.enviarCertificado(
                request, arquivo, authentication.getName()
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Certificado enviado com sucesso",
                "id", resultado.getId()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erro interno: " + e.getMessage()));
        }
    }
    
    @GetMapping("/historico")
    public ResponseEntity<List<EnvioCertificado>> buscarHistorico(
            @RequestParam(required = false) Long despachanteId,
            @RequestParam(required = false) Long motoristaId) {
        
        List<EnvioCertificado> historico = certificadoService.buscarHistorico(
            despachanteId, motoristaId
        );
        return ResponseEntity.ok(historico);
    }
}
```

### 5. **Services**

#### 5.1 EmpresaService (adicionar método)
```java
@Service
public class EmpresaService {
    
    @Autowired
    private EmpresaRepository empresaRepository;
    
    public List<EmpresaDTO> buscarDespachantesPorCnpj(String cnpj) {
        // Limpar CNPJ (remover caracteres especiais)
        String cnpjLimpo = cnpj.replaceAll("[^0-9]", "");
        
        List<Empresa> empresas = empresaRepository.findDespachantesByCnpjContaining(cnpjLimpo);
        
        return empresas.stream()
            .map(EmpresaDTO::fromEntity)
            .collect(Collectors.toList());
    }
}
```

#### 5.2 MotoristaService (adicionar método)
```java
@Service
public class MotoristaService {
    
    @Autowired
    private MotoristaRepository motoristaRepository;
    
    public List<MotoristaDTO> buscarPorCpfOuNome(String termo) {
        List<Motorista> motoristas = motoristaRepository.findByCpfOrNomeContaining(termo);
        
        return motoristas.stream()
            .map(MotoristaDTO::fromEntity)
            .limit(20) // Limitar resultados
            .collect(Collectors.toList());
    }
}
```

#### 5.3 CertificadoService (novo)
```java
@Service
@Transactional
public class CertificadoService {
    
    @Autowired
    private EnvioCertificadoRepository envioCertificadoRepository;
    
    @Autowired
    private EmpresaRepository empresaRepository;
    
    @Autowired
    private MotoristaRepository motoristaRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    public EnvioCertificado enviarCertificado(
            EnviarCertificadoRequest request, 
            MultipartFile arquivo, 
            String enviadoPor) {
        
        // Buscar despachante
        Empresa despachante = empresaRepository.findById(request.getDespachanteId())
            .orElseThrow(() -> new RuntimeException("Despachante não encontrado"));
        
        // Buscar motorista
        Motorista motorista = motoristaRepository.findById(request.getMotoristaId())
            .orElseThrow(() -> new RuntimeException("Motorista não encontrado"));
        
        // Salvar arquivo
        String caminhoArquivo = fileStorageService.salvarArquivo(arquivo, "certificados");
        
        // Criar registro
        EnvioCertificado envio = new EnvioCertificado();
        envio.setDespachante(despachante);
        envio.setMotorista(motorista);
        envio.setNomeArquivoOriginal(arquivo.getOriginalFilename());
        envio.setCaminhoArquivo(caminhoArquivo);
        envio.setTipoArquivo(arquivo.getContentType());
        envio.setTamanhoArquivo(arquivo.getSize());
        envio.setObservacoes(request.getObservacoes());
        envio.setDataEnvio(LocalDateTime.now());
        envio.setEnviadoPor(enviadoPor);
        envio.setStatus(StatusEnvio.PENDENTE);
        
        envio = envioCertificadoRepository.save(envio);
        
        // Enviar e-mail
        try {
            emailService.enviarCertificado(despachante, motorista, arquivo, request.getObservacoes());
            envio.setStatus(StatusEnvio.ENVIADO);
        } catch (Exception e) {
            envio.setStatus(StatusEnvio.ERRO);
            throw new RuntimeException("Erro ao enviar e-mail: " + e.getMessage());
        } finally {
            envioCertificadoRepository.save(envio);
        }
        
        return envio;
    }
    
    public List<EnvioCertificado> buscarHistorico(Long despachanteId, Long motoristaId) {
        if (despachanteId != null) {
            return envioCertificadoRepository.findByDespachanteIdOrderByDataEnvioDesc(despachanteId);
        } else if (motoristaId != null) {
            return envioCertificadoRepository.findByMotoristaIdOrderByDataEnvioDesc(motoristaId);
        } else {
            return envioCertificadoRepository.findAll();
        }
    }
}
```

### 6. **EmailService (atualizar)**

```java
@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${app.email.from}")
    private String emailFrom;
    
    public void enviarCertificado(Empresa despachante, Motorista motorista, 
                                 MultipartFile arquivo, String observacoes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(emailFrom);
            helper.setTo(despachante.getEmail());
            helper.setSubject("Certificado - " + motorista.getNome());
            
            String corpo = criarCorpoEmailCertificado(despachante, motorista, observacoes);
            helper.setText(corpo, true);
            
            // Anexar certificado
            helper.addAttachment(arquivo.getOriginalFilename(), arquivo);
            
            mailSender.send(message);
            
        } catch (Exception e) {
            throw new RuntimeException("Erro ao enviar e-mail", e);
        }
    }
    
    private String criarCorpoEmailCertificado(Empresa despachante, Motorista motorista, String observacoes) {
        return String.format("""
            <html>
            <body>
                <h2>Certificado de Motorista</h2>
                <p>Prezado(a) %s,</p>
                
                <p>Segue em anexo o certificado do motorista <strong>%s</strong> (CPF: %s).</p>
                
                %s
                
                <hr>
                <p><small>Sistema de Validação de Documentos - Estrada Fácil</small></p>
            </body>
            </html>
            """, 
            despachante.getRazaoSocial(),
            motorista.getNome(),
            motorista.getCpf(),
            observacoes != null ? "<p><strong>Observações:</strong> " + observacoes + "</p>" : ""
        );
    }
}
```

### 7. **FileStorageService (novo ou atualizar)**

```java
@Service
public class FileStorageService {
    
    @Value("${app.upload.dir}")
    private String uploadDir;
    
    public String salvarArquivo(MultipartFile arquivo, String subdiretorio) {
        try {
            // Criar diretório se não existir
            Path dirPath = Paths.get(uploadDir, subdiretorio);
            Files.createDirectories(dirPath);
            
            // Gerar nome único
            String nomeUnico = UUID.randomUUID().toString() + "_" + arquivo.getOriginalFilename();
            Path filePath = dirPath.resolve(nomeUnico);
            
            // Salvar arquivo
            Files.copy(arquivo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            return filePath.toString();
            
        } catch (Exception e) {
            throw new RuntimeException("Erro ao salvar arquivo", e);
        }
    }
}
```

### 8. **Configurações**

#### 8.1 application.properties (adicionar)
```properties
# Upload de arquivos
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
app.upload.dir=./uploads

# E-mail (já deve existir)
app.email.from=sistema@estradafacil.com
```

#### 8.2 Configuração de Segurança (atualizar)
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/empresas/buscar").hasRole("ADMIN")
                .requestMatchers("/api/motoristas/buscar").hasRole("ADMIN")
                .requestMatchers("/api/certificados/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
```

## 🗃️ Scripts SQL

### Criação da tabela de envios
```sql
CREATE TABLE envios_certificado (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    despachante_id BIGINT NOT NULL,
    motorista_id BIGINT NOT NULL,
    nome_arquivo_original VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    tipo_arquivo VARCHAR(100),
    tamanho_arquivo BIGINT,
    observacoes TEXT,
    data_envio DATETIME NOT NULL,
    enviado_por VARCHAR(100) NOT NULL,
    status ENUM('PENDENTE', 'ENVIADO', 'ERRO') DEFAULT 'PENDENTE',
    
    FOREIGN KEY (despachante_id) REFERENCES empresas(id),
    FOREIGN KEY (motorista_id) REFERENCES motoristas(id),
    
    INDEX idx_despachante (despachante_id),
    INDEX idx_motorista (motorista_id),
    INDEX idx_data_envio (data_envio)
);
```

## ✅ Checklist de Implementação

### Backend
- [ ] Criar entidade `EnvioCertificado`
- [ ] Criar/atualizar repositories com queries necessárias
- [ ] Criar DTOs para `EmpresaDTO` e `MotoristaDTO`
- [ ] Implementar endpoints em `EmpresaController` e `MotoristaController`
- [ ] Criar `CertificadoController` completo
- [ ] Implementar `CertificadoService` com lógica de negócio
- [ ] Atualizar `EmailService` para envio de certificados
- [ ] Implementar/atualizar `FileStorageService`
- [ ] Configurar upload de arquivos no `application.properties`
- [ ] Atualizar configurações de segurança
- [ ] Executar scripts SQL para criar tabelas

### Frontend (✅ Já Implementado)
- [x] Componente `EnviarCertificadoModal`
- [x] Integração no `Dashboard` para admins
- [x] Funções de API no `api.js`
- [x] Validações e feedback visual

### Testes
- [ ] Testes unitários para services
- [ ] Testes de integração para controllers
- [ ] Testes de upload de arquivos
- [ ] Testes de envio de e-mail

## 🔗 Endpoints Resumo

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/empresas/buscar?cnpj=` | Buscar despachantes por CNPJ |
| GET | `/api/motoristas/buscar?termo=` | Buscar motoristas por CPF/nome |
| POST | `/api/certificados/enviar` | Enviar certificado (multipart) |
| GET | `/api/certificados/historico` | Histórico de envios |

## 📝 Observações Finais

1. **Segurança**: Apenas usuários com role ADMIN podem acessar os endpoints
2. **Validações**: Implementar validações robustas tanto no frontend quanto backend
3. **Logs**: Adicionar logs detalhados para auditoria
4. **Performance**: Considerar paginação para grandes volumes de dados
5. **Monitoramento**: Implementar métricas para acompanhar envios
6. **Backup**: Configurar backup dos arquivos de certificado
7. **Ambiente**: Testar em ambiente de desenvolvimento antes da produção

Este relatório fornece uma base sólida para implementar toda a funcionalidade de envio de certificados. A implementação deve ser feita de forma incremental, testando cada componente individualmente.
