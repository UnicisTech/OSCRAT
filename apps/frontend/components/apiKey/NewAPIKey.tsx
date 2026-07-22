import { InputWithCopyButton, InputWithLabel } from '@/components/shared';
import { useApiKeys } from '@/hooks/useApiKeys';
import { extractErrorMessage } from '@/lib/utils';
import type { Team } from '@oscrat/model';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '@/components/button';
import Modal from '../shared/Modal';

const NewAPIKey = ({
  team,
  createModalVisible,
  setCreateModalVisible,
}: NewAPIKeyProps) => {
  const [apiKey, setApiKey] = useState('');

  const onNewAPIKey = (apiKey: string) => {
    setApiKey(apiKey);
  };

  const toggleVisible = () => {
    setCreateModalVisible(!createModalVisible);
    setApiKey('');
  };

  return (
    <Modal open={createModalVisible} close={toggleVisible}>
      {apiKey === '' ? (
        <CreateAPIKeyForm
          team={team}
          onNewAPIKey={onNewAPIKey}
          closeModal={toggleVisible}
        />
      ) : (
        <DisplayAPIKey apiKey={apiKey} closeModal={toggleVisible} />
      )}
    </Modal>
  );
};

const CreateAPIKeyForm = ({
  team,
  onNewAPIKey,
  closeModal,
}: CreateAPIKeyFormProps) => {
  const [name, setName] = useState('');
  const { t } = useTranslation('common');
  const [submitting, setSubmitting] = useState(false);
  const { createApiKey } = useApiKeys(team.slug);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      const response = await createApiKey(name);
      setSubmitting(false);

      if (response.apiKey) {
        onNewAPIKey(response.apiKey);
        toast.success(t('api-key-created'));
      }
    } catch (error: unknown) {
      setSubmitting(false);
      toast.error(extractErrorMessage(error, t('error-creating-api-key'), t));
    }
  };

  return (
    <form onSubmit={handleSubmit} method="POST" className="contents">
      <Modal.Header>{t('new-api-key')}</Modal.Header>
      <Modal.Description>{t('new-api-key-description')}</Modal.Description>
      <Modal.Body>
        <InputWithLabel
          label={t('name')}
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My API Key"
          className="text-sm"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="secondary" onClick={closeModal}>
          {t('close')}
        </Button>
        <Button
          variant="primary"
          type="submit"
          loading={submitting}
          disabled={!name}
        >
          {t('create-api-key')}
        </Button>
      </Modal.Footer>
    </form>
  );
};

const DisplayAPIKey = ({ apiKey, closeModal }: DisplayAPIKeyProps) => {
  const { t } = useTranslation('common');

  return (
    <>
      <Modal.Header>{t('new-api-key')}</Modal.Header>
      <Modal.Description>{t('new-api-warning')}</Modal.Description>
      <Modal.Body>
        <InputWithCopyButton
          label={t('api-key')}
          value={apiKey}
          className="text-sm"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="secondary" onClick={closeModal}>
          {t('close')}
        </Button>
      </Modal.Footer>
    </>
  );
};

interface NewAPIKeyProps {
  team: Team;
  createModalVisible: boolean;
  setCreateModalVisible: (visible: boolean) => void;
}

interface CreateAPIKeyFormProps {
  team: Team;
  onNewAPIKey: (apiKey: string) => void;
  closeModal: () => void;
}

interface DisplayAPIKeyProps {
  apiKey: string;
  closeModal: () => void;
}

export default NewAPIKey;
