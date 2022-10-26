import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
    selector: 'claim',
    templateUrl: './claim.component.html',
    styleUrls: ['./claim.component.scss'],
})
export class ClaimComponent implements OnDestroy {
    private subscriptionKiller = new Subject();

    ngOnDestroy() {
        this.subscriptionKiller.next(null);
        this.subscriptionKiller.complete();
    }

}