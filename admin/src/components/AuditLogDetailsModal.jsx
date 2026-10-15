import * as React from 'react';
import { Box, Button, Flex, Grid, Loader, Modal, Typography } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';
import { ACTION_LABELS } from '../constants';

const Field = ({ label, children }) => (
  <Flex direction="column" alignItems="stretch" gap={1}>
    <Typography variant="sigma" textColor="neutral600">
      {label}
    </Typography>
    <Typography>{children || '—'}</Typography>
  </Flex>
);

const AuditLogDetailsModal = ({ entryId, onClose }) => {
  const { get } = useFetchClient();
  const [entry, setEntry] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    setEntry(null);
    setError(null);

    get(`/${PLUGIN_ID}/logs/${entryId}`)
      .then(({ data: body }) => {
        if (!cancelled) setEntry(body.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });

    return () => {
      cancelled = true;
    };
  }, [entryId, get]);

  return (
    <Modal.Root open onOpenChange={(open) => !open && onClose()}>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Audit log entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Typography textColor="danger600">Failed to load this entry.</Typography>}
          {!error && !entry && (
            <Flex justifyContent="center" padding={6}>
              <Loader small>Loading</Loader>
            </Flex>
          )}
          {entry && (
            <Flex direction="column" alignItems="stretch" gap={6}>
              <Grid.Root gap={4}>
                <Grid.Item col={6} s={12}>
                  <Field label="Date">{new Date(entry.date).toLocaleString()}</Field>
                </Grid.Item>
                <Grid.Item col={6} s={12}>
                  <Field label="Action">{ACTION_LABELS[entry.action] || entry.action}</Field>
                </Grid.Item>
                <Grid.Item col={6} s={12}>
                  <Field label="User">
                    {[entry.userDisplayName, entry.userEmail && `<${entry.userEmail}>`].filter(Boolean).join(' ')}
                  </Field>
                </Grid.Item>
                <Grid.Item col={6} s={12}>
                  <Field label="Content type">{entry.contentType}</Field>
                </Grid.Item>
                <Grid.Item col={6} s={12}>
                  <Field label="Entry">{entry.entryId}</Field>
                </Grid.Item>
              </Grid.Root>
              <Flex direction="column" alignItems="stretch" gap={1}>
                <Typography variant="sigma" textColor="neutral600">
                  Payload
                </Typography>
                <Box
                  background="neutral100"
                  borderColor="neutral200"
                  hasRadius
                  padding={4}
                  style={{ maxHeight: '40vh', overflow: 'auto' }}
                >
                  <Typography tag="pre" variant="pi" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {entry.payload ? JSON.stringify(entry.payload, null, 2) : 'No payload stored'}
                  </Typography>
                </Box>
              </Flex>
            </Flex>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close>
            <Button variant="tertiary">Close</Button>
          </Modal.Close>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};

export default AuditLogDetailsModal;
