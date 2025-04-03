package com.rits.fentapco.service;

import java.util.Map;

public interface TagValueCacheService {

    void cacheTagValue(Long agentId, String nodeId, Object value);

    Object getTagValue(Long agentId, String nodeId);

    Map<String, Object> getAllTagValues(Long agentId);

    void clearCacheForAgent(Long agentId);
}
