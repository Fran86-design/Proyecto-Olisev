package com.spring.model;

/**
 * Clase que representa una línea individual dentro de una factura.
 * Cada línea contiene información sobre un producto facturado,
 * como su nombre, cantidad, precio unitario y la factura a la que pertenece.
 *
 * Está mapeada a una tabla en la base de datos mediante la anotación @Entity,
 * y se relaciona con la entidad Factura mediante una relación @ManyToOne.
 * Se utiliza @JsonBackReference para evitar ciclos infinitos durante la serialización JSON.
 */

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import jakarta.persistence.ManyToOne;

//Esta anotación le dice a Java que esta clase representa una tabla en la base de datos.
//Es decir, cada objeto de esta clase será una fila en la tabla.
@Entity
public class LineaFactura {
	

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Identificador único de cada línea de factura, usado como clave primaria en la base de datos.
    private Long id;
    // Nombre del producto que aparece en esta línea de factura
    private String nombreProducto;
    // Número de unidades del producto facturadas en esta línea.
    private Integer cantidad;
    // Precio por unidad del producto en esta línea.
    private Double precioUnitario;

    @ManyToOne
    // Esta anotación evita problemas al convertir a JSON,
    // indicando que esta relación ya ha sido manejada desde el otro lado (en Factura con @JsonManagedReference).
    // Ayuda a prevenir ciclos infinitos al serializar objetos con referencias circulares.
    @JsonBackReference("linea-factura")
    // Representa la factura a la que pertenece esta línea de factura (relación muchos a uno).
    private Factura factura;

    // Getters y Setters
    
    public Long getId() { 
    	return id; 
    }
    
    public String getNombreProducto() { 
    	return nombreProducto; 
    }
    
    public void setNombreProducto(String nombreProducto) { 
    	this.nombreProducto = nombreProducto; 
    }

    public Integer getCantidad() { 
    	return cantidad; 
    }
    
    public void setCantidad(Integer cantidad) { 
    	this.cantidad = cantidad; 
    }

    public Double getPrecioUnitario() { 
    	return precioUnitario; 
    }
    
    public void setPrecioUnitario(Double precioUnitario) { 
    	this.precioUnitario = precioUnitario; 
    }

    public Factura getFactura() { 
    	return factura; 
    }
    
    public void setFactura(Factura factura) { 
    	this.factura = factura; 
    }
}
