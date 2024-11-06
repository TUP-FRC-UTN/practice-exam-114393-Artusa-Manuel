import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product } from '../models/product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http: HttpClient = inject(HttpClient)
  private readonly url = "http://localhost:3000/products"

  getProducts():Observable<Product[]>{
    return this.http.get<Product[]>(this.url)
  }
  constructor() { }
}
