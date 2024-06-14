import React from 'react';
import { Text } from '@mantine/core';
import { BaseModal } from './BaseModal';  // Assuming BaseModal is available in the same directory
import { selectCurrentMessage, useCoreSelector } from '@gen3/core';

interface FileInfoModalProps {
  openModal: boolean;
  fileData: {
    id: string;
    name: string;
    // Add other file properties as needed
  } | null;
}

export const FileInfoModal: React.FC<FileInfoModalProps> = ({ openModal }) => {
  const rowData = useCoreSelector((state) => selectCurrentMessage(state));
  let row;
  if (rowData) {
    row = JSON.parse(rowData);
  }

  return (
    <BaseModal
      title={
        <Text size="lg" className="font-medium font-heading">
          File Information:
        </Text>
      }
      openModal={openModal}
      size="60%"
      withCloseButton={true}
      closeOnClickOutside={true}
      closeOnEscape={true}
    >
      <div className="border-y border-y-base-darker py-4 space-y-4 font-content">
        {rowData ? (
          Object.entries(row).map(([key, value]) => (
            <Text key={key}>{`${key}: ${value}`}</Text>
          ))
        ) : (
          <Text>Loading...</Text>
        )}
      <p>Guppy Query/Results...</p>
      </div>
    </BaseModal>
  );
};
