package com.rits.fentapco.service.impl;

import com.rits.fentapco.service.TagValueCacheService;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TagValueCacheServiceImpl implements TagValueCacheService {

    // Map<AgentId, Map<NodeId, Value>>
    private final Map<Long, Map<String, Object>> cache = new ConcurrentHashMap<>();

    @Override
    public void cacheTagValue(Long agentId, String nodeId, Object value) {
        cache.computeIfAbsent(agentId, k -> new ConcurrentHashMap<>()).put(nodeId, value);
    }

    @Override
    public Object getTagValue(Long agentId, String nodeId) {
        return cache.getOrDefault(agentId, new ConcurrentHashMap<>()).get(nodeId);
    }

    @Override
    public Map<String, Object> getAllTagValues(Long agentId) {
        return cache.getOrDefault(agentId, new ConcurrentHashMap<>());
    }

    @Override
    public void clearCacheForAgent(Long agentId) {
        cache.remove(agentId);
    }
}
