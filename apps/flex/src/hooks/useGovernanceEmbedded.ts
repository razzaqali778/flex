import { useLocation } from 'react-router-dom';

/** True when rendered inside the Governance hub (tabs). */
export function useGovernanceEmbedded(): boolean {
  const { pathname } = useLocation();
  return pathname.startsWith('/govern/');
}
