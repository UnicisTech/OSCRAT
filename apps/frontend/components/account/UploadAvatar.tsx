import { useTranslation } from 'next-i18next';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowUpCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { User } from '@oscrat/model';

import Button from '@/components/button';
import { Card } from '@/components/shared';
import { useAccount } from '@/hooks/useAccount';
import { extractErrorMessage } from '@/lib/utils';

const UploadAvatar = ({ user }: { user: Partial<User> }) => {
  const { t } = useTranslation('common');
  const {
    updateAvatar,
    deleteAvatar,
    isUpdateAvatarLoading,
    isDeleteAvatarLoading,
  } = useAccount();
  const [dragActive, setDragActive] = useState(false);
  const [image, setImage] = useState<string | null>();

  const defaultImage = useMemo(
    () => `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
    [user.name]
  );

  useEffect(() => {
    setImage(user.image || defaultImage);
  }, [user.image, defaultImage]);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files && e.dataTransfer.files[0];

    if (file) {
      onAvatarUpload(file);
    }
  };

  const onChangePicture = useCallback(
    (e) => {
      const file = e.target.files[0];

      if (file) {
        onAvatarUpload(file);
      }
    },
    [setImage]
  );

  const onAvatarUpload = (file: File) => {
    if (file.size / 1024 / 1024 > 2) {
      toast.error('File size too big (max 2MB)');
      return;
    }

    if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
      toast.error('File type not supported (.png or .jpg only)');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!image) return;

    const result = await updateAvatar(image);

    if (result.success) {
      toast.success(t('successfully-updated'));
    } else {
      const errorMessage = extractErrorMessage(
        result.error,
        t('error.avatar-update-failed')
      );

      if (
        errorMessage.includes('413') ||
        errorMessage.toLowerCase().includes('body exceeded')
      ) {
        toast.error('File size too big. Maximum file size is 2MB.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDelete = async () => {
    const result = await deleteAvatar();

    if (result.success) {
      setImage(defaultImage);
      toast.success(t('successfully-updated'));
    } else {
      toast.error(
        extractErrorMessage(result.error, t('error.avatar-delete-failed'))
      );
    }
  };

  // Show delete button if there's a custom avatar (either saved or locally uploaded)
  const hasCustomAvatar = (image && image !== defaultImage) || user.image;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('avatar')}</Card.Title>
            <Card.Description>
              {t('custom-avatar')} <br />
              {t('avatar-type')}
            </Card.Description>
          </Card.Header>
          <div>
            <label
              htmlFor="image"
              className="border-line bg-surface hover:bg-surface-muted group relative mt-1 flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-full border transition-all"
            >
              <div
                className="absolute z-[5] h-full w-full rounded-full"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(false);
                }}
                onDrop={onDrop}
              />
              <div
                className={`${
                  dragActive
                    ? 'bg-surface-muted border-content cursor-copy border-2 opacity-100'
                    : ''
                } bg-surface absolute z-[3] flex h-full w-full flex-col items-center justify-center rounded-full transition-all ${
                  image
                    ? 'opacity-0 group-hover:opacity-100'
                    : 'group-hover:bg-surface-muted'
                }`}
              >
                <ArrowUpCircleIcon
                  className={`${
                    dragActive ? 'scale-110' : 'scale-100'
                  } h-50 w-50 text-content-muted transition-all duration-75 group-hover:scale-110 group-active:scale-95`}
                />
              </div>
              {image && (
                <img
                  src={image}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              )}
            </label>
            <div className="shadow-2 mt-1 flex rounded-full">
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onChangePicture}
              />
            </div>
          </div>
        </Card.Body>
        <Card.Footer>
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={!image || image === user.image}
              loading={isUpdateAvatarLoading}
            >
              {t('save-changes')}
            </Button>
            {hasCustomAvatar && (
              <Button
                type="button"
                tone="danger"
                variant="secondary"
                onClick={handleDelete}
                loading={isDeleteAvatarLoading}
                disabled={isUpdateAvatarLoading}
                startIcon={<TrashIcon className="h-5 w-5" />}
              >
                {t('delete')}
              </Button>
            )}
          </div>
        </Card.Footer>
      </Card>
    </form>
  );
};

export default UploadAvatar;
