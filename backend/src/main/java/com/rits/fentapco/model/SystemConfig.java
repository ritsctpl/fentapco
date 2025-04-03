package com.rits.fentapco.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "system_config")
public class SystemConfig {

    @Id
    @Column(name = "config_key")
    private String key;

    @Column(name = "config_value")
    private String value;

    public SystemConfig() {
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
