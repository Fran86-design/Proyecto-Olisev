package com.spring.model;

/**
 * Clase que representa una línea individual dentro de un pedido.
 * Cada línea incluye información sobre el producto, la cantidad solicitada, el precio por unidad,
 * y una referencia tanto al producto como al pedido al que pertenece.
 * 
 * Además, contiene un campo transitorio productoId útil para intercambios de datos con el frontend,
 * sin necesidad de enviar el objeto completo del producto.
 * 
 * Está mapeada como entidad JPA para ser persistida en la base de datos.
 */

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;

@Entity
public class LineaPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Identificador único de cada línea de pedido
    private Long id;
    // Nombre del producto en esta línea del pedido.
    private String nombreProducto;
    // Cantidad de unidades del producto en esta línea del pedido.
    private int cantidad;
    // Precio por unidad del producto en esta línea.
    private double precioUnitario;
    
    // Relación muchos-a-uno
    @ManyToOne
    // Define la columna de unión en la tabla, que actuará como clave foránea apuntando a la tabla Producto.
    @JoinColumn(name = "producto_id")
    // Representa el producto asociado a esta línea del pedido.
    private Producto producto;

    // Relación muchos-a-uno
    @ManyToOne
    // Evita ciclos infinitos al convertir objetos a JSON
    @JsonBackReference("pedido-lineas")
    // Hace referencia al pedido al que pertenece esta línea.
    private Pedido pedido;
    
    // Campo que no se guarda en la base de datos. Se usa para recibir o enviar solo el ID del producto desde o hacia el frontend.
    @Transient
    private Long productoId;
    

    // Getters y setters
    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }
    
    public Long getId() {
        return id;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public double getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(double precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public String getNombreProducto() {
        return nombreProducto;
    }

    public void setNombreProducto(String nombreProducto) {
        this.nombreProducto = nombreProducto;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }
}

