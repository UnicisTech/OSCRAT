import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loading } from '@/components/shared';
import app from '@/lib/app';

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">404</h1>
          <p className="mt-2 text-lg text-gray-600">
            {t('oscrat.ui.documentation.public.not-found')}
          </p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
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
      ? `${doc.productName}${doc.versionName ? ` v${doc.versionName}` : ''}`
      : undefined);

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white shadow-sm">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <img src={app.logoUrl} alt={app.name} className="h-10" />
              <span className="text-lg font-medium text-gray-700">
                {t('oscrat.ui.documentation.public.header')}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <article className="rounded-lg border bg-white p-8 shadow-sm">
            {/* Document Header */}
            <header className="mb-8 border-b pb-6">
              <h1 className="text-3xl font-bold text-gray-900">{doc.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {displayBadge && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                    {displayBadge}
                  </span>
                )}
                <span>
                  {t('oscrat.ui.documentation.public.version', { version: doc.version })}
                </span>
                <span>
                  {t('oscrat.ui.documentation.public.updated', {
                    date: new Date(doc.updatedAt).toLocaleDateString(),
                  })}
                </span>
              </div>
            </header>

            {/* Document Content */}
            <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
            </div>
          </article>

          {/* Footer */}
          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>{t('oscrat.ui.documentation.public.footer', { appName: app.name })}</p>
          </footer>
        </main>
      </div>
    </>
  );
};

export default PublicDocumentationLayout;
