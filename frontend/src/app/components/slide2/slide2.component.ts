import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SlideService } from '../../services/slide.service';

@Component({
  selector: 'app-slide2',
  imports: [RouterModule],
  templateUrl: './slide2.component.html',
  styleUrl: './slide2.component.css',
  standalone: true
})
export class Slide2Component {
  constructor(private router: Router, public slideService: SlideService) {}

  isActivo(slide: number): boolean {
    return this.router.url.includes('/slide' + slide);
  }
}
