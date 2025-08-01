package com.validacao.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.email")
public class EmailConfig {
    
    private boolean testMode = true; // Ativar modo de teste
    private String testRecipient = "theostracke11@gmail.com"; // Email para onde todos os emails de teste irão
    private String fromAddress = "noreply@validacao.com";
    private String fromName = "Sistema de Validação TAC";
    
    // Getters e Setters
    public boolean isTestMode() {
        return testMode;
    }
    
    public void setTestMode(boolean testMode) {
        this.testMode = testMode;
    }
    
    public String getTestRecipient() {
        return testRecipient;
    }
    
    public void setTestRecipient(String testRecipient) {
        this.testRecipient = testRecipient;
    }
    
    public String getFromAddress() {
        return fromAddress;
    }
    
    public void setFromAddress(String fromAddress) {
        this.fromAddress = fromAddress;
    }
    
    public String getFromName() {
        return fromName;
    }
    
    public void setFromName(String fromName) {
        this.fromName = fromName;
    }
}
