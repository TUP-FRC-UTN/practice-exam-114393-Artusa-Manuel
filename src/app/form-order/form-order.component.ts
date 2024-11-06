import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Order, OrderProduct, Product } from '../models/product';
import { ProductService } from '../service/product.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrdersService } from '../service/orders.service';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-form-order',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './form-order.component.html',
  styleUrl: './form-order.component.css'
})
export class FormOrderComponent implements OnInit {
  orderForm: FormGroup;
  productsList: Product[] = [];
  
  private productService = inject(ProductService);
  private ordersService = inject(OrdersService);
  private routes = inject(Router);
  total:number = 0

  constructor(private fb: FormBuilder) {
    this.orderForm = this.fb.group({
      customerName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email],[this.validateEmailOrders]],
      products: this.fb.array([],[Validators.required,this.validateDuplicateProducts])
    });
  }

  validateDuplicateProducts: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const productsControl = control as FormArray;
    const products: OrderProduct[] = productsControl.value;
    const uniqueProducts = new Set(products.map((p) => p.productId));
  
    if (uniqueProducts.size !== products.length) {
      return { duplicateProducts: true };
    }
  
    return null;
  };
  validateEmailOrders = (control: any): Observable<any> => {
    const email = control.value;

    return this.ordersService.getOrdersByEmail(email).pipe(
      map((orders) => {
        const lastDayOrders = orders.filter((order) => {
          const orderDate = new Date(order.timestamp);
          const lastDay = new Date();
          lastDay.setDate(lastDay.getDate() - 1);
          return orderDate > lastDay;
        });

        if (lastDayOrders.length >= 3) {
          return { emailLimitExceeded: true };
        }
        return null;
      }),
      catchError(() => of(null))
    );
  };

  ngOnInit(): void {
    this.loadProducts();

    this.products.valueChanges.subscribe(() => {
      this.orderForm.get('total')?.setValue(this.calculateTotal(), { emitEvent: false });
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.productsList = products;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        alert('Error al cargar los productos');
      }
    });
  }

  get products(): FormArray {
    return this.orderForm.get('products') as FormArray;
  }

  addProducts(): void {
    const productGroup = this.fb.group({
      productId: [null, Validators.required],
      productName: [{ value: null, disabled: true }],
      quantity: [1, [Validators.required, Validators.min(1)]],
      stock: [{ value: null, disabled: true }],
      price: [{ value: null, disabled: true }]
    });

    this.products.push(productGroup);
  }

  onProductChanges(index: number): void {
    const selectedProductId = this.products.at(index).get('productId')?.value;
    const selectedProduct = this.productsList.find(product => product.id === selectedProductId);

    if (selectedProduct) {
      this.products.at(index).patchValue({
        productName: selectedProduct.name,
        stock: selectedProduct.stock,
        price: selectedProduct.price
      });

      // Actualizar validador de cantidad máxima
      const quantityControl = this.products.at(index).get('quantity');
      quantityControl?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(selectedProduct.stock)
      ]);
      quantityControl?.updateValueAndValidity();
    }
  }

  generateOrderCode(email: string): string {
    const firstChar = email.charAt(0).toUpperCase();
    const domain = email.split('@')[1].split('.')[0];
    const timestamp = new Date().getTime() % 1000000;
    return `${firstChar}.${domain}${timestamp.toString().padStart(6, '0')}`;
  }

  calculateTotal(): number {
    let total = this.products.controls.reduce((accumulatedTotal, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      return accumulatedTotal + (quantity * price);
    }, 0);
  
    return parseFloat(total.toFixed(2))
  }
  realizarDescuento(){
    let total = this.calculateTotal();
    if (total > 1000) {
      total -= total * 0.1;
    }
    return parseFloat(total.toFixed(2))
  }
  

  onSubmit(): void {
    
    if (this.orderForm.valid) {
      const formValue = this.orderForm.getRawValue();
      const orderProducts: OrderProduct[] = formValue.products.map((p: any) => ({
        productId: p.productId,
        quantity: p.quantity,
        stock: p.stock,
        price: p.price
        
      }));
      const order: Order = {
        customerName: formValue.customerName,
        email: formValue.email,
        products: orderProducts,
        total: this.realizarDescuento(),
        orderCode: this.generateOrderCode(formValue.email),
        timestamp: new Date().toISOString(),
        
      };

      this.ordersService.postOrder(order).subscribe({
        next: (response) => {
          console.log('Order created successfully:', response);
          alert('Orden creada exitosamente');
          this.orderForm.reset();
          this.products.clear();
          this.addProducts();
        },
        error: (error) => {
          console.error('Error creating order:', error);
          alert('Error al crear la orden');
        }
      });
    } else {
      this.markFormGroupTouched(this.orderForm);
    }
  }

  removeProduct(index: number): void {
    this.products.removeAt(index);
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.orderForm.get(controlName);
    return control?.touched && control?.hasError(errorName) || false;
  }

  hasProductError(index: number, controlName: string, errorName: string): boolean {
    const control = this.products.at(index).get(controlName);
    return control?.touched && control?.hasError(errorName) || false;
  }
  goLista() {
    this.routes.navigate(['orders'])
  }
}