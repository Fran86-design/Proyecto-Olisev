package com.spring.dto;

/**
 * DTO que representa el total de ventas agrupadas por una fecha determinada.
 * 
 * Esta clase es utilizada para devolver información resumida de ventas,
 * ya sea por día, mes o año, según el contexto del reporte.
 * Incluye la fecha como cadena y el total de ventas realizadas en ese periodo.
 */

public class VentaPorFecha {
	
	// Fecha de la venta
    private String fecha;
    // Total de ventas para la fecha correspondiente
    private double total;

    /**
     * Constructor que inicializa los valores de fecha y total.
     * Convierte el objeto de fecha a String si no es nulo.
     * @param fecha fecha de la venta
     * @param total total de ventas para esa fecha
     */
    public VentaPorFecha(Object fecha, double total) {
    	// fecha != null - si el parámetro fecha no es nulo
        // ? fecha.toString() - entonces lo convierte a texto usando el método toString()
        // : null - si es nulo, se asigna null
        // la fecha siempre se almacene como texto o como null si no viene nada
        this.fecha = fecha != null ? fecha.toString() : null;
        this.total = total;
    }

    /**
     * Devuelve la fecha correspondiente al resumen de ventas.
     * @return fecha como String
     */
    public String getFecha() {
        return fecha;
    }

    /**
     * Devuelve el total de ventas registradas para la fecha.
     * @return total de ventas
     */
    public double getTotal() {
        return total;
    }
}