import { useRef, useState } from 'react';
import { UploadIcon } from '../layout/Icons';
import { ACCEPT_ATTRIBUTE } from '../../lib/format';
import styles from './UploadDropzone.module.css';

interface Props {
  onFiles: (files: File[]) => void;
}

export default function UploadDropzone({ onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(files);
    e.target.value = '';
  }

  return (
    <div
      className={`${styles.zone} ${dragging ? styles.dragging : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <button type="button" className={styles.button} onClick={() => inputRef.current?.click()}>
        <span className={styles.icon}>
          <UploadIcon />
        </span>
        <span className={styles.title}>
          Drop files here or <span className={styles.browse}>browse</span>
        </span>
        <span className={styles.hint}>Logs, TXT, JSON, YAML, PNG, JPG. Up to 10 MB each.</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTRIBUTE}
        onChange={handleChange}
        className={styles.input}
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}
