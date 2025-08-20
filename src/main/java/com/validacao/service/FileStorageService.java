package com.validacao.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {
    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    public String salvarArquivo(MultipartFile arquivo, String subdiretorio) {
        try {
            Path dirPath = Paths.get(uploadDir, subdiretorio);
            Files.createDirectories(dirPath);
            String nomeUnico = UUID.randomUUID().toString() + "_" + arquivo.getOriginalFilename();
            Path filePath = dirPath.resolve(nomeUnico);
            Files.copy(arquivo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return filePath.toString();
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar arquivo", e);
        }
    }
}
