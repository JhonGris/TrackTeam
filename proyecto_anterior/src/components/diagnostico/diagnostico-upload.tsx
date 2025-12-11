"use client";

import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArchivoSubido {
  archivo: File;
  nombre: string;
  tamano: string;
  tipo: string;
}

interface DiagnosticoUploadProps {
  onAnalisisCompleto: (resultado: any) => void;
  equipoId?: string;
  sintomas?: string;
}

export function DiagnosticoUpload({ onAnalisisCompleto, equipoId, sintomas }: DiagnosticoUploadProps) {
  const [archivosSubidos, setArchivosSubidos] = useState<ArchivoSubido[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const [analizando, setAnalizando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatearTamano = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const validarArchivo = (archivo: File): boolean => {
    // Validar tamaño (máximo 10MB)
    if (archivo.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB.');
      return false;
    }

    // Validar extensión
    const extensionesPermitidas = ['.txt', '.log', '.xml', '.json', '.html', '.csv', '.evtx'];
    const extension = archivo.name.substring(archivo.name.lastIndexOf('.')).toLowerCase();
    
    if (!extensionesPermitidas.includes(extension)) {
      setError(`Formato no soportado. Permitidos: ${extensionesPermitidas.join(', ')}`);
      return false;
    }

    return true;
  };

  const manejarArchivos = useCallback((archivos: FileList | null) => {
    if (!archivos) return;

    setError(null);
    const nuevosArchivos: ArchivoSubido[] = [];

    Array.from(archivos).forEach(archivo => {
      if (validarArchivo(archivo)) {
        nuevosArchivos.push({
          archivo,
          nombre: archivo.name,
          tamano: formatearTamano(archivo.size),
          tipo: archivo.type || 'text/plain'
        });
      }
    });

    setArchivosSubidos(prev => [...prev, ...nuevosArchivos]);
  }, []);

  const manejarDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(false);
    manejarArchivos(e.dataTransfer.files);
  }, [manejarArchivos]);

  const manejarDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(true);
  }, []);

  const manejarDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(false);
  }, []);

  const manejarSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    manejarArchivos(e.target.files);
    e.target.value = ''; // Resetear input para permitir subir el mismo archivo nuevamente
  };

  const eliminarArchivo = (index: number) => {
    setArchivosSubidos(prev => prev.filter((_, i) => i !== index));
  };

  const analizarArchivos = async () => {
    if (archivosSubidos.length === 0) {
      setError('Por favor sube al menos un archivo de diagnóstico');
      return;
    }

    setAnalizando(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Agregar archivos
      archivosSubidos.forEach(({ archivo }) => {
        formData.append('archivos', archivo);
      });

      // Agregar datos adicionales
      if (equipoId) formData.append('equipoId', equipoId);
      if (sintomas) formData.append('sintomas', sintomas);

      const response = await fetch('/api/diagnostico-ia', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al analizar los archivos');
      }

      const resultado = await response.json();
      
      console.log('Resultado del análisis:', resultado);
      onAnalisisCompleto(resultado);

      // Limpiar archivos después del análisis exitoso
      setArchivosSubidos([]);

    } catch (err) {
      console.error('Error en análisis:', err);
      setError('Error al analizar los archivos. Por favor intenta nuevamente.');
    } finally {
      setAnalizando(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Zona de Drop */}
      <div
        onDrop={manejarDrop}
        onDragOver={manejarDragOver}
        onDragLeave={manejarDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${arrastrando 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }
        `}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={manejarSeleccionArchivo}
          multiple
          accept=".txt,.log,.xml,.json,.html,.csv,.evtx"
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-gray-500">
            HWMonitor, CrystalDiskInfo, GPU-Z, MemTest86, Event Viewer
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Formatos: .txt, .log, .xml, .json, .html, .csv, .evtx (Máx. 10MB)
          </p>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Lista de archivos subidos */}
      {archivosSubidos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Archivos cargados ({archivosSubidos.length})
          </h4>
          {archivosSubidos.map((archivo, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {archivo.nombre}
                  </p>
                  <p className="text-xs text-gray-500">{archivo.tamano}</p>
                </div>
              </div>
              <button
                onClick={() => eliminarArchivo(index)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                disabled={analizando}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Botón de análisis */}
      {archivosSubidos.length > 0 && (
        <Button
          onClick={analizarArchivos}
          disabled={analizando}
          className="w-full"
        >
          {analizando ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analizando con IA...
            </>
          ) : (
            'Analizar con IA'
          )}
        </Button>
      )}
    </div>
  );
}
