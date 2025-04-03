package com.rits.fentapco.service;

import com.rits.fentapco.model.SystemConfig;
import com.rits.fentapco.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PcoIdService {

    private static final String PCO_ID_KEY = "pco.id";
    private static final String PREFIX = "RPCO";

    @Autowired
    private SystemConfigRepository configRepository;

    private String cachedPcoId;

    public synchronized String getPcoId() {
        if (cachedPcoId != null)
            return cachedPcoId;

        return configRepository.findById(PCO_ID_KEY)
                .map(config -> cachedPcoId = config.getValue())
                .orElseGet(() -> {
                    String newId = generateNewPcoId();
                    SystemConfig config = new SystemConfig();
                    config.setKey(PCO_ID_KEY);
                    config.setValue(newId);
                    configRepository.save(config);
                    cachedPcoId = newId;
                    return newId;
                });
    }

    private String generateNewPcoId() {
        int random = (int) (Math.random() * 900 + 100); // e.g., RPCO481
        return PREFIX + random;
    }
}
