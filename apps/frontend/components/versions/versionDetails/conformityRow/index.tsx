import Tab from './tab';
import ViewModal from '@/components/versions/versionDetails/conformityRow/tab/modal';
import { useState } from 'react';

export default function ConformityRow({}) {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);

  // Mock data for the modal content.
  const conformityAssessmentContent = [
    { question: 'Is the product commercially supplied?', answer: 'No' },
    {
      question:
        'Is the product made available only for a limited period required for testing purposes?',
      answer: 'No',
    },
    {
      question:
        'Does the product with digital elements was developed as a spare part to replace identical components on the market?',
      answer: 'No',
    },
    {
      question:
        'Is this a new solution or a modification of an existing product?',
      answer: 'Modification of an existing product',
    },
    { question: 'Is this a substantial modification?', answer: 'Yes' },
    {
      question: 'Does the product contain digital elements?',
      answer:
        'The product is a hardware solution in form of physical electronic information system, capable of processing, storing or transmitting digital data',
    },
    { question: 'Is the product commercially supplied?', answer: 'No' },
    {
      question:
        'Is the product made available only for a limited period required for testing purposes?',
      answer: 'No',
    },
    {
      question:
        'Does the product with digital elements was developed as a spare part to replace identical components on the market?',
      answer: 'No',
    },
    {
      question:
        'Is this a new solution or a modification of an existing product?',
      answer: 'Modification of an existing product',
    },
    { question: 'Is this a substantial modification?', answer: 'Yes' },
    {
      question: 'Does the product contain digital elements?',
      answer:
        'The product is a hardware solution in form of physical electronic information system, capable of processing, storing or transmitting digital data',
    },
  ];

  const declarationContent = [
    {
      question: 'Has the product been tested against EN 62368-1:2020?',
      answer: 'Yes, passed all tests.',
    },
    {
      question: 'Does the product comply with RoHS directive 2011/65/EU?',
      answer: 'Yes, all components are compliant.',
    },
    {
      question: 'Is the CE marking affixed to the product?',
      answer: 'Yes, the CE mark is present on the product label.',
    },
  ];

  const handleDirectEdit = () => {
    // Will be used to send to CRA Form to edit the conformity assessment, answers will be pre-filled with actual data.
  };
  const handleDirectDownload = () => {
    // Will be used to download the declaration of conformity, answers will be pre-filled with actual data.
  };

  return (
    <div className="mt-4 flex w-full items-center justify-center space-x-4">
      <Tab
        title="Conformity Assessment"
        onViewClick={() => setEditModalOpen(true)}
        actionType="edit"
        onActionClick={handleDirectEdit}
      />

      <Tab
        title="Declaration of Conformity"
        onViewClick={() => setDownloadModalOpen(true)}
        actionType="download"
        onActionClick={handleDirectDownload}
      />

      <ViewModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Conformity Assessment"
        content={conformityAssessmentContent}
        variant="edit"
        onEdit={undefined}
      />

      <ViewModal
        isOpen={isDownloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        title="Declaration of Conformity"
        content={declarationContent}
        variant="download"
        onDownload={undefined}
      />
    </div>
  );
}
