import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loading } from '@/components/shared';
import app from '@/lib/app';
import { formatDateShort } from '@/utils/dateFormat';

export interface PublicDocumentationData {
  id: string;
  slug: string;
  title: string;
  content: string;
  version: number;
  productName?: string;
  versionName?: string;
  updatedAt: Date;
}

interface PublicDocumentationLayoutProps {
  doc: PublicDocumentationData | undefined;
  isLoading: boolean;
  isError: boolean;
  metaTitle: string;
  metaDescription: string;
  productBadge?: string;
}

const PublicDocumentationLayout: React.FC<PublicDocumentationLayoutProps> = ({
  doc,
  isLoading,
  isError,
  metaTitle,
  metaDescription,
  productBadge,
}) => {
  const { t } = useTranslation('common');

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError || !doc) {
    return (
      <div className="bg-surface-muted flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-content text-4xl font-bold">404</h1>
          <p className="text-content-secondary mt-2 text-lg">
            {t('oscrat.ui.documentation.public.not-found')}
          </p>
          <Link
            href="/"
            className="text-primary mt-4 inline-block hover:underline"
          >
            {t('oscrat.ui.go-home')}
          </Link>
        </div>
      </div>
    );
  }

  // Compute default product badge if not provided
  const displayBadge =
    productBadge ??
    (doc.productName
      ? `${doc.productName}${doc.versionName ? ` ${doc.versionName}` : ''}`
      : undefined);

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
      </Head>

      <div className="bg-surface-muted min-h-screen">
        {/* Header */}
        <header className="bg-surface shadow-2 border-b">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <img src={app.logoUrl} alt={app.name} className="h-10" />
              <span className="text-content-secondary text-lg font-medium">
                {t('oscrat.ui.documentation.public.header')}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <article className="bg-surface rounded-card border-line border p-8">
            {/* Document Header */}
            <header className="mb-8 border-b pb-6">
              <h1 className="text-content text-3xl font-bold">{doc.title}</h1>
              <div className="text-content-muted mt-3 flex flex-wrap items-center gap-4 text-sm">
                {displayBadge && (
                  <span className="bg-info-subtle text-info-emphasis rounded-full px-3 py-1">
                    {displayBadge}
                  </span>
                )}
                <span>
                  {t('oscrat.ui.documentation.public.version', {
                    version: doc.version,
                  })}
                </span>
                <span>
                  {t('oscrat.ui.documentation.public.updated', {
                    date: formatDateShort(doc.updatedAt),
                  })}
                </span>
              </div>
            </header>

            {/* Document Content */}
            <div className="prose prose-gray prose-headings:text-content prose-p:text-content-secondary prose-li:text-content-secondary prose-strong:text-content max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {doc.content}
              </ReactMarkdown>
            </div>
          </article>

          {/* Footer */}
          <footer className="text-content-muted mt-8 text-center text-sm">
            <p>
              {t('oscrat.ui.documentation.public.footer', {
                appName: app.name,
              })}
            </p>
          </footer>
        </main>
      </div>
    </>
  );
};

export default PublicDocumentationLayout;
