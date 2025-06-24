package com.spring.dto;

/**
 * DTO que representa un resumen anual de ventas.
 * 
 * Esta clase se utiliza para estructurar y transferir los datos agregados
 * de ventas a lo largo de un año determinado. Incluye una lista de resúmenes
 * mensuales, cada uno con el total de ventas del mes y el detalle de productos vendidos.
 * 
 * Es útil para generar reportes anuales, estadísticas y análisis de desempeño comercial.
 */

import java.util.List;

public class ResumenAnualDTO {
	
	// Año al que pertenece el resumen
	public int anio;
	// Lista con el resumen mensual de ventas
    public List<MesResumen> resumenMensual;

    /**
     *  Clase interna que representa el resumen de un mes específico.
     */
    public static class MesResumen {
        public String mes;
        public double total;
        // Lista de productos vendidos durante ese mes, con cantidades
        public List<ProductoVentaDetalle> productos;
    }

}
