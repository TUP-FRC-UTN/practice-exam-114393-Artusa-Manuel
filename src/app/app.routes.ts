import { Routes } from '@angular/router';
import { FormOrderComponent } from './form-order/form-order.component';
import { ListOrderComponent } from './list-order/list-order.component';

export const routes: Routes = [
    { path: '', redirectTo: '/orders', pathMatch: 'full' },
    { path: 'create-order', component: FormOrderComponent },
    { path: 'orders', component: ListOrderComponent }
];
