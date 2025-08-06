const CopyrightItem = () => {
  return (
    <ul role="list" className="mb-1.5 flex flex-1 flex-col justify-end gap-1">
      <li>
        <p className="text-center text-xs font-semibold">
          Copyright © {new Date().getFullYear()}
          <a
            href="https://www.unicis.tech/?mtm_campaign=platform&mtm_source=platform_beta"
            target="_blank"
            rel="noreferrer"
          >
            Unicis.Tech OÜ
          </a>
          . <br />
          Made with 💙 in 🇪🇺.
        </p>
      </li>
    </ul>
  );
};

export default CopyrightItem;
