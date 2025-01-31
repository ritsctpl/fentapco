package com.rits.fentapco.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@RequiredArgsConstructor
public class PublishingConfigRequest {
    private Long id; // Agent ID
    private String websocketUrl;
    private String sseUrl;
    private boolean websocketEnabled;
    private boolean sseEnabled;
}
