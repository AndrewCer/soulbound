import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { UserAuthService } from 'src/app/core/auth/user/user-auth.service';
import { User } from '../../models/user.model';
import { MagicLinkService } from '../../services/magic-link.service';
import { NavService } from '../../services/nav.service';
import { StringFormatterService } from '../../services/string-formatter.service';
import { SwitcherService } from '../../services/switcher.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public currentRoute: string = '';

  public isCollapsed = true;
  public user: User | undefined;

  constructor(
    public stringFormatterService:  StringFormatterService,
    public SwitcherService: SwitcherService,
    public navServices: NavService,
    private magicLinkService: MagicLinkService,
    private router: Router,
    private userAuthService: UserAuthService,
  ) {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    ).subscribe(event => {
      this.currentRoute = event.url;
      console.log(this.currentRoute);
      
    })

    this.user = this.userAuthService.decodedToken;
  }

  async signout() {
    this.userAuthService.logout();

    await this.magicLinkService.logout();
    this.router.navigate(['/auth/login']);
  }
}
