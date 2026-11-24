/**
 * Invitation templates Kumbida offers.
 *
 * A template = a layout (the renderer) + a palette + sample content for its demo.
 * The database holds the catalog (prices, previews, active flag); this registry holds
 * what the code needs to render each one. New layouts plug in here.
 */
import { enchantedGardenSample, type InvitationConfig } from './enchanted-garden/sample';

export type LayoutKey = 'garden';

export interface TemplateDef {
  slug: string;
  name: string;
  layout: LayoutKey;
  /** demo content (also the starting point in the builder) */
  sample: InvitationConfig;
}

export const TEMPLATES: TemplateDef[] = [
  {
    slug: 'enchanted-garden',
    name: 'Enchanted Garden',
    layout: 'garden',
    sample: enchantedGardenSample,
  },
];

export const DEFAULT_TEMPLATE = TEMPLATES[0];

export const findTemplate = (slug: string) => TEMPLATES.find((t) => t.slug === slug);
