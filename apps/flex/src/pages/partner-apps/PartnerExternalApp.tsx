export type PartnerId = 'eztrac' | 'dhub-rpt';

const PARTNER_FRAMES: Record<PartnerId, string> = {
  eztrac: 'http://localhost:5174/?embed=1',
  'dhub-rpt': 'http://localhost:5175/?embed=1',
};

/** Embeds the standalone partner app — fills remaining viewport below slim Flex header. */
export function PartnerExternalApp({ partner }: { partner: PartnerId }) {
  return (
    <iframe
      title={`${partner === 'eztrac' ? 'EzTrac' : 'dhub-rpt'} plugins`}
      src={PARTNER_FRAMES[partner]}
      className="w-full h-full min-h-[480px] border-0 bg-[#090c14]"
    />
  );
}
