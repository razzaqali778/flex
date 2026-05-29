import { sectionForPath } from '../lib/navStructure';

export function PageSectionBadge({ pathname }: { pathname: string }) {
  const section = sectionForPath(pathname);
  if (!section || section === 'Overview') return null;

  return (
    <p className="text-[10px] uppercase tracking-wider text-flex-accent2 mb-2 -mt-2">
      {section}
    </p>
  );
}
