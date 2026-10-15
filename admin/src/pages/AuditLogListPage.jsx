import * as React from 'react';
import {
  Box,
  Flex,
  Typography,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  EmptyStateLayout,
  SingleSelect,
  SingleSelectOption,
  TextInput,
} from '@strapi/design-system';
import { Page, Layouts, useFetchClient, useNotification } from '@strapi/strapi/admin';
import ClockIcon from '../components/ClockIcon';
import AuditLogDetailsModal from '../components/AuditLogDetailsModal';
import { ACTION_LABELS, AUTH_ACTIONS } from '../constants';
import { PLUGIN_ID } from '../pluginId';

const PERMISSIONS = [{ action: `plugin::${PLUGIN_ID}.read`, subject: null }];

const useDebouncedValue = (value, delay) => {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const AuditLogList = () => {
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [page, setPage] = React.useState(1);
  const [action, setAction] = React.useState('');
  const [userSearch, setUserSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState(null);
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const user = useDebouncedValue(userSearch.trim(), 300);

  React.useEffect(() => {
    setPage(1);
  }, [action, user]);

  React.useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const params = { page, pageSize: 20 };
    if (action) params.action = action;
    if (user) params.user = user;

    get(`/${PLUGIN_ID}/logs`, { params })
      .then(({ data: body }) => {
        if (!cancelled) setData(body);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        toggleNotification({ type: 'danger', message: 'Failed to load audit logs' });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, action, user, get, toggleNotification]);

  if (isLoading && !data) {
    return <Page.Loading />;
  }

  if (error) {
    return <Page.Error />;
  }

  const { results = [], pagination } = data || {};
  const hasFilters = Boolean(action || user);

  return (
    <Page.Main>
      <Page.Title>Audit Logs</Page.Title>
      <Layouts.Header title="Audit Logs" subtitle="Content changes and admin authentication events" />
      <Layouts.Content>
        <Flex gap={4} paddingBottom={4} wrap="wrap">
          <Box minWidth="24rem">
            <SingleSelect
              aria-label="Filter by action"
              placeholder="All actions"
              value={action}
              onChange={(value) => setAction(value)}
              onClear={() => setAction('')}
              clearLabel="Clear action filter"
            >
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <SingleSelectOption key={value} value={value}>
                  {label}
                </SingleSelectOption>
              ))}
            </SingleSelect>
          </Box>
          <Box minWidth="24rem">
            <TextInput
              aria-label="Filter by user"
              placeholder="Search user name or email"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
            />
          </Box>
        </Flex>
        {results.length === 0 ? (
          <EmptyStateLayout
            icon={<ClockIcon width="10rem" height="10rem" />}
            content={hasFilters ? 'No audit log entries match these filters' : 'No audit log entries yet'}
          />
        ) : (
          <>
            <Table colCount={6} rowCount={results.length + 1}>
              <Thead>
                <Tr>
                  <Th>
                    <Typography variant="sigma">Date</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">Action</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">User</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">Content type</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">Entry</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">Details</Typography>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {results.map((entry) => (
                  <Tr key={entry.id}>
                    <Td>
                      <Typography>{new Date(entry.date).toLocaleString()}</Typography>
                    </Td>
                    <Td>
                      <Badge variant={AUTH_ACTIONS.has(entry.action) ? 'secondary' : 'primary'}>
                        {ACTION_LABELS[entry.action] || entry.action}
                      </Badge>
                    </Td>
                    <Td>
                      <Typography>{entry.userDisplayName || entry.userEmail || '—'}</Typography>
                    </Td>
                    <Td>
                      <Typography>{entry.contentType || '—'}</Typography>
                    </Td>
                    <Td>
                      <Typography>{entry.entryId || '—'}</Typography>
                    </Td>
                    <Td>
                      <Button variant="tertiary" size="S" onClick={() => setSelectedId(entry.id)}>
                        View
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Box padding={4}>
              <Flex justifyContent="space-between">
                <Button variant="tertiary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Typography textColor="neutral600">
                  Page {pagination?.page || 1} of {pagination?.pageCount || 1}
                </Typography>
                <Button
                  variant="tertiary"
                  disabled={pagination ? page >= pagination.pageCount : true}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </Flex>
            </Box>
          </>
        )}
        {selectedId != null && (
          <AuditLogDetailsModal entryId={selectedId} onClose={() => setSelectedId(null)} />
        )}
      </Layouts.Content>
    </Page.Main>
  );
};

const AuditLogListPage = () => (
  <Page.Protect permissions={PERMISSIONS}>
    <AuditLogList />
  </Page.Protect>
);

export default AuditLogListPage;
