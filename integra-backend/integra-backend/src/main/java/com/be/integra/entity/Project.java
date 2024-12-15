package com.be.integra.entity;

import com.be.integra.util.JsonConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.io.Serializable;
import java.util.Map;

import jakarta.validation.constraints.NotNull;

@Data
@Entity
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
@Table(schema = "integra", name = "project", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"account_id", "name"})
})
public class Project implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "account_id")
    private Long accountId;

    @NotNull
    @Column(name = "name")
    private String name;

//    @Convert(converter = JsonConverter.class)
//    @Column(name = "metadata", columnDefinition = "jsonb") // Specifico per PostgreSQL
//    private Map<String, Object> metadata;

//    @ManyToOne(optional = false)
//    @JoinColumn(name = "account_id", referencedColumnName = "id", insertable=false, updatable=false)
//    private Account account;
}