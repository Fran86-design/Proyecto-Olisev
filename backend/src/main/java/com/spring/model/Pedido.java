package com.spring.model;

/**
 * Clase que representa un pedido realizado por un cliente.
 * Contiene información como el cliente, fecha del pedido, total a pagar,
 * estado de envío y pago, así como la lista de productos (líneas) incluidas en el pedido.
 * 
 * Esta clase está mapeada a una tabla en la base de datos mediante JPA (@Entity).
 * Cada pedido puede contener múltiples líneas de pedido (@OneToMany), 
 * y está diseñado para funcionar correctamente con serialización JSON en entornos web.
 * 
 * Funcionalidad principal:
 *   Almacenar datos del pedido (cliente, productos, fecha, total).
 *   Controlar estados de envío y pago.
 *   Gestionar la relación bidireccional con LineaPedido para mantener la consistencia del modelo.
 */

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // clave primaria de la entidad Pedido
    private Long id;

    // Indica que un pedido puede tener muchas líneas de pedido asociadas (relación uno-a-muchos)
    // mappedBy = "pedido"' indica que la propiedad "pedido" en la clase LineaPedido es la dueña de la relación
    // cascade = CascadeType.ALL' hace que al guardar o eliminar un pedido, también se guarden o eliminen sus líneas asociadas
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    @JsonManagedReference("pedido-lineas")
    // Lista que contiene todas las líneas de productos incluidas en el pedido.
    // Cada objeto LineaPedido representa un producto, su cantidad y precio dentro de este pedido.
    private List<LineaPedido> detalles;
    
    // Nombre del cliente que realizó el pedido
    private String nombreCliente;
    private String direccion;
    private String email;
    private String telefono;

    private LocalDate fechaPedido;
    private Double total;
    // Indica si el pedido ya ha sido enviado
    private boolean enviado = false;
    private boolean pagado = false;
    private LocalDate fechaPago;
    // Código único que identifica el pedido en el año 
    private String codigoAnual;

    /**
     * Devuelve si el pedido ha sido enviado o no.
     * @return true si el pedido ya fue marcado como enviado, false si aún no se ha enviado.
     */
    public boolean isEnviado() {
        return enviado;
    }
    
    /**
     * Establece la lista de productos (líneas) asociadas a este pedido.
     * Además, por cada línea de pedido, también se establece su relación con este pedido actual.
     * Esto es útil para mantener bien la relación bidireccional entre Pedido y LineaPedido.
     * @param detalles Lista de objetos LineaPedido que forman parte del pedido.
     */
    public void setDetalles(List<LineaPedido> detalles) {
        this.detalles = detalles;
        // Si la lista no está vacía, se asigna este pedido como dueño de cada línea
        if (detalles != null) {
        	// recorre cada elemento de la lista detalles.
            for (LineaPedido detalle : detalles) {
            	// Establece la referencia de vuelta al pedido actual
                detalle.setPedido(this);
            }
        }
    }
    
    // Getters y setters

    public void setEnviado(boolean enviado) {
        this.enviado = enviado;
    }

    public boolean isPagado() {
        return pagado;
    }

    public void setPagado(boolean pagado) {
        this.pagado = pagado;
    }

    public LocalDate getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDate fechaPago) {
        this.fechaPago = fechaPago;
    }

    public String getCodigoAnual() {
        return codigoAnual;
    }

    public void setCodigoAnual(String codigoAnual) {
        this.codigoAnual = codigoAnual;
    }

    public Long getId() {
        return id;
    }

    public String getNombreCliente() {
        return nombreCliente;
    }

    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public LocalDate getFechaPedido() {
        return fechaPedido;
    }

    public void setFechaPedido(LocalDate fechaPedido) {
        this.fechaPedido = fechaPedido;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public List<LineaPedido> getDetalles() {
        return detalles;
    }
    
    

    
    
    
}
