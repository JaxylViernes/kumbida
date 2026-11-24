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

async function start() {
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
