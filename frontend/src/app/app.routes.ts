import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { ZonaPrivadaComponent } from './private/zona-privada/zona-privada.component';
import { GestionClientesTiendaComponent } from './private/gestion-clientes-tienda/gestion-clientes-tienda.component';
import { GestionFabricaComponent } from './private/gestion-fabrica/gestion-fabrica.component';
import { GestionClientesFabricaComponent } from './private/gestion-clientes-fabrica/gestion-clientes-fabrica.component';
import { TiendaVentasComponent } from './pages/tienda-ventas/tienda-ventas.component';
import { CarritoComponent } from './pages/carrito/carrito.component';
import { PagoComponent } from './pages/pago/pago.component';
import { GraciasComponent } from './pages/gracias/gracias.component';
import { ClientesEmpresaComponent } from './pages/clientes-empresa/clientes-empresa.component';

// Definición del array de rutas principales de la aplicación
export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {path: '', component: HomeComponent},
            {path: 'tienda-ventas', component: TiendaVentasComponent},
            {path: 'carrito', component: CarritoComponent},
            {path: 'pago', component: PagoComponent},
            {path: 'gracias', component: GraciasComponent},
            {path: 'tienda',
            loadComponent: () =>
            import('./pages/Catalogo/tienda.component').then(m => m.TiendaComponent)},
            {path: 'elige',
            loadComponent: () =>
            import('./pages/elige/elige.component').then(m => m.EligeComponent)},
            {path: 'transforma',
            loadComponent: () =>
            import('./pages/transforma/transforma.component').then(m => m.TransformaComponent)},
            {path: 'contacto',
            loadComponent: () =>
            import('./pages/contacto/contacto.component').then(m => m.ContactoComponent)},
            {path: 'blog',
            loadComponent: () =>
            import('./pages/blog/blog.component').then(m => m.BlogComponent)},
            {path: 'zona-privada', component: ZonaPrivadaComponent},
            {path: 'clientes-tienda', loadComponent: () => import('./pages/clientes-tienda/clientes-tienda.component').then(m => m.ClientesTiendaComponent) },
            {path: 'gestion-clientes-tienda', component: GestionClientesTiendaComponent },
            {path: 'clientes-empresa', component: ClientesEmpresaComponent},
            {path: 'gestion-tienda',
            loadComponent: () =>
            import('./private/gestion-tienda/gestion-tienda.component').then(m => m.GestionTiendaComponent)},
            { path: 'gestion-tienda/productos',
            loadComponent: () =>
            import('./private/gestion-tienda/productos/productos.component').then(m => m.ProductosComponent)},
            {path: 'gestion-tienda/productos/nuevo',
            loadComponent: () =>
            import('./private/gestion-tienda/productos-nuevos/productos-nuevos.component')
            .then(m => m.ProductosNuevosComponent)},
            {path: 'gestion-tienda/productos/editar/:id',
            loadComponent: () =>
            import('./private/gestion-tienda/productos-editar/productos-editar.component').then(m => m.ProductosEditarComponent)},
            {path: 'gestion-tienda/gestion-pedidos',
            loadComponent: () =>
            import('./private/gestion-tienda/gestion-pedidos/gestion-pedidos.component').then(m => m.GestionPedidosComponent)},
            {path: 'gestion-tienda/inventario',
            loadComponent: () =>
            import('./private/gestion-tienda/inventario/inventario.component').then(m => m.InventarioComponent)},
            {path: 'gestion-tienda/reportes',
            loadComponent: () =>
            import('./private/gestion-tienda/reportes/reportes.component').then(m => m.ReportesComponent)},
            {path: 'stock-control',
            loadComponent: () => import('./components/stock-control/stock-control.component').then(m => m.StockControlComponent)},
            {path: 'gestion-tienda/facturacion',
            loadComponent: () => import('./private/gestion-tienda/facturacion/facturacion.component').then(m => m.FacturacionComponent)},
            { path: 'registro-tienda', loadComponent: () => import('./components/registro-tienda/registro-tienda.component').then(m => m.RegistroTiendaComponent) },
            { path: 'gestion-fabrica', component: GestionFabricaComponent },
            { path: 'gestion-clientes-fabrica', component: GestionClientesFabricaComponent }
            
        ]
    },
    
];
