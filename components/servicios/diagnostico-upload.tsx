'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface DiagnosticoUploadProps {
  onAnalizar: (formData: FormData) => Promise<void>
  isAnalyzing: boolean
}

const ARCHIVOS_SOPORTADOS = [
  { nombre: 'HWMonitor', extension: '.txt', descripcion: 'Temperaturas de CPU, GPU, discos' },
  { nombre: 'CrystalDiskInfo', extension: '.txt', descripcion: 'Estado de salud de discos' },
  { nombre: 'GPU-Z', extension: '.txt', descripcion: 'Información y temperaturas de GPU' },
  { nombre: 'MemTest86', extension: '.txt/.html', descripcion: 'Resultados de prueba de RAM' },
]

export function DiagnosticoUpload({ onAnalizar, isAnalyzing }: DiagnosticoUploadProps) {
  const [archivos, setArchivos] = useState<File[]>([])
  const [sintomas, setSintomas] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setArchivos(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/html': ['.html', '.htm'],
      'application/xml': ['.xml'],
      'text/csv': ['.csv'],
    },
    multiple: true,
  })

  const eliminarArchivo = (index: number) => {
    setArchivos(prev => prev.filter((_, i) => i !== index))
  }

  const handleAnalizar = async () => {
    if (archivos.length === 0) return

    const formData = new FormData()
    archivos.forEach(archivo => {
      formData.append('archivos', archivo)
    })
    formData.append('sintomas', sintomas)

    await onAnalizar(formData)
  }

  return (
    <div className="space-y-4">
      {/* Información de archivos soportados */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-blue-800 dark:text-blue-300">Archivos soportados:</p>
          <ul className="mt-1 space-y-0.5 text-blue-700 dark:text-blue-400">
            {ARCHIVOS_SOPORTADOS.map((tipo) => (
              <li key={tipo.nombre}>
                <span className="font-medium">{tipo.nombre}</span>
                <span className="text-blue-600 dark:text-blue-500"> ({tipo.extension})</span>
                <span className="text-blue-500 dark:text-blue-600"> - {tipo.descripcion}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Zona de carga de archivos */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
        {isDragActive ? (
          <p className="text-primary font-medium">Suelta los archivos aquí...</p>
        ) : (
          <>
            <p className="text-muted-foreground">
              Arrastra archivos de diagnóstico aquí
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              o haz clic para seleccionar
            </p>
          </>
        )}
      </div>

      {/* Lista de archivos cargados */}
      {archivos.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Archivos cargados ({archivos.length})
          </Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {archivos.map((archivo, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-md group"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm truncate">{archivo.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(archivo.size / 1024).toFixed(1)} KB
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => eliminarArchivo(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Eliminar archivo</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campo de síntomas */}
      <div className="space-y-2">
        <Label htmlFor="sintomas" className="text-sm font-medium">
          Síntomas reportados (opcional)
        </Label>
        <Textarea
          id="sintomas"
          placeholder="Describe los síntomas que presenta el equipo: lentitud, pantallazos azules, ruidos extraños, etc."
          value={sintomas}
          onChange={(e) => setSintomas(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Botón de análisis */}
      <Button
        type="button"
        onClick={handleAnalizar}
        disabled={archivos.length === 0 || isAnalyzing}
        className="w-full"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analizando...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Analizar Archivos ({archivos.length})
          </>
        )}
      </Button>
    </div>
  )
}
