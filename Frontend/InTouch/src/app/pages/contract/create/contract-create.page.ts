import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Deal } from 'src/app/models/deal';
import { AlertControllerService } from 'src/app/services/alert-controller.service';
import { ApiDealService } from 'src/app/services/api/api-deal.service';
import { ToastService } from 'src/app/services/toast.service';
import { IonContent, IonTitle, IonToolbar, IonBackButton, IonHeader, IonButtons } from '@ionic/angular/standalone';
import { ReloadService } from 'src/app/services/reload.service';
import { ContractFormComponent } from 'src/app/modal/contract/form/contract-form.component';

@Component({
    selector: 'app-contract-create',
    templateUrl: './contract-create.page.html',
    styleUrls: ['./contract-create.page.scss'],
    standalone: true,
    imports: [RouterModule, IonContent, IonTitle, IonBackButton, IonToolbar, IonHeader, IonButtons, ContractFormComponent]
})
export class ContractCreatePage {
    @Input() companyId!: number;
    public dealInput!: Partial<Deal>;

    private alertCtrlService = inject(AlertControllerService);
    private toastService = inject(ToastService);
    private apiDeal = inject(ApiDealService);
    private reloadService = inject(ReloadService);

    constructor(
        private router: Router,
        private route: ActivatedRoute) {
            console.log("create new page")
    }

    async save(deal: Partial<Deal>) {
        this.alertCtrlService.showLoading()

        let newDeal: Partial<Deal> = {
            company: this.companyId,
            ...deal
        }

        this.apiDeal.createDeal(newDeal).subscribe({
            next: (value: any) => {
                this.toastService.toastSuccess(
                    'New Contract !',
                    'A new contract has been saved.'
                )
                this.alertCtrlService.stopLoading()
            },
            error: (err: any) => {
                this.toastService.toastDanger(
                    'We have a little problem',
                    'Sorry your contract failed'
                )
                this.alertCtrlService.stopLoading()
            },
            complete: () => {
                this.router.navigate(['../..'], { relativeTo: this.route }).then(() => {
                    this.reloadService.triggerReload();
                })
            },
        })

    }

}