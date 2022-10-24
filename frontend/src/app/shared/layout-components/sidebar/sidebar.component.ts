import {
  Component,
  ViewEncapsulation,
  HostListener,
  ElementRef,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Menu, NavService } from '../../services/nav.service';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarComponent {
  public menuItems!: Menu[];
  public url: any;
  constructor(
    private router: Router,
    private navServices: NavService,
    public elRef: ElementRef
  ) {
    this.navServices.items.subscribe((menuItems) => {
      this.menuItems = menuItems;
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          for (const item of menuItems) {
            item.active = false;
            if (item.path === event.url) {
              item.active = true;
            }
          }
        }
      });
    });
  }

  ngOnInit(): void {
    let sidemenu = document.querySelector('.side-menu');
    sidemenu?.addEventListener('scroll', () => { }, { passive: false });
    sidemenu?.addEventListener('wheel', () => { }, { passive: false });

    fromEvent(window, 'resize').subscribe(() => {
      if (window.innerWidth > 772) {
        document
          .querySelector('body.horizontal')
          ?.classList.remove('sidenav-toggled');
      }
      if (
        document
          .querySelector('body')
          ?.classList.contains('horizontal-hover') &&
        window.innerWidth > 772
      ) {
        let li = document.querySelectorAll('.side-menu li');
        li.forEach((e, i) => {
          e.classList.remove('is-expanded');
        });
      }
    });
  }

  // Click Toggle menu
  public toggleNavActive(item: any) {
    if (item.active) {
      return;
    }

    for (const menuItem of this.menuItems) {
      menuItem.active = false;
      if (menuItem.path === item.path) {
        menuItem.active = true;
      }
    }
  }

  sidebarClose() {
    if ((this.navServices.collapseSidebar = true)) {
      document.querySelector('.app')?.classList.remove('sidenav-toggled');
      this.navServices.collapseSidebar = false;
    }
  }

  scrolled: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 70;
  }

}
