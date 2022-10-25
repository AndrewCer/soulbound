import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { UserAuthService } from 'src/app/core/auth/user/user-auth.service';
import { User } from '../../models/user.model';
import { WalletStatus } from '../../models/wallet.model';
import { MagicLinkService } from '../../services/magic-link.service';
import { NavService } from '../../services/nav.service';
import { StringFormatterService } from '../../services/string-formatter.service';
import { SwitcherService } from '../../services/switcher.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnDestroy {
  public currentRoute: string = '';
  public walletAddress: string | undefined;

  private subscriptionKiller = new Subject();


  public isCollapsed = true;

  constructor(
    public stringFormatterService: StringFormatterService,
    public SwitcherService: SwitcherService,
    public navServices: NavService,
    private magicLinkService: MagicLinkService,
    private router: Router,
    private userAuthService: UserAuthService,

    private walletService: WalletService,
  ) {
    this.router.events.pipe(
      takeUntil(this.subscriptionKiller),
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    ).subscribe(event => {
      this.currentRoute = event.url;
    });

    this.walletService.$walletConnectionChanges.pipe(
      takeUntil(this.subscriptionKiller)
    )
      .subscribe((walletStatus: WalletStatus | undefined) => {
        if (walletStatus === undefined) {
          return;
        }

        this.handleWalletChanges(walletStatus);
      });
  }

  public connectClicked() {
    this.walletService.connect();
  }

  async signout() {
    this.userAuthService.logout();

    await this.magicLinkService.logout();
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy() {
    this.subscriptionKiller.next(null);
    this.subscriptionKiller.complete();
  }

  private async handleWalletChanges(walletStatus: WalletStatus) {
    switch (walletStatus) {
      case WalletStatus.connected:
        this.walletAddress = await this.walletService.getAddress();
        break;
      case WalletStatus.disconnected:
        break;
      case WalletStatus.switched:
        break;
      case WalletStatus.error:
        break;

      default:
        break;
    }
  }
}
