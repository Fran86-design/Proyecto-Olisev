package com.spring.dto;

/**
 * DTO que representa el detalle de ventas de un producto.
 * 
 * Esta clase se utiliza para transportar información sobre las ventas
 * de un producto específico, incluyendo su nombre y la cantidad total vendida.
 * 
 * Se emplea en reportes de ventas diarios, mensuales o anuales,
 * y en estadísticas relacionadas con el rendimiento de los productos.
 */

public class ProductoVentaDetalle {
	
	// Nombre del producto vendido
	private String nombreProducto;
	// Cantidad total vendida del producto
    private Long cantidadVendida;

    /**
     * Constructor con parámetros.
     * Inicializa el nombre del producto y la cantidad vendida.
     * @param nombreProducto nombre del producto
     * @param cantidadVendida cantidad total vendida
     */
    public ProductoVentaDetalle(String nombreProducto, Long cantidadVendida) {
        this.nombreProducto = nombreProducto;
        this.cantidadVendida = cantidadVendida;
    }
    
    /**
     * Constructor vacío.
     */
    public ProductoVentaDetalle() {
    }

    /**
     * Devuelve el nombre del producto.
     * @return nombre del producto
     */
	public String getNombreProducto() {
		return nombreProducto;
	}

	/**
	 * Establece el nombre del producto.
	 * @param nombreProducto el nuevo nombre del producto
	 */
	public void setNombreProducto(String nombreProducto) {
		this.nombreProducto = nombreProducto;
	}

	/**
	 * Devuelve la cantidad total vendida del producto.
	 * @return cantidad vendida
	 */
	public Long getCantidadVendida() {
		return cantidadVendida;
	}

	/**
	 * Establece la cantidad vendida del producto.
	 * @param cantidadVendida nueva cantidad vendida
	 */
	public void setCantidadVendida(Long cantidadVendida) {
		this.cantidadVendida = cantidadVendida;
	}
}

