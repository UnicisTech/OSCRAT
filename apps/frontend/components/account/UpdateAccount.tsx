import type { User } from '@oscrat/model';
import UploadAvatar from './UploadAvatar';
import UpdateName from './UpdateName';
import UpdateEmail from './UpdateEmail';
import SignOut from './SignOut';

interface UpdateAccountProps {
  user: Partial<User>;
}

const UpdateAccount = ({ user }: UpdateAccountProps) => {
  return (
    <div className="flex flex-col gap-6">
      <UpdateName user={user} />
      <UpdateEmail user={user} />
      <UploadAvatar user={user} />
      <SignOut />
    </div>
  );
};

export default UpdateAccount;
