import { MarketPricesView } from '@/components/dashboard/market-prices/MarketPricesView';

export default function MarketPricesPage() {
  return (
    <main>
       <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Market Prices</h1>
        <p className="text-muted-foreground">
          Get the latest crop prices from various markets (mandis).
        </p>
      </div>
      <MarketPricesView />
    </main>
  );
}
