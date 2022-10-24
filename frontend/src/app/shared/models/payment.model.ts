import { KeyValueString } from "./map.model";

export interface SubscriptionItem {
    id: string;
    price: string
}

export interface PendingUpdate {
    expires_at: number,
    subscription_items: SubscriptionItem[];
}

export const Price: KeyValueString = {
    davinci_monthly: 'price_1Kqnj3JWmNZ8txbppODYEPnx',
    davinci_yearly: 'price_1KqnjXJWmNZ8txbpdh8ZyXOu',
    pro_monthly: 'price_1KqoaYJWmNZ8txbp7eb8zhKp',
    pro_yearly: 'price_1Kqob3JWmNZ8txbpNw5AFS68',

    free: 'price_1KqrSjJWmNZ8txbpCHFWxqlZ',
}

export enum PriceType {
    davinci_monthly = 'davinci_monthly',
    davinci_yearly = 'davinci_yearly',
    pro_monthly = 'pro_monthly',
    pro_yearly = 'pro_yearly',

    free = 'free',
}

export enum PaymentFrequency {
    none,
    monthly,
    yearly
}
