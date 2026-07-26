'use client';

import dynamic from 'next/dynamic';

/** WhatsApp FAB — hydrated after first paint so it stays off the critical path. */
const WhatsAppChatButton = dynamic(
  () => import('./WhatsAppChatButton').then((mod) => mod.WhatsAppChatButton),
  { ssr: false },
);

export function DeferredWhatsAppChatButton() {
  return <WhatsAppChatButton />;
}
