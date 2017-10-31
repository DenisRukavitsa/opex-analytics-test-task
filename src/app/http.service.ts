import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class HttpService {
  private readonly SERVER_URL = 'https://evil-monster-11332.herokuapp.com/';

  constructor(private http: HttpClient) { }

  // Inserting data to the INVENTORY table
  insertInventory (data: any): Observable<Object> {
    return this.http.post(this.SERVER_URL + 'inventory/add', data);
  }

  // Fetching grouped inventory
  fetchInventory(groupBy: string, productId: number): Observable<Object> {
    return this.http.get(this.SERVER_URL +
      `inventory/fetch/date-grouped?groupby=${groupBy}&productid=${productId}`);
  }

  // Fetching distinct product IDs
  fetchProductIds(): Observable<Object> {
    return this.http.get(this.SERVER_URL + 'inventory/fetch/productid-distinct');
  }
}
