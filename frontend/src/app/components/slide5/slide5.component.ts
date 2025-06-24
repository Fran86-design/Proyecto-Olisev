import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SlideService } from '../../services/slide.service';

@Component({
  selector: 'app-slide5',
  imports: [RouterModule],
  templateUrl: './slide5.component.html',
  styleUrl: './slide5.component.css',
  standalone: true
})
export class Slide5Component {

  constructor(private router: Router, public slideService: SlideService) {}

  isActivo(slide: number): boolean {
    return this.router.url.includes('/slide' + slide);
  }
}
