import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader.service';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
constructor(public loader: LoaderService) {}
}
