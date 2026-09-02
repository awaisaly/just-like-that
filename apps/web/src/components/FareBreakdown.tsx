import { formatMoney } from '@jlt/shared';
import { instalmentServiceFee, payableFare, type OfferPrice } from '../lib/pricing';

export function FareBreakdown({
  price,
  payment,
  headline,
}: {
  price: OfferPrice;
  payment: 'full' | 'installments';
  headline?: boolean;
}) {
  const fee = instalmentServiceFee(price);
  const showFee = payment === 'installments' && fee.amount > 0;
  const payable = payableFare(price, payment);

  return (
    <div>
      {headline ? <div className="price">{formatMoney(payable)}</div> : null}
      {headline ? (
        <p className="text-xs text-muted">
          {showFee
            ? 'indicative · fare plus instalment service fee'
            : 'indicative fare · incl. taxes'}
        </p>
      ) : null}
      <div className={`grid gap-1 text-sm ${headline ? 'mt-3 border-t border-line pt-3' : ''}`}>
        <Row label="Fare" value={formatMoney(price.total)} />
        {showFee ? <Row label="Instalment service fee" value={formatMoney(fee)} /> : null}
        <Row
          label={showFee ? 'Total with instalments' : 'Total'}
          value={formatMoney(payable)}
          strong
        />
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={strong ? 'font-semibold text-ink' : 'text-muted'}>{label}</span>
      <span className={strong ? 'font-bold text-brand-navy' : 'font-semibold text-ink'}>{value}</span>
    </div>
  );
}
