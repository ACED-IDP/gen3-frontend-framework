import React from 'react';
import { useCoreSelector, selectCurrentMessage, useGetRawDataAndTotalCountsQuery } from '@gen3/core';
import { Text } from '@mantine/core';
import { BaseModal } from './BaseModal';  // Assuming BaseModal is available in the same directory

interface PatientInfoModalProps {
  openModal: boolean;
  patientData: {
    id: string;
    name: string;
    // Add other patient properties as needed
  } | null;
}

export const PatientInfoModal: React.FC<PatientInfoModalProps> = ({ openModal, patientData }) => {
  return (
    <BaseModal
      title={
        <Text size="lg" className="font-medium font-heading">
          Patient Information: {message}
        </Text>
      }
      openModal={openModal}
      centered={true}
      size="60%"
    >
      <div className="border-y border-y-base-darker py-4 space-y-4 font-content">
        {patientData ? (
          <>
            <Text>ID: {patientData.id}</Text>
            <Text>Name: {patientData.name}</Text>
            {/* Add more patient details here */}
          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </div>
    </BaseModal>
  );
};

