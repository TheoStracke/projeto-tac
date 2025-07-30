package com.validacao.dto;

public class ApiResponse<T> {
    private String status;
    private String message;
    private T data;
    private String timestamp;
    
    // Construtores
    public ApiResponse() {
        this.timestamp = java.time.LocalDateTime.now().toString();
    }
    
    public ApiResponse(String status, String message, T data) {
        this();
        this.status = status;
        this.message = message;
        this.data = data;
    }
    
    // Métodos estáticos para facilitar criação
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("success", message, data);
    }
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("success", "Operação realizada com sucesso", data);
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>("error", message, null);
    }
    
    public static <T> ApiResponse<T> error(String message, T data) {
        return new ApiResponse<>("error", message, data);
    }
    
    // Getters e Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
    
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
