/* package com.rits.fentapco.service;

import com.rits.fentapco.model.Agent;
import java.util.Optional;
import com.rits.fentapco.model.Source;
import java.util.List;

public interface AgentService {
    List<Agent> getAllAgents();

    Optional<Agent> getAgentById(Long id);

    Agent saveAgent(Agent agent);

    void deleteAgent(Long id);

    void startAgent(Long id);

    void stopAgent(Long id);

    void associateSource(Long id, Source source);

    void createTrigger(Long id, String nodeId) throws Exception;
}
 */
package com.rits.fentapco.service;

import com.rits.fentapco.model.Agent;
import com.rits.fentapco.model.Source;

import java.util.List;
import java.util.Optional;

public interface AgentService {
    List<Agent> getAllAgents();

    Optional<Agent> getAgentById(Long id);

    Agent saveAgent(Agent agent);

    void deleteAgent(Long id);

    boolean startAgent(Long id);

    boolean stopAgent(Long id);

    void associateSource(Long id, Source source);

    boolean subscribeTags(Long id, List<String> tagIds);

    boolean configurePublishing(Long id, String websocketUrl, String sseUrl, boolean websocketEnabled,
            boolean sseEnabled);
}
