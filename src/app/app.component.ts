import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormOrderComponent } from "./form-order/form-order.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormOrderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'practice-exam';
}
