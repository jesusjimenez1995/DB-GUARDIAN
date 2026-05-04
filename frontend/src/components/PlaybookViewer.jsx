import { Card, CardContent, Divider, Link, Stack, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

function PlaybookViewer({ playbook }) {
  if (!playbook) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Playbook Viewer</Typography>
          <Typography sx={{ mt: 1 }} color="text.secondary" variant="body2">
          Selecciona una sugerencia para visualizar el procedimiento historico.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="overline" color="primary.main">
            Playbook Asociado
          </Typography>
          <Typography variant="h6">{playbook.ERROR_MATCH}</Typography>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography component="div" variant="body2" sx={{ '& ul, & ol': { pl: 2.5 } }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
            {playbook.PROCEDIMIENTO_CLOB || ''}
          </ReactMarkdown>
        </Typography>

        {playbook.LINKS_INTERNOS ? (
          <>
            <Divider sx={{ mt: 2, mb: 1.5 }} />
            <Link
            href={playbook.LINKS_INTERNOS}
            target="_blank"
            rel="noreferrer"
          >
            Ver documentacion interna
            </Link>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default PlaybookViewer;
