import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order, OrderStatus } from '../../definitions/order.model';
import { Product } from '../../definitions/product.model';

@Injectable()
export class CartService {
  private products: Product[] = [];
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$: Observable<Product[]> = this.productsSubject.asObservable();

  private ordersCollection: AngularFirestoreCollection<Order>;

  total$: Observable<number> = this.products$
  .pipe(
    map((products: Product[]) => this.getTotal(products))
  );

  client = localStorage.getItem('client');
  waiter = localStorage.getItem('waiter');

  constructor(private afs: AngularFirestore) {
    this.ordersCollection = this.afs.collection<Order>('pedidos');
  }

  getTotal(products: Product[]): number {
    return products.reduce((acc: number, { amount, price }: Product) => acc + (amount * price), 0);
  }

  addCart(newProduct: Product, option?: string): void {
    const productIndex = this.products.findIndex(product => product.id === newProduct.id || product.option === newProduct.option);
    if (productIndex !== -1) {
      this.products[productIndex].amount++;
    } else {
      newProduct.amount = 1;
      newProduct.option = option ? option : '';
      this.products = [...this.products, newProduct];
    }
    this.productsSubject.next(this.products);
  }

  changeAmount(product: Product): void {
    if (product.amount > 1) {
      product.amount--;
      this.productsSubject.next(this.products);
    } else {
      this.removeProduct(product);
    }
  }

  removeProduct(oldProduct: Product): void {
    this.products = this.products.filter(product => product.id !== oldProduct.id);
    this.productsSubject.next(this.products);
  }

  removeAllProducts() {
    this.productsSubject.next([])
  }

  addOrder(): Promise<void> {
    const id = this.afs.createId();
    const order: Order = {
      id,
      name: this.client,
      waiter: this.waiter,
      status: OrderStatus.preparing,
      productsArray: this.products,
      total: this.getTotal(this.products),
      date: new Date(),
    };
    return this.ordersCollection.doc(id).set(order);
  }
}
