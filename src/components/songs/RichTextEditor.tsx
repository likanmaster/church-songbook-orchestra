
import React, { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ChordButtonGroup from './ChordButtonGroup';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Ingresa la letra de la canción..."
}) => {
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'align', 'list', 'bullet', 'indent',
    'size', 'color', 'background'
  ];

  const handleInsertChord = (chord: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      const index = range ? range.index : quill.getLength();
      
      // Insertar el acorde con formato especial
      quill.insertText(index, `[${chord}]`, 'color', '#3b82f6');
      quill.insertText(index + chord.length + 2, ' ');
      
      // Posicionar el cursor después del acorde insertado
      quill.setSelection(index + chord.length + 3);
      
      // Actualizar el valor
      onChange(quill.root.innerHTML);
    }
  };

  return (
    <div className="rich-text-editor space-y-2">
      <ChordButtonGroup onInsertChord={handleInsertChord} />
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ minHeight: '200px' }}
      />
    </div>
  );
};

export default RichTextEditor;
