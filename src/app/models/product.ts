export interface Product{
    id  : number;
    name : string;
    price: number;
    stock: number;
}
export interface OrderProduct {
    productId: number;
    quantity: number;
    stock: number;
    price: number;
}
export interface Order{
    id?:number;
    customerName: string;
    email:string;
    products: OrderProduct[];
    total:number;
    orderCode:string;
    timestamp: string;
}