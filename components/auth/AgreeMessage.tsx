import { useTranslation } from "next-i18next";
import Link from "next/link";

const AgreeMessage = ({ text }) => {
  const { t } = useTranslation("common");

  return (
    <p className="text-sm text-center">
      {t('agree-message-part', { button: t(text) })}
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={"https://www.unicis.tech/terms"}
        className="hover:text-primary-focus font-medium text-primary"
      >
        {t("terms")}
      </Link>
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={"https://www.unicis.tech/privacy"}
        className="hover:text-primary-focus font-medium text-primary"
      >
        {t('privacy')}
      </Link>
      {t('and')}
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={"https://www.unicis.tech/security"}
        className="hover:text-primary-focus font-medium text-primary"
      >
        {t("security")}
      </Link>
    </p>
  );
};

export default AgreeMessage;
