package com.rits.fentapco.controller;

import com.rits.fentapco.model.Source;
import com.rits.fentapco.model.SourceNode;
import com.rits.fentapco.service.SourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sources")
public class SourceController {

    @Autowired
    private SourceService sourceService;

    @GetMapping
    public ResponseEntity<List<Source>> getAllSources() {
        return ResponseEntity.ok(sourceService.getAllSources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Source> getSourceById(@PathVariable Long id) {
        return ResponseEntity.ok(sourceService.getSourceById(id).orElseThrow());
    }

    @PostMapping
    public ResponseEntity<Source> createSource(@RequestBody Source source) {
        if (!List.of("opcua", "mqtt", "kafka", "tcp", "udp", "ftp").contains(source.getType().toLowerCase())) {
            throw new IllegalArgumentException("Unsupported protocol: " + source.getType());
        }
        return ResponseEntity.ok(sourceService.saveSource(source));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSource(@PathVariable Long id) {
        sourceService.deleteSource(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/test")
    public ResponseEntity<Boolean> testSourceConnection(@PathVariable Long id) {
        Source source = sourceService.getSourceById(id).orElseThrow();
        return ResponseEntity.ok(sourceService.testConnection(source));
    }

    /*
     * @GetMapping("/{id}/nodes")
     * public ResponseEntity<List<SourceNode>> discoverNodes(@PathVariable Long id)
     * {
     * Source source = sourceService.getSourceById(id).orElseThrow();
     * return ResponseEntity.ok(sourceService.discoverNodes(source));
     * }
     */
    @GetMapping("/{id}/nodes")
    public ResponseEntity<List<SourceNode>> discoverNodes(
            @PathVariable Long id,
            @RequestParam(required = false) String parentNodeId) {
        Source source = sourceService.getSourceById(id).orElseThrow();
        List<SourceNode> nodes;
        if (parentNodeId == null || parentNodeId.isEmpty()) {
            // If no parentNodeId is provided, retrieve top-level nodes
            nodes = sourceService.discoverNodes(source);
        } else {
            // Retrieve child nodes of the given parentNodeId
            nodes = sourceService.discoverChildNodes(source, parentNodeId);
        }
        return ResponseEntity.ok(nodes);
    }

    @GetMapping("/{id}/all-nodes")
    public ResponseEntity<SourceNode> discoverCompleteNodeHierarchy(@PathVariable Long id) {
        Source source = sourceService.getSourceById(id).orElseThrow();
        SourceNode allNodes = sourceService.discoverCompleteNodeHierarchy(source);
        return ResponseEntity.ok(allNodes);
    }

}
