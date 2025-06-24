package com.spring.model;

/**
 * Representa un archivo de resumen de movimientos asociado a un año específico.
 * 
 * Esta entidad se almacena en la tabla "archivo_movimiento" y contiene:
 * - El año (anio) como identificador único.
 * - La fecha de creación (fechaCreacion) del registro, incluyendo fecha y hora.
 * 
 * Se utiliza para llevar un control de los años para los cuales ya se ha generado
 * y guardado un archivo resumen de movimientos.
 */

import jakarta.persistence.*;
import java.util.Date;

//Esta anotación le dice a Java que esta clase representa una tabla en la base de datos.
//Es decir, cada objeto de esta clase será una fila en la tabla.
@Entity

//Especifica el nombre de la tabla en la base de datos asociada a esta entidad.
//En este caso, la tabla se llamará "archivo_movimiento". Si no se especificara, tomaría el nombre de la clase por defecto.
@Table(name = "archivo_movimiento")
public class ArchivoMovimiento {

	// Marca este campo como clave primaria de la tabla.
    // En este caso, el año es único y se usa como identificador.
    @Id
    private Integer anio;

    // Indica que el campo se debe almacenar como un TIMESTAMP en la base de datos,
    // es decir, incluirá tanto la fecha como la hora.
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaCreacion;

    /**
     * Constructor vacío obligatorio para que JPA pueda instanciar la entidad
     * mediante reflexión al cargar datos desde la base de datos.
     */
    public ArchivoMovimiento() {}

    /**
     * Constructor que recibe el año como parámetro.
     * Se usa para crear un nuevo objeto ArchivoMovimiento con la fecha actual.
     * @param anio el año que se usará como identificador del archivo
     */
    public ArchivoMovimiento(Integer anio) {
        this.anio = anio;
        // Se asigna la fecha y hora actuales al momento de creación del objeto.
        this.fechaCreacion = new Date();
    }

    // Getters and Setters necesarios para acceder y modificar los campos desde fuera
    
    public Integer getAnio() {
        return anio;
    }

    public void setAnio(Integer anio) {
        this.anio = anio;
    }

    public Date getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(Date fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}

