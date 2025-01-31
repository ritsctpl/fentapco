package com.rits.fentapco.model;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class SourceNode {
    private String nodeId;
    private String displayName;
    private List<SourceNode> children = new ArrayList<>();

    // Getters and setters
    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public List<SourceNode> getChildren() {
        return children;
    }
}
