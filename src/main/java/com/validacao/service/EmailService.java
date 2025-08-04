package com.validacao.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username:}")
    private String fromEmail;
    
    @Value("${app.email.admin:theostracke11@gmail.com}")
    private String adminEmail;
    
    @Value("${app.email.test-mode:true}")
    private boolean testMode;
    
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    @Value("${app.base.url:http://localhost:8080}")
    private String backendUrl;
    
    public void enviarEmailAprovacao(String emailDestino, String nomeMotorista, String tokenAprovacao) {
        if (fromEmail == null || fromEmail.trim().isEmpty()) {
            return;
        }
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(emailDestino);
        message.setSubject("🔔 Novo documento para aprovação - Motorista: " + nomeMotorista);
        
        String linkAprovacao = frontendUrl + "/aprovacao/" + tokenAprovacao;
        
        String texto = String.format(
            "Olá! 👋\n\n" +
            "Um novo documento foi enviado para aprovação.\n\n" +
            "📄 Motorista: %s\n" +
            "🔗 Para aprovar ou rejeitar o documento, clique no link abaixo:\n\n" +
            "%s\n\n" +
            "⏰ Este link expira em 30 dias.\n\n" +
            "Atenciosamente,\n" +
            "🚛 Sistema de Validação de Documentos Estrada Fácil",
            nomeMotorista,
            linkAprovacao
        );
        
        message.setText(texto);
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Falha ao enviar email de notificação: " + e.getMessage());
        }
    }
    
    public void enviarEmailAprovado(String emailDespachante, String nomeMotorista, String status) {
        if (fromEmail == null || fromEmail.trim().isEmpty()) {
            return;
        }
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(emailDespachante);
        
        String emoji = status.equals("APROVADO") ? "✅" : "❌";
        message.setSubject(emoji + " Documento " + status.toLowerCase() + " - Motorista: " + nomeMotorista);
        
        String texto = String.format(
            "Olá! 👋\n\n" +
            "%s O documento do motorista %s foi %s pela Estrada Fácil.\n\n" +
            "📱 Você pode verificar todos os detalhes no sistema:\n" +
            "🔗 " + frontendUrl + "/dashboard\n\n" +
            "%s\n\n" +
            "Atenciosamente,\n" +
            "🚛 Sistema de Validação de Documentos Estrada Fácil",
            emoji,
            nomeMotorista,
            status.toLowerCase(),
            status.equals("APROVADO") ? 
                "🎉 Parabéns! O documento foi aprovado e está pronto para uso." :
                "⚠️ O documento foi rejeitado. Verifique os comentários e reenvie se necessário."
        );
        
        message.setText(texto);
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            // Email falhou silenciosamente
        }
    }
    
    /**
     * Envia notificação para o administrador quando um novo documento é enviado
     */
    public void notificarNovoDocumento(String nomeMotorista, String tipoDocumento, String empresaRemetente, String tokenAprovacao) {
        if (fromEmail == null || fromEmail.trim().isEmpty()) {
            return;
        }
        
        String destinatario = testMode ? adminEmail : adminEmail;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(destinatario);
        message.setSubject("🔔 NOVO DOCUMENTO PARA VERIFICAÇÃO - " + nomeMotorista);
        
        String linkAprovacao = backendUrl + "/aprovacao/" + tokenAprovacao + "/aprovar";
        String linkRejeicao = backendUrl + "/aprovacao/" + tokenAprovacao + "/rejeitar";
        String linkDetalhes = frontendUrl + "/aprovacao/" + tokenAprovacao;
        
        String texto = String.format(
            "🚨 NOVA SOLICITAÇÃO DE VERIFICAÇÃO! 🚨\n\n" +
            "📋 Detalhes do documento:\n" +
            "👤 Motorista: %s\n" +
            "📄 Tipo de documento: %s\n" +
            "🏢 Empresa remetente: %s\n" +
            "⏰ Recebido em: %s\n\n" +
            "⚡ AÇÕES RÁPIDAS:\n" +
            "✅ APROVAR: %s\n" +
            "❌ REJEITAR: %s\n\n" +
            "🔍 VER DETALHES E ANEXOS:\n" +
            "%s\n\n" +
            "💡 Dica: Use os links de ação rápida para aprovar/rejeitar instantaneamente,\n" +
            "ou use o link de detalhes para ver o documento antes de decidir.\n\n" +
            "⏰ Estes links expiram em 30 dias.\n\n" +
            "📧 Este email foi enviado para: %s\n" +
            "(Modo de teste: %s)\n\n" +
            "Atenciosamente,\n" +
            "🚛 Sistema de Validação TAC",
            nomeMotorista,
            tipoDocumento != null ? tipoDocumento : "Documento geral",
            empresaRemetente,
            java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
            linkAprovacao,
            linkRejeicao,
            linkDetalhes,
            destinatario,
            testMode ? "SIM" : "NÃO"
        );
        
        message.setText(texto);
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            // Email falhou silenciosamente
        }
    }
}
