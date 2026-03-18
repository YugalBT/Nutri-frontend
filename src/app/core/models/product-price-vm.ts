export interface ProductSellingPriceVm {

  productPriceId?: string;

  productId: string;

  priceMonth: string;

  previousMonthPrice: number;

  suggestedPrice: number;

  customerPrice: number;

  commissionPercent: number;

  marginPercent: number;

}