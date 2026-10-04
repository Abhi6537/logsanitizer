import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHeader, SectionHeader } from '../components/layout/PageHeader';
import UploadDropzone from '../components/files/UploadDropzone';
import PasteInput from '../components/files/PasteInput';
import Tabs from '../components/ui/Tabs';
import UploadProgress, { type UploadJob } from '../components/files/UploadProgress';
import FileTable from '../components/files/FileTable';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { listUploads, uploadFile } from '../api/mock';
import type { UploadRecord } from '../api/types';
import { MAX_FILE_SIZE, isSupported } from '../lib/format';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import styles from './Upload.module.css';

let jobCounter = 0;

type InputMethod = 'file' | 'paste';

const inputTabs: { id: InputMethod; label: string }[] = [
  { id: 'file', label: 'Upload file' },
  { id: 'paste', label: 'Paste text' }
];

export default function Upload() {
  useDocumentTitle('Upload');

  const [input, setInput] = useState<InputMethod>('file');

  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [rejections, setRejections] = useState<string[]>([]);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const files = useRef(new Map<string, File>());
  const controllers = useRef(new Map<string, AbortController>());

  const loadUploads = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    listUploads()
      .then(setUploads)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUploads();
    const active = controllers.current;
    return () => active.forEach((c) => c.abort());
  }, [loadUploads]);

  const patchJob = (key: string, patch: Partial<UploadJob>) =>
    setJobs((prev) => prev.map((j) => (j.key === key ? { ...j, ...patch } : j)));

  const removeJob = (key: string) => {
    setJobs((prev) => prev.filter((j) => j.key !== key));
    files.current.delete(key);
    controllers.current.delete(key);
  };

  async function runJob(key: string) {
    const file = files.current.get(key);
    if (!file) return;

    const controller = new AbortController();
    controllers.current.set(key, controller);
    patchJob(key, { phase: 'uploading', progress: 0, error: undefined });

    try {
      const record = await uploadFile(file, {
        signal: controller.signal,
        onProgress: (progress) => patchJob(key, { progress }),
        onProcessing: () => patchJob(key, { phase: 'processing' })
      });
      patchJob(key, { phase: 'complete', record });
      setUploads((prev) => [record, ...prev]);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      patchJob(key, {
        phase: 'error',
        error: err instanceof Error && err.message ? err.message : "Couldn't read this file."
      });
    } finally {
      controllers.current.delete(key);
    }
  }

  function addFiles(selected: File[]) {
    const problems: string[] = [];
    const accepted: UploadJob[] = [];

    for (const file of selected) {
      if (!isSupported(file.name)) {
        problems.push(`${file.name}: this file type is not supported.`);
      } else if (file.size > MAX_FILE_SIZE) {
        problems.push(`${file.name}: files must be 10 MB or smaller.`);
      } else {
        const key = `job-${++jobCounter}`;
        files.current.set(key, file);
        accepted.push({ key, name: file.name, phase: 'uploading', progress: 0 });
      }
    }

    setRejections(problems);
    setJobs((prev) => [...accepted, ...prev]);
    accepted.forEach((job) => void runJob(job.key));
  }

  function cancelJob(key: string) {
    controllers.current.get(key)?.abort();
    removeJob(key);
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Upload"
        description="Upload logs, stack traces, API responses, or screenshots to redact sensitive information."
      />

      <Tabs label="Input method" tabs={inputTabs} value={input} onChange={setInput}>
        {input === 'file' ? (
          <UploadDropzone onFiles={addFiles} />
        ) : (
          <PasteInput onSubmit={(file) => addFiles([file])} />
        )}
      </Tabs>

      {rejections.length > 0 && (
        <ul className={styles.rejections} role="alert">
          {rejections.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {jobs.length > 0 && (
        <div className={styles.jobs}>
          {jobs.map((job) => (
            <UploadProgress
              key={job.key}
              job={job}
              onCancel={cancelJob}
              onRetry={(key) => void runJob(key)}
              onDismiss={removeJob}
            />
          ))}
        </div>
      )}

      <SectionHeader>Recent uploads</SectionHeader>

      {loading && <p className={styles.muted}>Loading...</p>}

      {!loading && loadError && (
        <EmptyState title="Couldn't load recent uploads">
          <Button onClick={loadUploads}>Retry</Button>
        </EmptyState>
      )}

      {!loading && !loadError && uploads.length === 0 && (
        <EmptyState title="No uploads yet.">Drop a file above to start your first redaction.</EmptyState>
      )}

      {!loading && !loadError && uploads.length > 0 && <FileTable records={uploads} />}
    </div>
  );
}
