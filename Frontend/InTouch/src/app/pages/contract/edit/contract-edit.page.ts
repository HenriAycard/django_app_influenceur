import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { IonContent, IonLabel, IonItem, IonTextarea, IonButton, IonInput, IonCol, IonTitle, IonGrid, IonRow, IonButtons, IonToolbar, IonHeader, IonBackButton } from "@ionic/angular/standalone";
import { ContractFormComponent } from "src/app/modal/contract/form/contract-form.component";
import { Deal } from "src/app/models/deal";
import { AlertControllerService } from "src/app/services/alert-controller.service";
import { ApiDealService } from "src/app/services/api/api-deal.service";
import { ReloadService } from "src/app/services/reload.service";
import { ToastService } from "src/app/services/toast.service";

@Component({
    selector: 'app-contract-edit',
    templateUrl: './contract-edit.page.html',
    styleUrls: ['./contract-edit.page.scss'],
    standalone: true,
    imports: [RouterModule, IonContent, IonTitle, IonBackButton, IonToolbar, IonHeader, IonButtons, ContractFormComponent, CommonModule]
})
export class ContractEditPage implements OnInit {
    @Input() contractId!: number;
    public dealInput!: Partial<Deal>;
    public isLoad: boolean = false;


    private alertCtrlService = inject(AlertControllerService);
    private toastService = inject(ToastService);
    private apiDeal = inject(ApiDealService);
    private reloadService = inject(ReloadService);

    constructor(
        private router: Router,
        private route: ActivatedRoute) {
    }
    
    ngOnInit(): void {
        this.apiDeal.findDealById(this.contractId).subscribe({
            next: (value: Deal) => {
                this.dealInput = value
                this.isLoad = true
            }
        })
    }

    async update(deal: Partial<Deal>) {

        this.alertCtrlService.showLoading()

        this.apiDeal.updateDeal(this.contractId, deal).subscribe({
            next: (value: any) => {
                this.toastService.toastSuccess(
                    'Update Contract !',
                    'Your contract has been saved.'
                )
            },
            error: (err: any) => {
                this.toastService.toastDanger(
                    'We have a little problem',
                    'Sorry your contract failed'
                )
            },
            complete: () => {
                this.alertCtrlService.stopLoading()

                this.router.navigate(['../../..'], { relativeTo: this.route }).then(() => {
                    this.reloadService.triggerReload();
                })
            },
        })
        
    }

    customCounterFormatter(inputLength: number, maxLength: number) {
        return `${maxLength - inputLength} characters remaining`;
    }

}