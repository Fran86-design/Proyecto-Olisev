package com.spring.model;

/**
 * Representa una entrada de aceituna en el sistema.
 * Esta entidad almacena información detallada sobre el ingreso de aceitunas por parte de un cliente,
 * incluyendo su variedad, tipo, peso, fechas de entrada y procesamiento, así como medidas químicas 
 * como grados de sal y sosa. También se vincula con la campaña agrícola correspondiente y permite 
 * registrar observaciones relevantes.
 *
 * Relaciones:
 * - Muchos registros de EntradaAceituna pueden estar asociados a un único Usuario cliente, mediante @ManyToOne.
 * 
 * La clave primaria id se genera automáticamente usando @GeneratedValue.
 */

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

//Esta anotación le dice a Java que esta clase representa una tabla en la base de datos.
//Es decir, cada objeto de esta clase será una fila en la tabla.
@Entity
public class EntradaAceituna {
	
	// Marca este campo como la clave primaria de la entidad.
	@Id 
	// Indica que el valor del ID será generado automáticamente.
	@GeneratedValue
    private Long id;

	// Define una relación muchos-a-uno con la entidad Usuario.
	// Esto significa que muchas entradas de aceituna pueden estar asociadas a un único cliente.
	// En la base de datos, se representa con una clave foránea (foreign key) a la tabla de usuarios.
    @ManyToOne
    private Usuario cliente; 
    private Integer lote;
    
    private String variedad;
    private String tipo; 
    private Double kilos;
    private LocalDate fechaEntrada;

    private String cocedera; 
    private LocalDate fechaCocedera;

    private String fermentador; 
    private LocalDate fechaFermentador;

    private Double gradosSal;
    private Double gradosSosa;

    private String observaciones;

    private String campana;
    
    // Getters and Setters
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getCliente() {
        return cliente;
    }

    public void setCliente(Usuario cliente) {
        this.cliente = cliente;
    }

    public String getVariedad() {
        return variedad;
    }

    public void setVariedad(String variedad) {
        this.variedad = variedad;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Double getKilos() {
        return kilos;
    }

    public void setKilos(Double kilos) {
        this.kilos = kilos;
    }

    public LocalDate getFechaEntrada() {
        return fechaEntrada;
    }

    public void setFechaEntrada(LocalDate fechaEntrada) {
        this.fechaEntrada = fechaEntrada;
    }

    public String getCocedera() {
        return cocedera;
    }

    public void setCocedera(String cocedera) {
        this.cocedera = cocedera;
    }

    public LocalDate getFechaCocedera() {
        return fechaCocedera;
    }

    public void setFechaCocedera(LocalDate fechaCocedera) {
        this.fechaCocedera = fechaCocedera;
    }

    public String getFermentador() {
        return fermentador;
    }

    public void setFermentador(String fermentador) {
        this.fermentador = fermentador;
    }

    public LocalDate getFechaFermentador() {
        return fechaFermentador;
    }

    public void setFechaFermentador(LocalDate fechaFermentador) {
        this.fechaFermentador = fechaFermentador;
    }

    public Double getGradosSal() {
        return gradosSal;
    }

    public void setGradosSal(Double gradosSal) {
        this.gradosSal = gradosSal;
    }

    public Double getGradosSosa() {
        return gradosSosa;
    }

    public void setGradosSosa(Double gradosSosa) {
        this.gradosSosa = gradosSosa;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getCampana() {
        return campana;
    }

    public void setCampana(String campana) {
        this.campana = campana;
    }
    
    public Integer getLote() {
        return lote;
    }

    public void setLote(Integer lote) {
        this.lote = lote;
    }
}


