import React from 'react';
import { Text } from '@mantine/core';
import { BaseModal } from './BaseModal';  // Assuming BaseModal is available in the same directory

interface FileInfoModalProps {
  openModal: boolean;
  fileData: {
    id: string;
    name: string;
    // Add other file properties as needed
  } | null;
}

export const FileInfoModal: React.FC<FileInfoModalProps> = ({ openModal, fileData }) => {
  return (
    <BaseModal
      title={
        <Text size="lg" className="font-medium font-heading">
          File Information
        </Text>
      }
      openModal={openModal}
      centered={true}
      size="60%"
    >
      <div className="border-y border-y-base-darker py-4 space-y-4 font-content">
        {fileData ? (
          <>
            <Text>ID: {fileData.id}</Text>
            <Text>Name: {fileData.name}</Text>
            {/* Add more file details here */}
          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </div>
    </BaseModal>
  );
};

