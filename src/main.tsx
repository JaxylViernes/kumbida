import React from 'react';
import ReactDOM from 'react-dom/client';
import { DEFAULT_TEMPLATE, findTemplate } from './templates/registry';
import './index.css';

/**
 * One build, two kinds of page:
 *  - invitations (`/`, `/demo/:template`, later `/i/:slug`) load only the
 *    invitation's code, so guests get the lightest, fastest page;
 *  - everything else loads the Kumbida platform.
 */
const root = document.getElementById('root')!;
const base = import.meta.env.BASE_URL; // '/' locally, '/kumbida/' on GitHub Pages
const path = ('/' + window.location.pathname.slice(base.length)).replace(/\/+$/, '') || '/';
const demo = path.match(/^\/demo\/([\w-]+)$/);
const live = path.match(/^\/i\/([a-z0-9-]+)$/i);

interface PublicInvitation {
  id: string;
  slug: string;
  template_slug: string;
  config: unknown;
  status: string;
  guest: { name: string; seats: number } | null;
}

/** A soft, on-brand message when an invitation link isn't (or isn't yet) available. */
function showMissing(title: string, body: string) {
  root.innerHTML = `
    <main style="min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:24px;text-align:center;background:#f3ede2;color:#3a3d33">
      <p style="font-family:'Pinyon Script',cursive;font-size:44px;line-height:1;color:#414638;margin:0">${title}</p>
      <p style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:19px;max-width:320px;margin:0">${body}</p>
    </main>`;
}

/** A couple's invitation, loaded from the database by its link. */
async function startLive(slug: string) {
  const params = new URLSearchParams(window.location.search);
  const guestToken = params.get('g');
  const [{ rpc }, { bootInvitation }, { deepMerge }] = await Promise.all([
    import('./lib/rest'),
    import('./invitation/boot'), // downloads while the database answers
    import('./lib/merge'),
  ]);
  let inv: PublicInvitation | null = null;
  try {
    inv = await rpc<PublicInvitation | null>('get_invitation', {
      p_slug: slug,
      p_preview: params.get('preview'),
      p_guest_token: guestToken,
    });
  } catch (e) {
    console.error('[invitation]', e);
    return showMissing('Oh no…', 'We couldn’t open this invitation. Please check your connection and try again.');
  }
  const template = inv && findTemplate(inv.template_slug);
  if (!inv || !template) {
    return showMissing('Kumbida', 'This invitation isn’t available yet. Please check the link with the couple.');
  }
  const config = deepMerge(template.sample, inv.config);
  // drafts opened with a preview token stay in demo mode (replies aren't saved)
  const meta = inv.status === 'published' ? { id: inv.id, slug: inv.slug, guestToken, guest: inv.guest } : null;
  return bootInvitation(root, config, meta);
}

async function start() {
  if (live) return startLive(live[1].toLowerCase());
  // Phase 0: the home page still shows the sample invitation (the marketing site replaces it in Phase 2).
  if (path === '/' || demo) {
    const template = demo ? findTemplate(demo[1]) : DEFAULT_TEMPLATE;
    if (template) {
      const { bootInvitation } = await import('./invitation/boot');
      return bootInvitation(root, template.sample);
    }
  }
  const { default: PlatformApp } = await import('./app/PlatformApp');
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <PlatformApp />
    </React.StrictMode>,
  );
}

start();
