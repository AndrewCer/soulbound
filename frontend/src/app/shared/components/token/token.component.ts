import { Component, Input } from '@angular/core';
import { EventData } from 'src/app/shared/models/event.model';
import { SBT } from 'src/app/shared/models/token.model';
import { StringFormatterService } from '../../services/string-formatter.service';

@Component({
    selector: 'token',
    templateUrl: './token.component.html',
    styleUrls: ['./token.component.scss'],
})
export class TokenComponent {
    @Input() eventData: EventData | undefined;
    @Input() metaData: SBT | undefined;
    @Input() invalidClaimAttempt: boolean | undefined;
    @Input() currentRoute: string | undefined;

    @Input() previewOnly: boolean = false;
    @Input() imageUrl: string | undefined;
    @Input() name: string | undefined;
    @Input() description: string | undefined;

    public owner = '0x0000000000000000000000000000000000000000';


    constructor(
        public stringFormatterService: StringFormatterService,
    ) { }
}
