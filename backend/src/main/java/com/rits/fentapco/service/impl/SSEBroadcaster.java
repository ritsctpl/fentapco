package com.rits.fentapco.service.impl;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class SSEBroadcaster {

    private static final CopyOnWriteArraySet<SseEmitter> emitters = new CopyOnWriteArraySet<>();

    public static void addEmitter(SseEmitter emitter) {
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
    }

    public static void broadcastMessage(String message) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(message);
            } catch (Exception e) {
                emitters.remove(emitter);
            }
        }
    }
}
