import { Component, computed, inject } from '@angular/core';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutService } from '@/layout/service/layout.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { AppConfigurator } from '@/layout/components/app.configurator';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CheckboxModule, InputTextModule, FormsModule, RouterModule, IconFieldModule, InputIconModule, ButtonModule, FluidModule, AppConfigurator],
    template: `
        <div class="overflow-hidden margin-0 relative h-screen">
            <div class="bg-cover bg-center" style="background-image: url('/layout/images/pages/login/bg-login.jpg'); height: calc(100% - 370px);"></div>
            <p-fluid class="w-full absolute mb-0 bottom-0 text-center bg-surface-900 dark:bg-surface-0 rounded-none h-[27rem]">
                <div class="px-12 md:p-0 w-[29rem] relative text-white" style="margin-left: -200px; top: 30px; left: 50%;">
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-3 text-left">
                            <img src="/layout/images/pages/login/icon-login.svg" alt="avalon-ng" />
                        </div>
                        <div class="col-span-9 text-left my-auto">
                            <h2 class="mb-0 text-surface-0 dark:text-surface-900">Welcome Guest</h2>
                            <span class="text-surface-500 dark:text-surface-600 text-sm">Sign in to Avalon Network</span>
                        </div>
                        <div class="col-span-12 text-left">
                            <label class="text-surface-400 dark:text-surface-600 mb-1">Username</label>
                            <div class="mt-1">
                                <input type="text" placeholder="Username" pInputText />
                            </div>
                        </div>
                        <div class="col-span-12 text-left">
                            <label class="text-surface-400 dark:text-surface-600 mb-1">Password</label>
                            <div class="mt-1">
                                <input type="password" placeholder="Password" pInputText />
                            </div>
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <button pButton pRipple type="button" [routerLink]="['/']" label="Sign In"></button>
                        </div>
                        <div class="col-span-12 md:col-span-6">
                            <button pButton pRipple class="!text-gray-300 hover:!text-gray-900 dark:!text-gray-600 flex justify-center" text>Forgot Password?</button>
                        </div>
                    </div>
                </div>
            </p-fluid>
        </div>
        <app-configurator simple />
    `
})
export class Login {
    rememberMe: boolean = false;

    LayoutService = inject(LayoutService);

    isDarkTheme = computed(() => this.LayoutService.isDarkTheme());
}
