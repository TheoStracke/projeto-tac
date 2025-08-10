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
        criarEmpresaSeNaoExistir("43403910000128", "Rede Vellum", "docuflowrepositoryrv@gmail.com", "#r3d3v3llum@1029384756", TipoEmpresa.ESTRADA_FACIL);
        criarEmpresaSeNaoExistir("20692051000139", "Estrada Fácil", "suporte@estradafacil.com.br", "3str@adaF2c1il#", TipoEmpresa.ESTRADA_FACIL);
        // Empresa de teste genérica
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
