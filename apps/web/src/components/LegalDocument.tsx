'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { LegalInline, LegalPage } from '../lib/legal';
import { legalPages } from '../lib/legal';

function InlineText({ parts }: { parts: LegalInline[] }) {
  return (
    <>
      {parts.map((part, index) =>
        typeof part === 'string' ? (
          <span key={index}>{part}</span>
        ) : (
          <Link key={index} href={part.href} className="legal-inline-link">
            {part.label}
          </Link>
        ),
      )}
    </>
  );
}

export function LegalDocument({ page }: { page: LegalPage }) {
  const [activeId, setActiveId] = useState(page.sections[0]?.id ?? '');

  useEffect(() => {
    const nodes = page.sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.15, 0.4, 0.75] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [page.sections]);

  function jumpTo(id: string) {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="legal-page">
      <header className="legal-hero">
        <p className="legal-kicker">{page.kicker}</p>
        <h1 className="legal-title">{page.title}</h1>
        <p className="legal-updated">Last updated {page.updated}</p>
      </header>

      <div className="legal-layout">
        <nav className="legal-toc" aria-label="On this page">
          <p className="legal-index-label">On this page</p>
          <ol className="legal-toc-list">
            {page.sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={`legal-toc-link${activeId === section.id ? ' is-active' : ''}`}
                  aria-current={activeId === section.id ? 'location' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    jumpTo(section.id);
                    history.replaceState(null, '', `#${section.id}`);
                  }}
                >
                  <span className="legal-toc-n" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="legal-article">
          {page.sections.map((section) => (
            <section key={section.id} id={section.id} className="legal-section">
              <h2>{section.title}</h2>
              {section.blocks.map((block, index) =>
                block.type === 'p' ? (
                  <p key={index}>
                    <InlineText parts={block.content} />
                  </p>
                ) : (
                  <ul key={index}>
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <InlineText parts={item} />
                      </li>
                    ))}
                  </ul>
                ),
              )}
            </section>
          ))}
        </article>

        <aside className="legal-rail" aria-label="Policies">
          <p className="legal-index-label">Policies</p>
          <ul className="legal-rail-list">
            {legalPages.map((item) => (
              <li key={item.slug}>
                <Link
                  href={item.path}
                  className={`legal-rail-link${item.slug === page.slug ? ' is-current' : ''}`}
                  aria-current={item.slug === page.slug ? 'page' : undefined}
                >
                  {item.navLabel}
                </Link>
              </li>
            ))}
          </ul>
          <p className="legal-rail-note">
            Fares on this site are indicative until a UK agent confirms them. We do not take payment
            on the website.
          </p>
        </aside>
      </div>
    </div>
  );
}
