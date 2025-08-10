# Teste de Diagnóstico CORS - Projeto TAC

## Status Atual
✅ **Passo 2 APLICADO**: Configuração alterada para wildcard `https://*.vercel.app`

## Próximos Passos

### Passo 1: Verificar o Cabeçalho Origin no Navegador

1. **Faça o deploy** da alteração atual no Railway/Vercel backend
2. **Abra seu site** no Vercel frontend
3. **Abra as Ferramentas de Desenvolvedor** (F12)
4. **Vá para a aba "Network" (Rede)**
5. **Provoque o erro de CORS** (tente fazer login)
6. **Clique na requisição com erro** (marcada em vermelho)
7. **Vá para "Headers" (Cabeçalhos)**
8. **Procure por "Origin"** na seção "Request Headers"
9. **Anote exatamente o valor** do cabeçalho Origin

### Passo 2: Teste de Sanidade (JÁ FEITO)
✅ Alterado para `app.cors.allowed-origins=https://*.vercel.app`

### Resultados Esperados

**Se funcionar com wildcard:**
- ✅ Confirma que a lógica Java está correta
- ❌ O problema estava na URL específica
- 🔧 Precisamos corrigir a URL exata

**Se NÃO funcionar com wildcard:**
- ❌ Há um problema mais profundo na configuração
- 🔧 Precisamos investigar outras causas

### Passo 3: Análise dos Resultados

**Caso A - Funcionou com wildcard:**
```properties
# Substitua pela URL EXATA que você viu no cabeçalho Origin
app.cors.allowed-origins=URL_EXATA_DO_ORIGIN
```

**Caso B - Não funcionou:**
Vamos investigar:
- Configuração do Spring Security
- Ordem dos filtros
- Configuração do Vercel
- Headers adicionais

### Passo 4: Configuração Final

Após identificar a URL correta, substitua por:
```properties
# CORS - Produção
app.cors.allowed-origins=URL_CORRETA_AQUI

# OU para múltiplos ambientes:
app.cors.allowed-origins=https://URL_PRODUCAO,http://localhost:5173,http://localhost:3000
```

## Checklist de Verificação

- [ ] Deploy feito com wildcard
- [ ] Teste realizado no frontend
- [ ] Origin identificado no Network tab
- [ ] Resultado documentado (funcionou/não funcionou)
- [ ] URL correta identificada
- [ ] Configuração final aplicada

## Comandos Úteis

```bash
# Para fazer deploy rápido (se usando Railway)
git add .
git commit -m "test: cors wildcard para diagnóstico"
git push

# Para testar localmente
./mvnw spring-boot:run
```

## Observações Importantes

1. **NÃO deixe o wildcard em produção** - é inseguro
2. **Anote EXATAMENTE** o que está no cabeçalho Origin
3. **Teste tanto em HTTP quanto HTTPS** se necessário
4. **Verifique se há redirecionamentos** que podem mudar o Origin

---

**Próxima ação:** Realize os testes e me informe os resultados para continuarmos o diagnóstico.
