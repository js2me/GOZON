import type { HeadApi } from '../api/types';

function escAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

/** Текст внутри `<title>` (без кавычек). */
export function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Фрагмент HTML с meta property / name для Open Graph и Twitter Card (только непустые поля). */
export function renderHeadMetaTags(head: HeadApi): string {
  const lines: string[] = [];

  const pushOg = (property: string, content: string | undefined) => {
    if (content) {
      lines.push(
        `    <meta property="${property}" content="${escAttr(content)}" />`,
      );
    }
  };

  const pushName = (name: string, content: string | undefined) => {
    if (content) {
      lines.push(`    <meta name="${name}" content="${escAttr(content)}" />`);
    }
  };

  pushOg('og:title', head.ogTitle);
  pushOg('og:description', head.ogDescription);
  pushOg('og:image', head.ogImage);
  pushOg('og:url', head.ogUrl);
  pushOg('og:type', head.ogType);
  pushOg('og:site_name', head.ogSiteName);
  pushOg('og:locale', head.ogLocale);

  const twitterTitle = head.twitterTitle ?? head.ogTitle;
  const twitterDescription = head.twitterDescription ?? head.ogDescription;
  const twitterImage = head.twitterImage ?? head.ogImage;

  const shouldEmitTwitter =
    head.twitterCard || twitterTitle || twitterDescription || twitterImage;

  if (shouldEmitTwitter) {
    const twitterCard = head.twitterCard ?? 'summary_large_image';
    pushName('twitter:card', twitterCard);
    pushName('twitter:title', twitterTitle);
    pushName('twitter:description', twitterDescription);
    pushName('twitter:image', twitterImage);
  }

  return lines.join('\n');
}
