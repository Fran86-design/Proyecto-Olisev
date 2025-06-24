import { Directive, ElementRef, Input, OnInit } from '@angular/core';
// Decorador que marca esta clase como una directiva personalizada
@Directive({
    // Este selector permite aplicar la directiva como un atributo HTML: [appResaltarVentas]
    selector: '[appResaltarVentas]'
})
/**
 *  Esta directiva personalizada (`appResaltarVentas`) se utiliza para aplicar estilos 
 *  condicionales a elementos HTML según una cantidad numérica, 
 *  el número de ventas de un producto.
 * 
 *  Si la cantidad es igual o mayor a 5:
 *    El texto se muestra en verde, indicando buen rendimiento.
 *  Si la cantidad es menor a 5:
 *    El texto se muestra en rojo, indicando bajo rendimiento.
 *  Esta directiva mejora la visualización de datos en tablas, listas o dashboards,
 *  destacando visualmente valores críticos sin necesidad de lógica extra en el componente.
 */
export class ResaltarVentasDirective implements OnInit {
    /**
     * Decorador @Input permite recibir un valor desde el componente HTML donde se use esta directiva.
     * 'appResaltarVentas' es el nombre del atributo HTML, y se espera que reciba un número (cantidad).
     */
    @Input('appResaltarVentas') cantidad!: number;
    /**
     * El constructor inyecta una referencia al elemento DOM al que se aplica esta directiva.
     * ElementRef permite acceder directamente al nodo HTML y modificarlo.
     * 
     * @param el - Referencia al elemento del DOM sobre el que actúa la directiva.
     */
    constructor(private el: ElementRef) {}
    /**
     * Método del ciclo de vida que se ejecuta una vez que Angular ha inicializado todas las propiedades del componente/directiva.
     * Aquí es donde se aplica los estilos condicionales al elemento.
     */
    ngOnInit(): void {
        // Si la cantidad es mayor o igual a 5, se considera una buena venta, se pinta en verde
        if (this.cantidad >= 5) {
            this.el.nativeElement.style.color = 'green';
            this.el.nativeElement.style.fontWeight = 'bold';
        // Si es menor a 5, se pinta en rojo como indicativo de pocas ventas
        } else {
            this.el.nativeElement.style.color = 'red';
            this.el.nativeElement.style.fontWeight = 'bold';
        }
    }
}