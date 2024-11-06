import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Order } from '../models/product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private http: HttpClient = inject(HttpClient)
  private readonly url = "http://localhost:3000/orders"
  constructor() { }

  getOrders():Observable<Order[]>{
    return this.http.get<Order[]>(this.url)
  }
  postOrder(order:Order):Observable<Order>{
    return this.http.post<Order>(this.url,order)
  }
  getOrdersByEmail(email:string):Observable<Order[]>{
    const params = new HttpParams().set('email',email);
    return this.http.get<Order[]>(this.url,{params})
  }
}
