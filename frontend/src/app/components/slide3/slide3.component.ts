import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SlideService } from '../../services/slide.service';

@Component({
  selector: 'app-slide3',
  imports: [RouterModule],
  templateUrl: './slide3.component.html',
  styleUrl: './slide3.component.css',
  standalone: true
})
export class Slide3Component {

  constructor(private router: Router, public slideService: SlideService) {}

  isActivo(slide: number): boolean {
    return this.router.url.includes('/slide' + slide);
  }
}
