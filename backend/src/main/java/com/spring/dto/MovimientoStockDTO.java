package com.spring.dto;

/**
 * DTO (Data Transfer Object) que representa un movimiento de stock.
 * 
 * Esta clase se utiliza para transferir datos entre el cliente y el servidor
 * relacionados con operaciones de entrada o salida de inventario.
 * Contiene el ID del producto y la cantidad de unidades involucradas en el movimiento.
 * 
 * Se utiliza en operaciones REST para actualizar el stock de productos.
 */

public class MovimientoStockDTO {
	
	// Representa el identificador del producto
	private Long productoId;
    
	// Representa la cantidad de unidades del producto
	private int cantidad;

	// Getters and Setters
	
    /**
     * Devuelve el ID del producto asociado.
     * @return el identificador del producto
     */
    public Long getProductoId() {
        return productoId;
    }

    /**
     * Establece el ID del producto asociado.
     * @param productoId el nuevo ID del producto
     */
    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    /**
     * Devuelve la cantidad de productos.
     * @return cantidad de unidades
     */
    public int getCantidad() {
        return cantidad;
    }

    /**
     * Establece la cantidad de productos.
     * @param cantidad el nuevo valor de cantidad
     */
    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }
}
