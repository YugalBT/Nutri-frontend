import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/services/http.service';
import { Observable, Subject, tap } from 'rxjs';
import { ApiResponse } from '../../models/api-response';
import { FeedList } from '../../models/feed-list';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class FeedService {

  constructor(private http: HttpService) { }


  private feedChangedSubject = new Subject<void>();
  feedsChanged$ = this.feedChangedSubject.asObservable();

  notifyfeedsChanged() {
    this.feedChangedSubject.next();
  }

  getFeedDetails(payload: any): Observable<ApiResponse<FeedList[]>> {
    return this.http.post<FeedList[]>(API_ENDPOINTS.FEED.GET_ALL, payload);
  }

  createFeeds(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.FEED.CREATE, payload).pipe(
      tap(res => { if (res.isSuccess) this.notifyfeedsChanged(); })
    );
  }

  updateFeeds(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<any>(API_ENDPOINTS.FEED.UPDATE, payload).pipe(
      tap(res => { if (res.isSuccess) this.notifyfeedsChanged(); })
    );
  }


  activeInActive(feedId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.FEED.ACTIVE_INACTIVE}?FeedId=${feedId}`;
    return this.http.post<any>(url, {}).pipe(
      tap(res => { if (res.isSuccess) this.notifyfeedsChanged(); })
    );;
  }

  deleteFeeds(feedId: string): Observable<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.FEED.DELETE}?FeedId=${feedId}`;
    return this.http.post<any>(url, {}).pipe(
      tap(res => { if (res.isSuccess) this.notifyfeedsChanged(); })
    );
  }
}
