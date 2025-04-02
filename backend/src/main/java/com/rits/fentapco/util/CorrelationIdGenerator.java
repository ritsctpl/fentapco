package com.rits.fentapco.util;

import java.util.UUID;

public class CorrelationIdGenerator {
    public static String generateCorrelationId() {
        return UUID.randomUUID().toString();
    }
}
