package com.spring.model;

/**
 * Clase que representa una factura en el sistema.
 * Cada factura contiene información como fecha, total, IVA, coste de envío, dirección,
 * el pedido asociado y las líneas detalladas de los productos facturados.
 * Está mapeada como una entidad de base de datos y se utiliza para almacenar y gestionar
 * la información de facturación relacionada con los pedidos de los clientes.
 */

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.Id;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

//Esta anotación le dice a Java que esta clase representa una tabla en la base de datos.
//Es decir, cada objeto de esta clase será una fila en la tabla.
@Entity
public class Factura {
	// Esta anotación indica que este campo es la clave primaria (ID único) de la tabla.
    @Id
    // Esta le dice a JPA que el valor de ID se generará automáticamente por la base de datos.
    // En este caso, usa la estrategia "IDENTITY", que es típica en bases de datos como MySQL (auto-incremento)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // Fecha de la factura (por ejemplo, cuándo se emitió)
    private LocalDate fecha;
    // Total de la factura sin contar IVA ni envío
    private Double total;
    // Monto del IVA
    private Double iva;  
    // Coste del envío
    private Double costeEnvio; 
    // Total final de la factura: incluye IVA y envío
    private Double totalConIva;
    // Dirección de entrega y facturacion
    private String direccion;
    
    // Esta anotación indica una relación: Muchas facturas pueden estar relacionadas con un solo pedido.
    @ManyToOne
    // Aquí le decimos a JPA que la columna de unión en la base de datos se llama "pedido_id".
    // Es como decir: "cada factura tiene un campo llamado pedido_id que apunta al pedido relacionado".
    @JoinColumn(name = "pedido_id")
    // Esta anotación se usa para evitar problemas al convertir el objeto a JSON.
    // En este caso, ignora los "detalles" del pedido para evitar bucles infinitos cuando se convierte a JSON.
    @JsonIgnoreProperties({"detalles"}) 
    // Representa el pedido al que pertenece esta factura.
    private Pedido pedido;
    
    // Esta anotación indica que una factura puede tener muchas líneas, productos facturados.
    // "mappedBy" le dice a JPA que la relación ya está definida desde el lado de LineaFactura (campo "factura").
    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL)
    // Esta anotación ayuda a que cuando se genere un JSON, se controle bien la relación padre-hijo (factura -> líneas).
    // Evita bucles infinitos en la conversión de objetos a JSON.
    @JsonManagedReference("linea-factura")
    // Lista de todas las líneas (productos) que conforman esta factura.
    private List<LineaFactura> lineas;


    // Getters y Setters

    public Long getId() { 
    	return id; 
    }
    
    public LocalDate getFecha() {
    	return fecha; 
    }
    
    public void setFecha(LocalDate fecha) { 
    	this.fecha = fecha; 
    }

    public Double getTotal() { 
    	return total; 
    }
    
    public void setTotal(Double total) { 
    	this.total = total; 
    }

    public Double getIva() { 
    	return iva; 
    }
    
    public void setIva(Double iva) { 
    	this.iva = iva; 
    }

    public Double getCosteEnvio() { 
    	return costeEnvio; 
    }
    
    public void setCosteEnvio(Double costeEnvio) { 
    	this.costeEnvio = costeEnvio; 
    }

    public Double getTotalConIva() { 
    	return totalConIva; 
    }
    
    public void setTotalConIva(Double totalConIva) { 
    	this.totalConIva = totalConIva; 
    }

    public String getDireccion() { 
    	return direccion; 
    }
    
    public void setDireccion(String direccion) { 
    	this.direccion = direccion; 
    }

    public Pedido getPedido() { 
    	return pedido; 
    }
    
    public void setPedido(Pedido pedido) { 
    	this.pedido = pedido; 
    }

    public List<LineaFactura> getLineas() { 
    	return lineas; 
    }
    
    public void setLineas(List<LineaFactura> lineas) { 
    	this.lineas = lineas; 
    }
}