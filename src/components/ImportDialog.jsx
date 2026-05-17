import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';

export default function ImportDialog({ open, onOpenChange, entityName, fields, sampleRow, onSuccess }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [result, setResult] = useState(null);
  const inputRef = useRef();

  const handleFile = (e) => {
    setFile(e.target.files[0]);
    setStatus('idle');
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;
    setStatus('uploading');

    // Parse CSV manually (reliable, no AI needed)
    const text = await file.text();
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) {
      setStatus('error');
      setResult({ error: 'File appears empty or has no data rows.' });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const records = lines.slice(1).map(line => {
      // Handle quoted fields with commas inside
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') { inQuotes = !inQuotes; }
        else if (line[i] === ',' && !inQuotes) { values.push(current); current = ''; }
        else { current += line[i]; }
      }
      values.push(current);

      const record = {};
      headers.forEach((h, i) => {
        const field = fields.find(f => f.key === h);
        const val = (values[i] ?? '').trim();
        if (val !== '') {
          record[h] = field?.type === 'number' ? parseFloat(val) || 0 : val;
        }
      });
      return record;
    }).filter(r => Object.keys(r).length > 0);

    if (records.length === 0) {
      setStatus('error');
      setResult({ error: 'No valid records found in the file.' });
      return;
    }

    await base44.entities[entityName].bulkCreate(records);
    setStatus('success');
    setResult({ count: records.length });
    onSuccess?.();
  };

  const downloadSample = () => {
    const header = fields.map(f => f.key).join(',');
    const row = fields.map(f => sampleRow[f.key] ?? '').join(',');
    const blob = new Blob([`${header}\n${row}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityName.toLowerCase()}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import {entityName}s</DialogTitle>
          <DialogDescription>Upload a CSV or Excel file to bulk import records.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Column guide */}
          <div className="rounded-lg bg-muted/50 border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Expected columns:</p>
            <div className="flex flex-wrap gap-1.5">
              {fields.map(f => (
                <span key={f.key} className="text-xs bg-background border rounded px-1.5 py-0.5 font-mono">
                  {f.key}{f.required ? ' *' : ''}
                </span>
              ))}
            </div>
            <button onClick={downloadSample} className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline">
              <Download className="w-3 h-3" /> Download sample CSV
            </button>
          </div>

          {/* Upload area */}
          <div
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            {file
              ? <p className="text-sm font-medium">{file.name}</p>
              : <p className="text-sm text-muted-foreground">Click to choose a CSV or Excel file</p>
            }
            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
          </div>

          {/* Result */}
          {status === 'success' && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Successfully imported {result.count} record{result.count !== 1 ? 's' : ''}!
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {result?.error || 'Import failed. Check your file format.'}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
            <Button onClick={handleImport} disabled={!file || status === 'uploading'} className="gap-2">
              {status === 'uploading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {status === 'uploading' ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}