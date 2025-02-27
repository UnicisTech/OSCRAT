const dateOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
};

export const taskNavigations = (activeTab: string) => {
  return [
    {
      name: 'Overview',
      active: activeTab === 'Overview',
    },
    {
      name: 'Cybersecurity Controls',
      active: activeTab === 'Cybersecurity Controls',
    },
  ];
};

export const taskCommentsNavigations = (activeTab: string) => {
  return [
    {
      name: 'Comments',
      active: activeTab === 'Comments',
    },
    {
      name: 'Audit logs',
      active: activeTab === 'Audit logs',
    },
  ];
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('en-US', dateOptions as any);
  const formattedDate = formatter.format(date);
  return formattedDate;
};
