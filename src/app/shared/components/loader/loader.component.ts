import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { LoaderService } from '../../services/loader.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit, OnDestroy {
  private subscription!: Subscription;

  constructor(private spinner: NgxSpinnerService, public loader: LoaderService) {}

  ngOnInit(): void {
    this.subscription = this.loader.isLoading$.subscribe((loading) => {
      if (loading) {
        this.spinner.show('primary'); // show spinner animation
      } else {
        this.spinner.hide('primary'); // hide spinner animation
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
