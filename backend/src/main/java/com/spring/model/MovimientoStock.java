package com.spring.model;

/**
 * Clase que representa un movimiento de stock (entrada o salida) en el inventario.
 * Cada instancia de esta clase almacena información sobre:
 *   El tipo de movimiento (ENTRADA o SALIDA),
 *   La cantidad involucrada,
 *   La fecha del movimiento,
 *   Y el producto al que se aplica.
 * 
 * Esta entidad se utiliza para llevar un historial detallado de los cambios de inventario
 * y está relacionada con la tabla "movimiento_stock" en la base de datos.
 */


import jakarta.persistence.*;
import java.util.Date;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
// Especifica el nombre de la tabla en la base de datos que estará asociada a esta clase.
@Table(name = "movimiento_stock")
public class MovimientoStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // Tipo de movimiento de stock, por ejemplo: "ENTRADA" o "SALIDA".
    private String tipo; 
    // Cantidad de unidades que entran o salen del inventario.
    private int cantidad;
    
    // Define que el campo 'fecha' se almacenará como un timestamp (fecha y hora) en la base de datos.
    @Temporal(TemporalType.TIMESTAMP)
    private Date fecha;

    @ManyToOne
    // Especifica el nombre de la columna en la base de datos que actuará como clave foránea hacia la tabla 'producto'.
    @JoinColumn(name = "producto_id")
    // Referencia al producto al que pertenece este movimiento de stock.
    private Producto producto;

    // Getters y setters
    public Long getId() { 
    	return id; 
    }
    
    public String getTipo() { 
    	return tipo; 
    }
    
    public void setTipo(String tipo) { 
    	this.tipo = tipo; 
    }
    public int getCantidad() { 
    	return cantidad; 
    }
    
    public void setCantidad(int cantidad) { 
    	this.cantidad = cantidad; 
    }
    
    public Date getFecha() { 
    	return fecha; 
    }
    
    public void setFecha(Date fecha) { 
    	this.fecha = fecha; 
    }
    
    public Producto getProducto() { 
    	return producto; 
    }
    
    public void setProducto(Producto producto) { 
    	this.producto = producto; 
    }
}