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
    selector: 'app-login2',
    standalone: true,
    imports: [CheckboxModule, InputTextModule, FormsModule, RouterModule, IconFieldModule, InputIconModule, ButtonModule, FluidModule, AppConfigurator],
    template: `
        <div class="text-primary bg-primary-contrast">
            <div class="flex justify-center">
                <div class="w-full lg:w-5/12 h-screen text-center flex justify-center items-start">
                    <div class="z-50 w-full lg:w-8/12 px-12 text-center mt-20" style="max-width: 400px">
                        <div class="w-full flex items-center justify-center">
                            <img src="/layout/images/pages/login/icon-login.svg" alt="avalon-layout" class="w-24" />
                        </div>
                        <div class="text-4xl font-light my-6 text-primary-500">Sign in to Avalon</div>
                        <p>Welcome, please use the form to sign-in Avalon network</p>
                        <div class="mt-8 text-left">
                            <label for="username" class="block mb-2 text-surface-600 dark:text-surface-400">Username</label>
                            <p-iconfield class="block">
                                <input id="username" type="text" pInputText class="w-full" />
                                <p-inputicon class="pi pi-user" />
                            </p-iconfield>

                            <label for="username" class="block mb-2 mt-4 text-surface-600 dark:text-surface-400">Password</label>
                            <p-iconfield class="block">
                                <input type="password" pInputText class="w-full" />
                                <p-inputicon class="pi pi-lock" />
                            </p-iconfield>

                            <div class="flex items-center justify-between mt-8">
                                <div class="flex items-center">
                                    <p-checkbox label="Remember me" value="SaveInfo" [binary]="true" class="mr-2"></p-checkbox>
                                    <label for="rememberme1">Remember me</label>
                                </div>
                            </div>

                            <div class="flex items-center justify-between mt-6 gap-4">
                                <button pButton type="button" [routerLink]="['/']" label="Login" class="w-40"></button>
                                <a href="#" class="secondary-button">Forgot Password?</a>
                            </div>
                        </div>
                    </div>
                </div>

                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="absolute bottom-0 w-screen" viewBox="0 0 1440 250">
                    <defs>
                        <linearGradient id="c" x1="50%" x2="50%" y1="0%" y2="100%">
                            <stop offset="0%" stop-color="var(--primary-200)" />
                            <stop offset="99.052%" stop-color="var(--primary-300)" />
                        </linearGradient>
                        <path id="b" d="M0 202c142.333-66.667 249-90 320-70 106.5 30 122 83.5 195 83.5h292c92.642-106.477 190.309-160.81 293-163 102.691-2.19 216.025 47.643 340 149.5v155.5H0V202z" />
                        <filter id="a" width="105.1%" height="124.3%" x="-2.6%" y="-12.8%" filterUnits="objectBoundingBox">
                            <feOffset dy="-2" in="SourceAlpha" result="shadowOffsetOuter1" />
                            <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="12" />
                            <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.11 0" />
                        </filter>
                        <linearGradient id="d" x1="50%" x2="50%" y1="0%" y2="99.142%">
                            <stop offset="0%" stop-color="var(--primary-300)" />
                            <stop offset="100%" stop-color="var(--primary-500)" />
                        </linearGradient>
                    </defs>
                    <g fill="none" fill-rule="evenodd">
                        <g transform="translate(0 .5)">
                            <use fill="#000" filter="url(#a)" xlink:href="#b" />
                            <use fill="url(#c)" xlink:href="#b" />
                        </g>
                        <path fill="url(#d)" d="M0 107c225.333 61.333 364.333 92 417 92 79 0 194-79.5 293-79.5S914 244 1002 244s156-45 195-68.5c26-15.667 107-74.167 243-175.5v357.5H0V107z" transform="translate(0 .5)" />
                    </g>
                </svg>
            </div>
        </div>
        <app-configurator simple />
    `
})
export class Login2 {
    rememberMe: boolean = false;

    LayoutService = inject(LayoutService);

    isDarkTheme = computed(() => this.LayoutService.isDarkTheme());
}
