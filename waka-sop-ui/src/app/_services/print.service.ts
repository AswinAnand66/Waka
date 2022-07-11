import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class PrintService {
  isPrinting = false;

  constructor(
    private router: Router,
    private location: Location
    ) { }

  printDocument(documentName: string) {
    this.isPrinting = true;
    window.open(documentName); 
    //this.router.navigate([documentName]);
  }

  onDataReady() {
    setTimeout(() => {
      window.print();
      this.isPrinting = false;
      //this.location.back();
      window.close();
    });
  }
}
