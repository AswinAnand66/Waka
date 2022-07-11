import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css'],
  encapsulation:ViewEncapsulation.None
})
export class SplashComponent implements OnInit {

  height: number = window.innerHeight;
  width: number = window.innerWidth;
  transition:string;
  showSplash:boolean = true;
  windowWidth:string;
  transform:string = 'none'

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.windowWidth = "-"+window.innerWidth+"px";
      setTimeout(() => {
        this.showSplash = false;
      }, 3000);
    }, 2000);
  }

}
