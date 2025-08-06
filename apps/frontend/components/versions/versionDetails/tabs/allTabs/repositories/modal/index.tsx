import React, { useState, useRef, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import Divider from '@/components/shared/Divider';
import { useTranslation } from 'next-i18next';

// --- TYPE DEFINITIONS ---
interface RepositoryData {
  id: string;
  name: string;
  provider: string;
  link: string;
}

type CredentialType = 'account' | 'token';

// --- FILE: AddRepositoryModal.tsx ---
// A modal for adding a new repository.

interface AddRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newRepo: Omit<RepositoryData, 'id'>) => void;
}

const Modal: React.FC<AddRepositoryModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { t, ready } = useTranslation('common');

  if (!ready) {
    return null;
  }

  // Form state
  const [name, setName] = useState('v2.3');
  const [provider, setProvider] = useState('GitHub');
  const [credentialType, setCredentialType] = useState<CredentialType>('token');
  const [userName, setUserName] = useState('234567345');
  const [token, setToken] = useState('234567345');
  const [url, setUrl] = useState('https://github.com/username/repository-name');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, provider, link: url });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div
        ref={modalRef}
        className="animate-fade-in-up flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between p-4">
          <h2 className="text-[14px] font-bold text-gray-900">
            {t('oscrat.ui.add-new-repo')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <IoClose size={24} />
          </button>
        </header>

        <Divider className="my-2" />

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <main className="space-y-4 overflow-y-auto p-6">
            <div className="flex justify-between text-sm">
              <div>
                <span className="font-semibold text-gray-500">
                  {t('version')}
                </span>
                <span className="text-gray-800">{name}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500">
                  {t('product')}
                </span>
                <span className="text-gray-800">N5 5nm - 9 7950x</span>
              </div>
            </div>

            <Divider className="my-2" />

            <div>
              <label
                htmlFor="repoName"
                className="mb-1 block text-sm font-medium text-gray-900"
                style={{ fontSize: '14px' }}
              >
                {t('name')}
              </label>
              <input
                type="text"
                id="repoName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="repoProvider"
                className="mb-1 block text-sm font-medium text-gray-900"
                style={{ fontSize: '14px' }}
              >
                {t('provider')}
              </label>
              <select
                id="repoProvider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option>GitHub</option>
                <option>GitLab</option>
                <option>Bitbucket</option>
              </select>
            </div>

            <Divider className="my-2" />

            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-900"
                style={{ fontSize: '14px' }}
              >
                {t('credential')}:
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    name="credential"
                    value="account"
                    checked={credentialType === 'account'}
                    onChange={() => setCredentialType('account')}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{t('account')}</span>
                </label>
                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    name="credential"
                    value="token"
                    checked={credentialType === 'token'}
                    onChange={() => setCredentialType('token')}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    {t('access-token')}
                  </span>
                </label>
              </div>
            </div>
            {credentialType === 'account' && (
              <>
                <div>
                  <label
                    htmlFor="userName"
                    className="mb-1 block text-sm font-medium text-gray-900"
                    style={{ fontSize: '14px' }}
                  >
                    {t('user-name')}
                  </label>
                  <input
                    type="text"
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium text-gray-900"
                    style={{ fontSize: '14px' }}
                  >
                    {t('password')}
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                  />
                </div>
              </>
            )}
            {credentialType === 'token' && (
              <>
                <div>
                  <label
                    htmlFor="userName"
                    className="mb-1 block text-sm font-medium text-gray-900"
                    style={{ fontSize: '14px' }}
                  >
                    {t('user-name')}
                  </label>
                  <input
                    type="text"
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="token"
                    className="mb-1 block text-sm font-medium text-gray-900"
                    style={{ fontSize: '14px' }}
                  >
                    {t('token')}
                  </label>
                  <input
                    type="password"
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
                  />
                </div>
              </>
            )}

            <Divider className="my-4" />

            <div>
              <label
                htmlFor="repoURL"
                className="mb-1 block text-sm font-medium text-gray-900"
                style={{ fontSize: '14px' }}
              >
                {t('url')}
              </label>
              <input
                type="url"
                id="repoURL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm"
              />
            </div>
          </main>

          <Divider className="my-2" />

          <footer className="flex items-center justify-end space-x-3 rounded-b-lg bg-gray-50 p-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('cencel')}
            </button>
            <button
              type="submit"
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t('add')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default Modal;
