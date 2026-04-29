import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { CommonService } from '../../shared/services/common.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../i18n/translate.service';
import { Constants } from '../../shared/utils/constants/constants';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { PERMISSIONS } from '../../core/constants/permissions.constants';

@Component({
  selector: 'app-calves-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: './calves-entry.component.html',
  styleUrls: ['./calves-entry.component.css'],
})
export class CalvesEntryComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isLoading = false;
  isSaving = false;
  isSuperAdmin = false;
  canSave = false;

  selectedDate: string = this.getToday();
  selectedCompanyId = '';
  companies: { id: string; name: string }[] = [];

  dayId = '';
  farmId = '';

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private toast: ToastService,
    private common: CommonService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.isSuperAdmin = localStorage.getItem(Constants.IsSuperAdmin) === 'true';
    this.canSave = this.common.checkPermission(PERMISSIONS.DailyEntryAdd, false)
      || this.common.checkPermission(PERMISSIONS.DailyEntryEdit, false);

    this.initForm();

    if (this.isSuperAdmin) {
      const sub = this.common.getCompanyDropdown().subscribe({
        next: (res) => {
          this.companies = res?.data ?? [];
          if (this.companies.length > 0) {
            this.selectedCompanyId = this.companies[0].id;
          }
          this.loadDay();
        },
      });
      this.subs.push(sub);
    } else {
      this.loadDay();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private initForm(): void {
    this.form = this.fb.group({
      // Individual hutch calves
      indAnimals: [null],
      indAvgMilk: [null],
      indPowder: [null],
      indAvgFeed: [null],
      // Group box calves
      grpAnimals: [null],
      grpAvgMilk: [null],
      grpPowder: [null],
      grpAvgFeed: [null],
    });
  }

  onDateChange(): void {
    this.loadDay();
  }

  onCompanyChange(): void {
    this.loadDay();
  }

  private loadDay(): void {
    this.isLoading = true;
    this.dayId = '';
    this.farmId = '';
    this.form.reset();

    const cid = this.isSuperAdmin && this.selectedCompanyId ? this.selectedCompanyId : undefined;

    const sub = this.common.getDayList(cid).subscribe({
      next: (res: any) => {
        const days: any[] = Array.isArray(res?.data) ? res.data : [];
        const match = days.find((d: any) => {
          const dayDate = (d.date ?? '').split('T')[0];
          return dayDate === this.selectedDate;
        });

        if (match) {
          this.dayId = match.dayId ?? match.DayId ?? '';
          this.farmId = match.farmId ?? match.FarmId ?? '';
          this.loadCalvesData();
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
    this.subs.push(sub);
  }

  private loadCalvesData(): void {
    if (!this.dayId) {
      this.isLoading = false;
      return;
    }

    const sub = this.http
      .get<any>(`${API_ENDPOINTS.DAY_DATA.GET_BY_DAY_ID}/${this.dayId}`)
      .subscribe({
        next: (res) => {
          const d = res?.data;
          if (d) {
            this.form.patchValue({
              indAnimals: d.indAnimals,
              indAvgMilk: d.indAvgMilk,
              indPowder: d.indPowder,
              indAvgFeed: d.indAvgFeed,
              grpAnimals: d.grpAnimals,
              grpAvgMilk: d.grpAvgMilk,
              grpPowder: d.grpPowder,
              grpAvgFeed: d.grpAvgFeed,
            });
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
    this.subs.push(sub);
  }

  save(): void {
    if (!this.canSave || this.isSaving) return;

    if (this.dayId) {
      this.persistCalvesData(this.dayId);
    } else {
      this.createDayAndSave();
    }
  }

  private createDayAndSave(): void {
    this.isSaving = true;
    const payload: any = { date: this.selectedDate, isClosed: false, farmId: null };
    if (this.isSuperAdmin && this.selectedCompanyId) {
      payload['companyId'] = this.selectedCompanyId;
    }

    const sub = this.http.post<any>(API_ENDPOINTS.DAY.CREATE, payload).subscribe({
      next: (res) => {
        if (!res?.isSuccess) {
          this.toast.error(res?.message ?? this.translate.instant('dailyEntry.messages.saveError'));
          this.isSaving = false;
          return;
        }
        // Re-load day list to get the new dayId, then persist
        const cid = this.isSuperAdmin && this.selectedCompanyId ? this.selectedCompanyId : undefined;
        const sub2 = this.common.getDayList(cid).subscribe({
          next: (res: any) => {
            const days: any[] = Array.isArray(res?.data) ? res.data : [];
            const match = days.find((d: any) => (d.date ?? '').split('T')[0] === this.selectedDate);
            if (match) {
              this.dayId = match.dayId ?? match.DayId ?? '';
              this.farmId = match.farmId ?? match.FarmId ?? '';
              this.persistCalvesData(this.dayId);
            } else {
              this.toast.error(this.translate.instant('dailyEntry.messages.saveError'));
              this.isSaving = false;
            }
          },
          error: () => {
            this.isSaving = false;
          },
        });
        this.subs.push(sub2);
      },
      error: () => {
        this.toast.error(this.translate.instant('dailyEntry.messages.saveError'));
        this.isSaving = false;
      },
    });
    this.subs.push(sub);
  }

  private persistCalvesData(dayId: string): void {
    this.isSaving = true;
    const v = this.form.value;

    const payload: any = {
      dayId,
      farmId: this.farmId || '00000000-0000-0000-0000-000000000000',
      date: this.selectedDate,
      ...(this.isSuperAdmin && this.selectedCompanyId ? { tenantId: this.selectedCompanyId } : {}),
      // Calves fields only — all other fields omitted (backend preserves existing values)
      indAnimals: v.indAnimals,
      indAvgMilk: v.indAvgMilk,
      indPowder: v.indPowder,
      indAvgFeed: v.indAvgFeed,
      grpAnimals: v.grpAnimals,
      grpAvgMilk: v.grpAvgMilk,
      grpPowder: v.grpPowder,
      grpAvgFeed: v.grpAvgFeed,
    };

    const sub = this.http.post<any>(API_ENDPOINTS.DAY_DATA.SAVE_CALVES, payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toast.success(res.message ?? this.translate.instant('dailyEntry.messages.saveSuccess'));
          this.loadDay();
        } else {
          this.toast.error(res.message);
        }
        this.isSaving = false;
      },
      error: () => {
        this.toast.error(this.translate.instant('dailyEntry.messages.saveError'));
        this.isSaving = false;
      },
    });
    this.subs.push(sub);
  }
}
