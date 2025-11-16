import { Component, inject, OnDestroy } from '@angular/core';
import { RouterModule, Router, NavigationStart, Event as RouterEvent } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnDestroy {
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);

    private readonly popStateHandler = () => {
        try {
            if (!this.auth.isAuthenticatedAndValid()) {
                // force navigation to login and replace history so back cannot return
                this.router.navigate(['/auth/login2'], { replaceUrl: true });
            }
        } catch (e) {
            console.warn('popstate handler error', e);
        }
    };

    private readonly routerSub?: Subscription;

    constructor() {
        // Listen to back/forward navigation and verify token validity
    globalThis.addEventListener('popstate', this.popStateHandler);

        // Also listen to router navigation start to protect routes when user pastes a URL
        this.routerSub = this.router.events.subscribe((evt: RouterEvent) => {
            if (evt instanceof NavigationStart) {
                const url = evt.url;
                // allow navigation to auth routes (login, assets) without token
                if (url.startsWith('/auth') || url.startsWith('/notfound') || url.startsWith('/landing')) return;
                if (!this.auth.isAuthenticatedAndValid()) {
                    // redirect to login2 and replace history
                    this.router.navigate(['/auth/login2'], { replaceUrl: true });
                }
            }
        });
    }

    ngOnDestroy(): void {
        globalThis.removeEventListener('popstate', this.popStateHandler);
        if (this.routerSub) this.routerSub.unsubscribe();
    }
}
