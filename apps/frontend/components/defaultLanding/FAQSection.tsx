import { useTranslation } from 'next-i18next';

import faqs from './data/faq.json';

const FAQSection = () => {
  const { t } = useTranslation('common');
  return (
    <section className="py-6">
      <div className="flex flex-col justify-center space-y-6">
        <h2 className="text-center text-4xl font-bold normal-case">
          {t('frequently-asked')}
        </h2>
        <p className="text-center text-xl">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry.
        </p>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-1 gap-2">
            {faqs.map((faq, index) => {
              return (
                <div
                  key={index}
                  className="border-line rounded-card flex flex-col gap-2 border p-6"
                >
                  <h2 className="text-xl font-medium leading-none tracking-tight">
                    Q. {faq.question}
                  </h2>
                  <p>A. {faq.answer}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
