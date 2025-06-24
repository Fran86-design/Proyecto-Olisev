package com.spring.model;

/**
 * Clase que representa un producto en el sistema.
 * 
 * Cada instancia de esta clase corresponde a un producto que puede tener nombre, precio,
 * descripción, descuento, visibilidad en la tienda, imagen asociada, stock, categoría,
 * precio de compra y fecha de última actualización del stock.
 * 
 * Esta entidad se mapea a una tabla en la base de datos y contiene anotaciones que
 * definen relaciones y configuraciones para el almacenamiento, incluyendo el uso de
 * LONGBLOB para imágenes y campos personalizados como "categoria" y "precio_compra".
 */

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
public class Producto {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private double precio;

    // Descripción del producto, se limita a 1000 caracteres como máximo.
    @Column(length = 1000)
    private String descripcion;

    private Integer descuento;

    // Indica si el producto es visible en la tienda
    private boolean visible;

    private String nombreImagen;
    
    // Categoría a la que pertenece el producto, aceite o manzanilla.
    @Column(name = "categoria")
    private String categoria;

    // Precio de compra
    @Column(name = "precio_compra")
    private Double precioCompra;
    
    // Indica que este campo se almacenará como un tipo grande de binario.
    @Lob
    // Define la columna 'imagen' como un LONGBLOB en la base de datos, usado para guardar archivos binarios grandes
    @Column(name = "imagen", columnDefinition = "LONGBLOB")
    // Almacena la imagen del producto en formato binario
    // Este campo permite guardar directamente los bytes de una imagen dentro de la base de datos.
    private byte[] imagen;
    
    // Cantidad de unidades disponibles en stock
    @Column(name = "stock")
    private Integer stock;
    
    // Fecha y hora de la última actualización del stock del producto
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaActualizacionStock;
    
    /**
     * Devuelve la fecha en que se actualizó por última vez el stock del producto.
     * @return fecha de actualización del stock
     */
    public Date getFechaActualizacionStock() {
        return fechaActualizacionStock;
    }

    /**
     * Establece la fecha en que se actualizó el stock del producto.
     * @param fechaActualizacionStock nueva fecha de actualización
     */
    public void setFechaActualizacionStock(Date fechaActualizacionStock) {
        this.fechaActualizacionStock = fechaActualizacionStock;
    }

    
    // Getters y setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Integer getDescuento() {
        return descuento;
    }

    public void setDescuento(Integer descuento) {
        this.descuento = descuento;
    }

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    public String getNombreImagen() {
        return nombreImagen;
    }

    public void setNombreImagen(String nombreImagen) {
        this.nombreImagen = nombreImagen;
    }
    
    public byte[] getImagen() {
        return imagen;
    }

    public void setImagen(byte[] imagen) {
        this.imagen = imagen;
    }
    
    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }
    
    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public Double getPrecioCompra() {
        return precioCompra;
    }

    public void setPrecioCompra(Double precioCompra) {
        this.precioCompra = precioCompra;
    }
}
