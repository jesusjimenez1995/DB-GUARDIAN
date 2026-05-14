import { useMemo, useRef, useState } from 'react';
import { Alert, Stack, Typography } from '@mui/material';
import ReactQuill from 'react-quill';

const ACCEPTED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'image/png',
  'image/jpeg'
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}

function RichSolutionEditor({ value, onChange, readOnly = false }) {
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachError, setAttachError] = useState('');

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          [{ color: [] }, { background: [] }],
          ['link', 'clean'],
          ['attach']
        ],
        handlers: {
          attach: () => {
            if (!readOnly && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }
        }
      }
    }),
    [readOnly]
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'blockquote',
    'code-block',
    'color',
    'background',
    'link'
  ];

  const handleFilePick = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setAttachError('');

    try {
      let html = '';
      for (const file of files) {
        if (!ACCEPTED_MIME.includes(file.type)) {
          throw new Error(`Tipo no permitido: ${file.name}`);
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          throw new Error(`Archivo demasiado grande: ${file.name}. Maximo 5MB`);
        }

        const safeName = file.name.replace(/["'<>]/g, '_');
        const dataUrl = await toDataUrl(file);
        html += `<p><a href="${dataUrl}" target="_blank" rel="noopener noreferrer" download="${safeName}">Adjunto: ${safeName}</a></p>`;
      }

      const editor = quillRef.current?.getEditor();
      if (editor) {
        const range = editor.getSelection(true);
        const index = range?.index ?? editor.getLength();
        editor.clipboard.dangerouslyPasteHTML(index, html);
      }
    } catch (error) {
      setAttachError(error.message || 'No fue posible adjuntar el archivo');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary">
        Usa el panel para aplicar estilos, insertar enlaces o adjuntar archivos (PDF, Word, Excel, texto o imagen).
      </Typography>
      {attachError ? <Alert severity="warning">{attachError}</Alert> : null}
<<<<<<< HEAD
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          readOnly={readOnly}
          className="db-quill"
        />
      </div>
=======
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        readOnly={readOnly}
      />
>>>>>>> 1cced019334f5861a6b7e6c3cafb1e59f10d0ba0
      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg"
        onChange={handleFilePick}
      />
    </Stack>
  );
}

export default RichSolutionEditor;