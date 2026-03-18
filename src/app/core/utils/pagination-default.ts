import { AuthService } from '../auth/auth.service';
import { PaginationPayload } from '../models/base-pagination.model';



export function getDefaultPagination(): PaginationPayload {
  return {
    // tenantId: auth.getTenantId(),  // from JWT/sessionStorage
    searchValue: '',
    tenantId: '',
    orderStatus: '',
    notificationType: '',
    pageNo: 1,
    recordPerPage: 10,
    startDate: null,
    expiryDate: null,
    toDate: null,
    formDate: null,
    status: 2,
    vendor: '',
    isOptionExpression: false,
    isPartnerEstimateInvoice: false,
    isCustomer: false,
    customerId: '',
    estimationId: '',
    orderId: '',
    productType: '',
    jobStatus: '',
    jobId: '',
    address: '',
    region: '',
    sortColumn: '',
    sortDirection: 'asc',
    columnFilters: [{ field: '', value: '' }],
    live: true,
    estimateCode: '',
    orderUniqueCode: '',
    isMasterData: true,
  };
}
