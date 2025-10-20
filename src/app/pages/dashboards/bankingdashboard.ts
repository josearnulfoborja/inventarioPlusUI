import { Component, inject } from '@angular/core';
import { ProductService } from '@/pages/service/product.service';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { SelectItem } from 'primeng/api';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '@/layout/service/layout.service';
import { TagModule } from 'primeng/tag';

interface MonthlyPayment {
    name?: string;
    amount?: number;
    paid?: boolean;
    date?: string;
}

@Component({
    selector: 'app-banking-dashboard',
    imports: [ChartModule, ButtonModule, CommonModule, ProgressBarModule, TableModule, TagModule],
    providers: [ProductService],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <div class="col-span-12 md:col-span-4 xl:col-span-2">
                <p-button styleClass="w-full !bg-surface-0 dark:!bg-surface-900 !flex !flex-wrap !justify-start !h-full !border-surface !text-primary !p-4">
                    <div
                        class="w-12 h-12 p-4 flex justify-center items-center rounded-full bg-primary-50 text-primary mr-2"
                        [ngClass]="{
                            'bg-primary-900': layoutService.layoutConfig().colorScheme === 'dark'
                        }"
                    >
                        <i class="pi pi-send text-xl"></i>
                    </div>

                    <div class="flex flex-col items-start text-surface-900 dark:text-surface-0">
                        <span class="block h-auto font-bold">Make</span>
                        <span class="block h-auto">Swift Transfer</span>
                    </div>
                </p-button>
            </div>

            <div class="col-span-12 md:col-span-4 xl:col-span-2">
                <p-button styleClass="w-full !bg-surface-0 dark:!bg-surface-900 !flex !flex-wrap !justify-start !h-full !border-surface !text-primary !p-4">
                    <div
                        class="w-12 h-12 p-4 flex justify-center items-center rounded-full bg-primary-50 text-primary mr-2"
                        [ngClass]="{
                            'bg-primary-900': layoutService.layoutConfig().colorScheme === 'dark'
                        }"
                    >
                        <i class="pi pi-money-bill text-xl"></i>
                    </div>

                    <div class="flex flex-col items-start text-surface-900 dark:text-surface-0">
                        <span class="block h-auto font-bold">Pay</span>
                        <span class="block h-auto">Credit Cards</span>
                    </div>
                </p-button>
            </div>

            <div class="col-span-12 md:col-span-4 xl:col-span-2">
                <p-button styleClass="!w-full !bg-surface-0 dark:!bg-surface-900 !flex !flex-wrap !justify-start !h-full !border-surface !text-primary !p-4">
                    <div
                        class="w-12 h-12 p-4 flex justify-center items-center rounded-full bg-primary-50 text-primary mr-2"
                        [ngClass]="{
                            'bg-primary-900': layoutService.layoutConfig().colorScheme === 'dark'
                        }"
                    >
                        <i class="pi pi-credit-card text-xl"></i>
                    </div>

                    <div class="flex flex-col items-start text-surface-900 dark:text-surface-0">
                        <span class="block h-auto font-bold">Make</span>
                        <span class="block h-auto">Card Transfer</span>
                    </div>
                </p-button>
            </div>

            <div class="col-span-12 md:col-span-4 xl:col-span-2">
                <p-button styleClass="!w-full !bg-surface-0 dark:!bg-surface-900 !flex !flex-wrap !justify-start !h-full !border-surface !text-primary !p-4">
                    <div
                        class="w-12 h-12 p-4 flex justify-center items-center rounded-full bg-primary-50 text-primary mr-2"
                        [ngClass]="{
                            'bg-primary-900': layoutService.layoutConfig().colorScheme === 'dark'
                        }"
                    >
                        <i class="pi pi-download text-xl"></i>
                    </div>

                    <div class="flex flex-col items-start text-surface-900 dark:text-surface-0">
                        <span class="block h-auto font-bold">Receive</span>
                        <span class="block h-auto">Money</span>
                    </div>
                </p-button>
            </div>

            <div class="col-span-12 md:col-span-4 xl:col-span-2">
                <p-button styleClass="!w-full !bg-surface-0 dark:!bg-surface-900 !flex !flex-wrap !justify-start !h-full !border-surface !text-primary !p-4">
                    <div
                        class="w-12 h-12 p-4 flex justify-center items-center rounded-full bg-primary-50 text-primary mr-2"
                        [ngClass]="{
                            'bg-primary-900': layoutService.layoutConfig().colorScheme === 'dark'
                        }"
                    >
                        <i class="pi pi-arrow-right-arrow-left text-xl"></i>
                    </div>

                    <div class="flex flex-col items-start text-surface-900 dark:text-surface-0">
                        <span class="block h-auto font-bold">See</span>
                        <span class="block h-auto">Transactions</span>
                    </div>
                </p-button>
            </div>

            <div class="col-span-12 md:col-span-4 xl:col-span-2">
                <p-button styleClass="!w-full !bg-surface-0 dark:!bg-surface-900 !flex !flex-wrap !justify-start !h-full !border-surface !text-primary !p-4">
                    <div
                        class="w-12 h-12 p-4 flex justify-center items-center rounded-full bg-primary-50 text-primary mr-2"
                        [ngClass]="{
                            'bg-primary-900': layoutService.layoutConfig().colorScheme === 'dark'
                        }"
                    >
                        <i class="pi pi-prime text-xl"></i>
                    </div>

                    <div class="flex flex-col items-start text-surface-900 dark:text-surface-0">
                        <span class="block h-auto font-bold">Open</span>
                        <span class="block h-auto">Ticket</span>
                    </div>
                </p-button>
            </div>

            <div class="col-span-12 md:col-span-6 xl:col-span-3">
                <div class="py-6 px-2 rounded-md bg-surface-0 dark:bg-surface-900 flex flex-wrap h-full items-center justify-between gap-4 border border-surface">
                    <div class="flex gap-4 items-center">
                        <div
                            class="w-10 h-10 p-2 flex justify-center items-center rounded-full bg-primary text-surface-0 dark:text-surface-900 mr-2"
                            [ngClass]="{
                                'bg-primary-900 text-900': layoutService.layoutConfig().colorScheme === 'dark'
                            }"
                        >
                            <i class="pi pi-dollar text-2xl"></i>
                        </div>

                        <div>
                            <div class="text-xl font-medium text-left">USD</div>
                            <div class="text-base text-muted-color">Dollar</div>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="flex flex-col gap-1">
                            <span class="text-sm text-muted-color">Latest</span>
                            <span class="text-base font-medium">3,5232</span>
                        </div>

                        <div class="flex flex-col gap-1">
                            <span class="text-sm text-muted-color">Change</span>
                            <span class="text-base font-medium">-0.85</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-6 xl:col-span-3">
                <div class="py-6 px-2 rounded-md bg-surface-0 dark:bg-surface-900 flex flex-wrap h-full items-center justify-between gap-4 border border-surface">
                    <div class="flex gap-4 items-center">
                        <div
                            class="w-10 h-10 p-2 flex justify-center items-center rounded-full bg-primary text-surface-0 dark:text-surface-900 mr-2"
                            [ngClass]="{
                                'bg-primary-900': layoutService.layoutConfig().colorScheme === 'dark'
                            }"
                        >
                            <i class="pi pi-euro text-2xl"></i>
                        </div>

                        <div>
                            <div class="text-xl font-medium text-left">EUR</div>
                            <div class="text-base text-muted-color">Euro</div>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="flex flex-col gap-1">
                            <span class="text-sm text-muted-color">Latest</span>
                            <span class="text-base font-medium">4,1246</span>
                        </div>

                        <div class="flex flex-col gap-1">
                            <span class="text-sm text-muted-color">Change</span>
                            <span class="text-base font-medium">-0.16</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-6 xl:col-span-3">
                <div class="py-6 px-2 rounded-md bg-surface-0 dark:bg-surface-900 flex flex-wrap h-full items-center justify-between gap-4 border border-surface">
                    <div class="flex gap-4 items-center">
                        <div
                            class="w-10 h-10 p-2 flex justify-center items-center rounded-full bg-primary text-surface-0 dark:text-surface-900 mr-2"
                            [ngClass]="{
                                'bg-primary-900': layoutService.layoutConfig().colorScheme === 'dark'
                            }"
                        >
                            <i class="pi pi-pound text-2xl"></i>
                        </div>

                        <div>
                            <div class="text-xl font-medium text-left">GBP</div>
                            <div class="text-base text-muted-color">Pound</div>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="flex flex-col gap-1">
                            <span class="text-sm text-muted-color">Latest</span>
                            <span class="text-base font-medium">4,6300</span>
                        </div>

                        <div class="flex flex-col gap-1">
                            <span class="text-sm text-muted-color">Change</span>
                            <span class="text-base font-medium">-0.25</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 md:col-span-6 xl:col-span-3">
                <div class="py-6 px-2 rounded-md bg-surface-0 dark:bg-surface-900 flex flex-wrap h-full items-center justify-between gap-4 border border-surface">
                    <div class="flex gap-4 items-center">
                        <div
                            class="w-10 h-10 p-2 flex justify-center items-center rounded-full bg-primary text-surface-0 dark:text-surface-900 mr-2"
                            [ngClass]="{
                                'bg-primary-900': layoutService.layoutConfig().colorScheme === 'dark'
                            }"
                        >
                            <i class="pi pi-bitcoin text-2xl"></i>
                        </div>

                        <div>
                            <div class="text-xl font-medium text-left">BTC</div>
                        </div>
                    </div>
                    <div class="flex gap-4">
                        <div class="flex flex-col gap-1">
                            <span class="text-sm text-muted-color">Latest</span>
                            <span class="text-base font-medium">143,059</span>
                        </div>
                        <div class="flex flex-col gap-1">
                            <span class="text-sm text-muted-color">Change</span>
                            <span class="text-base font-medium">-0.85</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6">
                <div class="card h-full">
                    <span class="font-semibold text-xl">Accounts</span>
                    <div class="flex justify-between border-b border-surface p-4">
                        <span class="font-semibold text-muted-color text-xl">Grand Total</span>
                        <span class="text-green-500 text-2xl font-bold">$624,504.00</span>
                    </div>

                    <div class="p-4">
                        <div class="flex items-center justify-between py-2">
                            <div class="flex gap-4 text-lg items-center">
                                <i class="pi pi-money-bill text-muted-color"></i>
                                <span class="text-muted-color">Bank Accounts</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-semibold text-base">$320,521.25</span>
                                <a href="#" class="text-muted-color">
                                    <i class="pi pi-angle-double-right"></i>
                                </a>
                            </div>
                        </div>
                        <div class="flex items-center justify-between py-2">
                            <div class="flex gap-4 text-lg items-center">
                                <i class="pi pi-briefcase text-muted-color"></i>
                                <span class="text-muted-color">Saving</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-semibold text-base">$94,305.00</span>
                                <a href="#" class="text-muted-color">
                                    <i class="pi pi-angle-double-right"></i>
                                </a>
                            </div>
                        </div>

                        <div class="flex items-center justify-between py-2">
                            <div class="flex gap-4 text-lg items-center">
                                <i class="pi pi-globe text-muted-color"></i>
                                <span class="text-muted-color">Stocks</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-semibold text-base">$5,000.00</span>
                                <a href="#" class="text-muted-color">
                                    <i class="pi pi-angle-double-right"></i>
                                </a>
                            </div>
                        </div>
                        <div class="flex items-center justify-between py-2">
                            <div class="flex gap-4 text-lg items-center">
                                <i class="pi pi-dollar text-muted-color"></i>
                                <span class="text-muted-color">Profit</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-semibold text-base">$21.25</span>
                                <a href="#" class="text-muted-color">
                                    <i class="pi pi-angle-double-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-span-12 lg:col-span-6">
                <div class="card h-full">
                    <span class="font-semibold text-xl">Debt Management</span>
                    <div class="flex justify-between border-b border-surface p-4">
                        <span class="font-semibold text-muted-color text-xl">Grand Total</span>
                        <span class="text-red-500 text-2xl font-bold">$-125,330.00</span>
                    </div>

                    <div class="p-4">
                        <div class="flex items-center justify-between py-2">
                            <div class="flex gap-4 text-lg items-center">
                                <i class="pi pi-briefcase text-muted-color"></i>
                                <span class="text-muted-color">Used Credits</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-semibold text-base">$100,240.00</span>
                                <a href="#" class="text-muted-color">
                                    <i class="pi pi-angle-double-right"></i>
                                </a>
                            </div>
                        </div>

                        <div class="flex items-center justify-between py-2">
                            <div class="flex gap-4 text-lg items-center">
                                <i class="pi pi-calendar text-muted-color"></i>
                                <span class="text-muted-color">Loans</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-semibold text-base">$25,090.00</span>
                                <a href="#" class="text-muted-color">
                                    <i class="pi pi-angle-double-right"></i>
                                </a>
                            </div>
                        </div>
                        <div class="flex items-center justify-between py-2">
                            <div class="flex gap-4 text-lg items-center">
                                <i class="pi pi-ticket text-muted-color"></i>
                                <span class="text-muted-color">Overdrafts</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-semibold text-base">$0</span>
                                <a href="#" class="text-muted-color">
                                    <i class="pi pi-angle-double-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6">
                <div class="card h-full">
                    @if (!layoutService.isDarkTheme()) {
                        <div class="w-full h-[17rem] bg-cover bg-center bg-no-repeat" style="background-image:url(/demo/images/dashboard-banking/asset-japan.jpg);"></div>
                    } @else {
                        <div class="w-full h-[17rem] bg-cover bg-center bg-no-repeat" style="background-image:url(/demo/images/dashboard-banking/asset-japan-night.jpg);"></div>
                    }

                    <div>
                        <h3 class="mt-4"><strong>Journey to Japan</strong></h3>
                        <div>
                            <p-progressbar [value]="30" styleClass="rounded-border" [style]="{ height: '.5rem' }" [showValue]="false"></p-progressbar>
                        </div>
                        <div class="text-muted-color my-4">
                            <p>
                                <span><b>$3,000.00</b></span> from $10,000.00
                            </p>
                        </div>

                        <div class="flex items-center justify-between my-4">
                            <p-button label="Deposit"></p-button>
                            <a href="#" class="p-button-link">Withdraw</a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6">
                <div class="card">
                    <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-4">Monthly Payments</div>
                    <p-table [value]="payments" responsiveLayout="scroll">
                        <ng-template pTemplate="header">
                            <tr>
                                <th class="whitespace-nowrap w-4/12">Name</th>
                                <th class="whitespace-nowrap w-4/12">Amount</th>
                                <th class="whitespace-nowrap w-4/12">Date</th>
                                <th class="whitespace-nowrap w-4/12">Status</th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-payment>
                            <tr>
                                <td>{{ payment.name }}</td>
                                <td>{{ payment.amount | currency }}</td>
                                <td>{{ payment.date }}</td>
                                <td class="text-right">
                                    <p-tag *ngIf="payment.paid" value="COMPLETED" severity="success"></p-tag>
                                    <p-tag *ngIf="!payment.paid" value="PENDING" severity="warn"></p-tag>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6">
                <div class="card h-full flex flex-col gap-4 md:gap-0">
                    <div class="font-semibold text-xl mb-4">Transactions</div>

                    <div class="flex items-center justify-between">
                        <div class="flex w-7/12 items-center justify-between">
                            <img src="/demo/images/dashboard-banking/asset-visa.png" alt="avalon-layout" width="52" />
                            <div class="flex flex-col">
                                <span class="font-medium">07 July 2023</span>
                                <span class="text-muted-color">11.05</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="font-medium">Online Payment</span>
                                <span class="text-muted-color">Visa Card</span>
                            </div>
                        </div>
                        <div class="w-5/12 flex justify-end">
                            <button pButton label="See Details"></button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex w-7/12 items-center justify-between">
                            <img src="/demo/images/dashboard-banking/asset-netflix.png" alt="avalon-layout" width="52" />
                            <div class="flex flex-col">
                                <span class="font-medium">06 July 2023</span>
                                <span class="text-muted-color">11.05</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="font-medium">Online Payment</span>
                                <span class="text-muted-color">Netflix</span>
                            </div>
                        </div>
                        <div class="w-5/12 flex justify-end">
                            <button pButton label="See Details"></button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex w-7/12 items-center justify-between">
                            <img src="/demo/images/dashboard-banking/asset-spotify.png" alt="avalon-layout" width="52" />
                            <div class="flex flex-col">
                                <span class="font-medium">05 July 2023</span>
                                <span class="text-muted-color">08.32</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="font-medium">Online Payment</span>
                                <span class="text-muted-color">Spotify</span>
                            </div>
                        </div>
                        <div class="w-5/12 flex justify-end">
                            <button pButton label="See Deatils"></button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex w-7/12 items-center justify-between">
                            <img src="/demo/images/dashboard-banking/asset-newyorker.png" alt="avalon-layout" width="52" />
                            <div class="flex flex-col">
                                <span class="font-medium">02 July 2023</span>
                                <span class="text-muted-color">14.46</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="font-medium">Purchase</span>
                                <span class="text-muted-color">The New Yorker</span>
                            </div>
                        </div>
                        <div class="w-5/12 flex justify-end">
                            <button pButton label="See Details"></button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex w-7/12 items-center justify-between">
                            <img src="/demo/images/dashboard-banking/asset-google.png" alt="avalon-layout" width="52" />
                            <div class="flex flex-col">
                                <span class="font-medium">02 July 2023</span>
                                <span class="text-muted-color">12.51</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="font-medium">Online Payment</span>
                                <span class="text-muted-color">Google</span>
                            </div>
                        </div>
                        <div class="w-5/12 flex justify-end">
                            <button pButton label="See Details"></button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="flex w-7/12 items-center justify-between">
                            <img src="/demo/images/dashboard-banking/asset-soundcloud.png" alt="avalon-layout" width="52" />
                            <div class="flex flex-col">
                                <span class="font-medium">01 July 2023</span>
                                <span class="text-muted-color">09.27</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="font-medium">Online Payment</span>
                                <span class="text-muted-color">SoundCloud</span>
                            </div>
                        </div>
                        <div class="w-5/12 flex justify-end">
                            <button pButton label="See Details"></button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-6">
                <div class="card h-full">
                    <div class="font-semibold text-xl mb-4">Monthly Statistics</div>
                    <p-chart type="bar" [data]="visitorChart" [options]="visitorChartOptions" id="visitor-chart"></p-chart>
                </div>
            </div>
        </div>
    `
})
export class BankingDashboard {
    dropdownItem: SelectItem[] = [];

    selectedDropdownItem: any;

    payments: MonthlyPayment[] = [];

    visitorChart: any;

    visitorChartOptions: any;

    subscription!: Subscription;

    layoutService: LayoutService = inject(LayoutService);

    constructor() {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(50)).subscribe((config) => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.dropdownItem.push({ label: 'Select One', value: null });
        this.dropdownItem.push({
            label: 'Xbox Series X',
            value: { id: 1, name: 'Xbox One', code: 'XO' }
        });
        this.dropdownItem.push({
            label: 'PlayStation 5',
            value: { id: 2, name: 'PS4', code: 'PS4' }
        });
        this.dropdownItem.push({
            label: 'Nintendo Switch',
            value: { id: 3, name: 'Wii U', code: 'WU' }
        });

        this.payments = [
            {
                name: 'Electric Bill',
                amount: 75.6,
                paid: true,
                date: '06/04/2022'
            },
            {
                name: 'Water Bill',
                amount: 45.5,
                paid: true,
                date: '07/04/2022'
            },
            { name: 'Gas Bill', amount: 45.2, paid: false, date: '12/04/2022' },
            {
                name: 'Internet Bill',
                amount: 25.9,
                paid: true,
                date: '17/04/2022'
            },
            {
                name: 'Streaming',
                amount: 40.9,
                paid: false,
                date: '20/04/2022'
            },
            {
                name: 'Phone Bill',
                amount: 32.9,
                paid: false,
                date: '23/04/2022'
            }
        ];

        this.initChart();
    }

    initChart() {
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color');
        const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color');
        const surfaceBorder = getComputedStyle(document.body).getPropertyValue('--surface-border');

        this.visitorChart = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    data: [600, 671, 660, 665, 700, 610, 810, 790, 710, 860, 810, 780],
                    backgroundColor: primaryColor,
                    fill: true,
                    barPercentage: 0.75,
                    stepped: true
                }
            ]
        };

        this.visitorChartOptions = {
            plugins: {
                legend: {
                    display: false
                }
            },

            maintainAspectRatio: false,
            aspectRatio: 1,
            responsive: true,
            hover: {
                mode: 'index'
            },
            scales: {
                y: {
                    min: 500,
                    max: 900,
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: surfaceBorder
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        display: false
                    }
                }
            }
        };
    }
}
