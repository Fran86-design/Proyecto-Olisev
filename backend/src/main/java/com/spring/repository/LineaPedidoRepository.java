package com.spring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.spring.model.LineaPedido;

//Esta interfaz representa un repositorio para trabajar con la entidad LineaPedido.
public interface LineaPedidoRepository extends JpaRepository<LineaPedido, Long> {
	
}