import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Upload, Trash2, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PropertyPhotos({ deal, onSave }) {
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null); // index of photo in lightbox
  const fileInputRef = useRef(null);
  const photos = deal.photos || [];

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const newUrls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newUrls.push(file_url);
    }
    onSave({ photos: [...photos, ...newUrls] });
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = (idx) => {
    const updated = photos.filter((_, i) => i !== idx);
    onSave({ photos: updated });
    if (lightbox !== null) setLightbox(null);
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Camera className="w-4 h-4" /> Property Photos
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Upload
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary/60 transition-colors"
          >
            <Camera className="w-6 h-6" />
            <span className="text-sm">Click to upload property photos</span>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((url, i) => (
              <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer" onClick={() => setLightbox(i)}>
                <img src={url} alt={`Property photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(i); }}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-primary/60 transition-colors"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            </button>
          </div>
        )}
      </CardContent>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setLightbox(null)}>
            <X className="w-6 h-6" />
          </button>
          {lightbox > 0 && (
            <button className="absolute left-4 text-white/80 hover:text-white" onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}>
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          {lightbox < photos.length - 1 && (
            <button className="absolute right-4 text-white/80 hover:text-white" onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}>
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
          <img
            src={photos[lightbox]}
            alt="Property"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute bottom-4 right-4 bg-red-600/80 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5"
            onClick={e => { e.stopPropagation(); handleDelete(lightbox); }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">{lightbox + 1} / {photos.length}</p>
        </div>
      )}
    </Card>
  );
}