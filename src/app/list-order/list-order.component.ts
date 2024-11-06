import { Component, inject, OnInit } from '@angular/core';
import { Order, OrderProduct } from '../models/product';
import { OrdersService } from '../service/orders.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { routes } from '../app.routes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-order',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './list-order.component.html',
  styleUrl: './list-order.component.css'
})
export class ListOrderComponent implements OnInit {
goForm() {
  this.routes.navigate(['create-order'])
}
  
  orders : Order[] =[]
  routes:Router = inject(Router)
  orderService : OrdersService = inject(OrdersService)
  filteredOrders: Order[] = [];
  searchTerm: string = '';
  
  ngOnInit(): void {
    this.loadOrders()
  }
  loadOrders() {
    this.orderService.getOrders().subscribe({
      next:(orders:Order[]) => {
        this.orders = orders
      },
      error:(err) =>{
        alert('Error al cargar Ordenes')
      }
    })
  }
  calculateQuantity(products:OrderProduct[]):number{
    return products.reduce((quantity,product)=>{
      return quantity + (product.quantity); 
    },0);
  }
  filterOrders(): void {
    if (!this.searchTerm.trim()) {
      this.filteredOrders = this.orders;
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase().trim();
    this.filteredOrders = this.orders.filter(order => 
      order.customerName.toLowerCase().includes(searchTermLower) ||
      order.email.toLowerCase().includes(searchTermLower)
    );
  }
  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}
