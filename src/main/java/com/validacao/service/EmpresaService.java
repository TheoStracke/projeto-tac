package com.validacao.service;

import com.validacao.model.Empresa;
import com.validacao.model.TipoEmpresa;
import com.validacao.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service
public class EmpresaService {
    // Busca despachantes por CNPJ parcial (para autocomplete, consulta otimizada no banco)
    public List<Empresa> buscarDespachantesPorCnpjParcial(String cnpjParcial) {
        // Remove caracteres não numéricos
        String cnpjLimpo = cnpjParcial.replaceAll("[^0-9]", "");
        return empresaRepository.buscarDespachantesPorCnpjParcial(cnpjLimpo);
    }
    @Autowired
    private EmpresaRepository empresaRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Empresa salvar(Empresa empresa) {
        // Sempre criptografar senha se ela não estiver já criptografada
        if (empresa.getSenha() != null && !empresa.getSenha().startsWith("$2a$")) {
            String senhaOriginal = empresa.getSenha();
            String senhaCriptografada = passwordEncoder.encode(senhaOriginal);
            empresa.setSenha(senhaCriptografada);
        }
        
        return empresaRepository.save(empresa);
    }
    
    public Optional<Empresa> autenticar(String cnpj, String senha) {
        Optional<Empresa> empresaOpt = empresaRepository.findByCnpj(cnpj);
        
        if (empresaOpt.isPresent()) {
            Empresa empresa = empresaOpt.get();
            
            // Verificar se a senha bate (considerando senhas já hasheadas e não hasheadas para desenvolvimento)
            boolean senhaCorreta = false;
            
            if (empresa.getSenha().startsWith("$2a$")) {
                senhaCorreta = passwordEncoder.matches(senha, empresa.getSenha());
            } else {
                senhaCorreta = senha != null && senha.equals(empresa.getSenha());
                
                // Se a senha está correta, aproveitar para hashear
                if (senhaCorreta) {
                    empresa.setSenha(passwordEncoder.encode(senha));
                    empresaRepository.save(empresa);
                }
            }
            
            if (senhaCorreta) {
                return Optional.of(empresa);
            }
        }
        
        return Optional.empty();
    }
    
    public Optional<Empresa> buscarPorCnpj(String cnpj) {
        return empresaRepository.findByCnpj(cnpj);
    }
    
    public List<Empresa> listarTodas() {
        return empresaRepository.findAll();
    }
    
    public List<Empresa> buscarPorTipo(TipoEmpresa tipo) {
        return empresaRepository.findByTipo(tipo);
    }
    
    public boolean isEstradaFacil(String cnpj) {
        // CNPJs específicos que são ESTRADA_FACIL (ADMIN)
        return "43.403.910/0001-28".equals(cnpj) || "20.692.051/0001-39".equals(cnpj);
    }
    
    public boolean isAdmin(String cnpj) {
        return isEstradaFacil(cnpj);
    }
}
