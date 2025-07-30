package com.validacao.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    public void enviarEmailAprovacao(String emailDestino, String nomeMotorista, String tokenAprovacao) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailDestino);
        message.setSubject("Novo documento para aprovação - Motorista: " + nomeMotorista);
        
        String linkAprovacao = "http://localhost:5173/aprovacao/" + tokenAprovacao;
        
        String texto = String.format(
            "Olá,\n\n" +
            "Um novo documento foi enviado para aprovação.\n\n" +
            "Motorista: %s\n" +
            "Para aprovar ou rejeitar o documento, clique no link abaixo:\n\n" +
            "%s\n\n" +
            "Atenciosamente,\n" +
            "Sistema de Validação de Documentos",
            nomeMotorista,
            linkAprovacao
        );
        
        message.setText(texto);
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Erro ao enviar email: " + e.getMessage());
            throw new RuntimeException("Falha ao enviar email de notificação");
        }
    }
    
    public void enviarEmailAprovado(String emailDespachante, String nomeMotorista, String status) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailDespachante);
        message.setSubject("Documento " + status.toLowerCase() + " - Motorista: " + nomeMotorista);
        
        String texto = String.format(
            "Olá,\n\n" +
            "O documento do motorista %s foi %s pela Estrada Fácil.\n\n" +
            "Você pode verificar o status no sistema.\n\n" +
            "Atenciosamente,\n" +
            "Sistema de Validação de Documentos",
            nomeMotorista,
            status.toLowerCase()
        );
        
        message.setText(texto);
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Erro ao enviar email: " + e.getMessage());
        }
    }
}
