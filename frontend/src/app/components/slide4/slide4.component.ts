import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SlideService } from '../../services/slide.service';

@Component({
  selector: 'app-slide4',
  imports: [RouterModule],
  templateUrl: './slide4.component.html',
  styleUrl: './slide4.component.css',
  standalone: true
})
export class Slide4Component {

  constructor(private router: Router, public slideService: SlideService) {}

  isActivo(slide: number): boolean {
    return this.router.url.includes('/slide' + slide);
  }
}
