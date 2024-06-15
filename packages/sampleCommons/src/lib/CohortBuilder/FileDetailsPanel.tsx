import {
  Anchor,
  Group,
  LoadingOverlay,
  Stack,
  Table,
  Text,
  CopyButton,
  ActionIcon,
  Tooltip,
  Button,
} from '@mantine/core';
import { useGeneralGQLQuery, GEN3_FENCE_API } from '@gen3/core';
import {
  ErrorCard,
  type TableDetailsPanelProps,
  ExplorerTableDetailsPanelFactory,
} from '@gen3/frontend';
import {
  MdContentCopy as IconCopy,
  MdCheck as IconCheck,
} from 'react-icons/md';

// a definition of the query response
interface QueryResponse {
  data?: Record<string, Array<any>>;
}

/**
 * Checks if the given object is a QueryResponse.
 *
 * @param {any} obj - The object to be checked.
 * @returns {boolean} Returns true if the object is a QueryResponse, false otherwise.
 */
const isQueryResponse = (obj: any): obj is QueryResponse => {
  // Considering that the data property can be optional
  return (
    typeof obj === 'object' &&
    (obj.data === undefined || typeof obj.data === 'object')
  );
};

const extractData = (
  data: QueryResponse,
  index: string,
): Record<string, any> => {
  if (data === undefined || data === null) return {};
  if (data.data === undefined || data.data === null) return {};

  return Array.isArray(data.data[index]) && data.data[index].length > 0
    ? data.data[index][0]
    : {};
};

export const FileDetailsPanel = ({
  id,
  index,
  tableConfig,
  onClose,
}: TableDetailsPanelProps) => {
  //const [queryGuppy, { data, isLoading, isError }] = useLazyGeneralGQLQuery();
  const idField = tableConfig.detailsConfig?.idField;
  const { data, isLoading, isError } = useGeneralGQLQuery({
    query: `query ($filter: JSON) {
        ${index} (filter: $filter,  accessibility: all) {
        ${tableConfig.fields}
        }
      }`,
    variables: {
      filter: {
        AND: [
          {
            IN: {
              [idField ?? 0]: [id],
            },
          },
        ],
      },
    },
  });

  if (!idField || idField === null) {
    return (
      <ErrorCard message={'idField not configure in Tables Details Config'} />
    );
  }

  if (isError) {
    return <ErrorCard message={'Error occurred while fetching data'} />;
  }

  const queryData = isQueryResponse(data) ? extractData(data, index) : {};

  const rows = Object.entries(queryData).map(([field, value]) => (
    <tr key={field}>
      <td>
        <Text weight="bold">{field}</Text>
      </td>
      <td>
        {field === 'id' ? (
          <Anchor
            href={`${GEN3_FENCE_API}/user/data/download/${
              value ? (value as string) : ''
            }?redirect=true`}
            target="_blank"
          >
            {value ? (value as string) : ''}
          </Anchor>
        ) : (
          <Text>{value ? (value as string) : ''}</Text>
        )}
      </td>
    </tr>
  ));
  return (
    <Stack>
      <LoadingOverlay visible={isLoading} />
      <Text color="primary.4">Results for {id}</Text>
      <Table withBorder withColumnBorders>
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
      <Group position="right">
        <CopyButton value={JSON.stringify(queryData)} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip
              label={copied ? 'Copied' : 'Copy'}
              withArrow
              position="right"
            >
              <ActionIcon color={copied ? 'accent.4' : 'gray'} onClick={copy}>
                {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
        <Button onClick={() => onClose && onClose(id)}>Close</Button>
      </Group>
    </Stack>
  );
};

export const registerCustomExplorerDetailsPanels = () => {
  ExplorerTableDetailsPanelFactory().registerRendererCatalog({
    // NOTE: The catalog name must be tableDetails
    tableDetails: { fileDetails: FileDetailsPanel }, // TODO: add simpler registration function that ensures the catalog name is tableDetails
  });
};
