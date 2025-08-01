package com.validacao.config;

import com.validacao.model.Empresa;
import com.validacao.model.TipoEmpresa;
import com.validacao.service.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private EmpresaService empresaService;

    @Override
    public void run(String... args) throws Exception {
        // CNPJs ADMIN (ESTRADA_FACIL) - podem aprovar documentos
        criarEmpresaSeNaoExistir("43403910000128", "Estrada Fácil - Admin 1", "admin1@estradafacil.com.br", "senha123", TipoEmpresa.ESTRADA_FACIL);
        criarEmpresaSeNaoExistir("20692051000139", "Estrada Fácil - Admin 2", "admin2@estradafacil.com.br", "senha123", TipoEmpresa.ESTRADA_FACIL);
        
        // CNPJs de teste para DESPACHANTES (apenas enviam documentos)
        criarEmpresaSeNaoExistir("11111111000111", "Despachante Teste 1", "despachante1@example.com", "senha123", TipoEmpresa.DESPACHANTE);
        criarEmpresaSeNaoExistir("22222222000222", "Despachante Teste 2", "despachante2@example.com", "senha123", TipoEmpresa.DESPACHANTE);
        criarEmpresaSeNaoExistir("33333333000333", "Despachante Teste 3", "despachante3@example.com", "senha123", TipoEmpresa.DESPACHANTE);
        
        // Empresa de teste genérica
        criarEmpresaSeNaoExistir("60811733000138", "Empresa Genérica LTDA", "teste@empresa.com", "123456", TipoEmpresa.DESPACHANTE);
    }
    
    private void criarEmpresaSeNaoExistir(String cnpj, String razaoSocial, String email, String senha, TipoEmpresa tipo) {
        if (empresaService.buscarPorCnpj(cnpj).isEmpty()) {
            Empresa empresa = new Empresa();
            empresa.setCnpj(cnpj);
            empresa.setRazaoSocial(razaoSocial);
            empresa.setEmail(email);
            empresa.setSenha(senha);
            empresa.setTipo(tipo);
            
            empresaService.salvar(empresa);
        }
    }
}
