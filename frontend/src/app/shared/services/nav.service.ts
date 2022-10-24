import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';

// Menu
export interface Menu {
	headTitle?: string,
	headTitle2?: string,
	path?: string;
	title?: string;
	icon?: string;
	type?: string;
	badgeType?: string;
	badgeValue?: string;
	badgeClass?: string;
	active?: boolean;
	bookmark?: boolean;
	children?: Menu[];
}

@Injectable({
	providedIn: 'root'
})

export class NavService implements OnDestroy {

	private unsubscriber: Subject<any> = new Subject();
	public screenWidth: BehaviorSubject<number> = new BehaviorSubject(window.innerWidth);

	// Search Box
	public search: boolean = false;

	// Language
	public language: boolean = false;

	// Mega Menu
	public megaMenu: boolean = false;
	public levelMenu: boolean = false;
	public megaMenuColapse: boolean = window.innerWidth < 1199 ? true : false;

	// Collapse Sidebar
	public collapseSidebar: boolean = window.innerWidth < 991 ? true : false;

	// For Horizontal Layout Mobile
	public horizontal: boolean = window.innerWidth < 991 ? false : true;

	// Full screen
	public fullScreen: boolean = false;

	constructor(private router: Router) {
		this.setScreenWidth(window.innerWidth);
		fromEvent(window, 'resize').pipe(
			debounceTime(1000),
			takeUntil(this.unsubscriber)
		).subscribe((evt: any) => {
			this.setScreenWidth(evt.target.innerWidth);
			if (evt.target.innerWidth < 991) {
				this.collapseSidebar = true;
				this.megaMenu = false;
				this.levelMenu = false;
			}
			if (evt.target.innerWidth < 1199) {
				this.megaMenuColapse = true;
			}
		});
		if (window.innerWidth < 991) { // Detect Route change sidebar close
			this.router.events.subscribe(event => {
				this.collapseSidebar = true;
				this.megaMenu = false;
				this.levelMenu = false;
			});
		}
	}

	ngOnDestroy() {
		this.unsubscriber.next;
		this.unsubscriber.complete();
	}

	private setScreenWidth(width: number): void {
		this.screenWidth.next(width);
	}

	MENUITEMS: Menu[] = [
		{
			title: 'Home', path: '/', icon: 'home', type: 'link', active: false
		},
		{
			title: 'Account', path: '/account', icon: 'person', type: 'link', active: false
		},
		// {
		// 	title: 'Settings', path: '/dashboard/dashboard02', icon: 'settings', type: 'link', active: false
		// },
		// Old Format Referance:
		// {
		// 	headTitle: 'MAIN',
		// },
		// {
		// 	title: 'Dashboard', icon: 'home', type: 'sub', active: true, children: [
		// 		{ path: '/dashboard/dashboard01', title: 'Dashboard01', type: 'link' },
		// 		{ path: '/dashboard/dashboard02', title: 'Dashboard02', type: 'link' },
		// 		{ path: '/dashboard/dashboard03', title: 'Dashboard03', type: 'link' }
		// 	]
		// },
	];


	// Array
	items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
}
