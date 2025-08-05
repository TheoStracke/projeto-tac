package com.validacao.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    
    private Cors cors = new Cors();
    private String baseUrl = "http://localhost:8080";
    private String frontendUrl = "http://localhost:5173";
    private Upload upload = new Upload();
    private Email email = new Email();
    
    // Getters and Setters
    public Cors getCors() {
        return cors;
    }
    
    public void setCors(Cors cors) {
        this.cors = cors;
    }
    
    public String getBaseUrl() {
        return baseUrl;
    }
    
    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    public String getFrontendUrl() {
        return frontendUrl;
    }
    
    public void setFrontendUrl(String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }
    
    public Upload getUpload() {
        return upload;
    }
    
    public void setUpload(Upload upload) {
        this.upload = upload;
    }
    
    public Email getEmail() {
        return email;
    }
    
    public void setEmail(Email email) {
        this.email = email;
    }
    
    // Inner classes
    public static class Cors {
        private String allowedOrigins = "http://localhost:5173,https://projeto-tac.vercel.app,https://projeto-tac-production.up.railway.app";
        
        public String getAllowedOrigins() {
            return allowedOrigins;
        }
        
        public void setAllowedOrigins(String allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }
    
    public static class Upload {
        private String dir = "/tmp/uploads/";
        
        public String getDir() {
            return dir;
        }
        
        public void setDir(String dir) {
            this.dir = dir;
        }
    }
    
    public static class Email {
        private String admin = "theostracke11@gmail.com";
        private boolean testMode = true;
        
        public String getAdmin() {
            return admin;
        }
        
        public void setAdmin(String admin) {
            this.admin = admin;
        }
        
        public boolean isTestMode() {
            return testMode;
        }
        
        public void setTestMode(boolean testMode) {
            this.testMode = testMode;
        }
    }
}
