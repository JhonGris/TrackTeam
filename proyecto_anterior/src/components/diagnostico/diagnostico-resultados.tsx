"use client";

import React from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Thermometer,
  HardDrive,
  Cpu,
  MemoryStick
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Problema {
  componente: string;
  problema: string;
  severidad: 'Crítico' | 'Advertencia' | 'Info';
  detalle?: string;
}

interface ResultadoDiagnostico {
  diagnostico: {
    resumen: string;
    nivelUrgencia: 'Crítico' | 'Medio' | 'Normal';
    problemas: Problema[];
    recomendaciones: string[];
    costoEstimado: {
      min: number;
      max: number;
      moneda: string;
    };
    tiempoEstimado: {
      horas: number;
      descripcion: string;
    };
    sintomas: string;
    timestamp: string;
  };
  metricas: {
    temperaturas: any[];
    discos: any[];
    gpu: any[];
    ram: any[];
    errores: any[];
  };
}

interface DiagnosticoResultadosProps {
  resultado: ResultadoDiagnostico;
  onAplicarAServicio?: () => void;
}

export function DiagnosticoResultados({ resultado, onAplicarAServicio }: DiagnosticoResultadosProps) {
  const { diagnostico, metricas } = resultado;

  const getUrgenciaColor = (nivel: string) => {
    switch (nivel) {
      case 'Crítico': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getSeveridadIcon = (severidad: string) => {
    switch (severidad) {
      case 'Crítico': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Advertencia': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getComponenteIcon = (componente: string) => {
    const comp = componente.toLowerCase();
    if (comp.includes('cpu') || comp.includes('procesador')) return <Cpu className="w-5 h-5" />;
    if (comp.includes('disco') || comp.includes('hdd') || comp.includes('ssd')) return <HardDrive className="w-5 h-5" />;
    if (comp.includes('ram') || comp.includes('memoria')) return <MemoryStick className="w-5 h-5" />;
    if (comp.includes('temperatura') || comp.includes('temp')) return <Thermometer className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con nivel de urgencia */}
      <div className={`p-4 rounded-lg border-2 ${getUrgenciaColor(diagnostico.nivelUrgencia)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{diagnostico.resumen}</h3>
            <p className="text-sm mt-1">Nivel de urgencia: {diagnostico.nivelUrgencia}</p>
          </div>
          {diagnostico.nivelUrgencia === 'Crítico' && (
            <AlertTriangle className="w-8 h-8" />
          )}
          {diagnostico.nivelUrgencia === 'Medio' && (
            <AlertCircle className="w-8 h-8" />
          )}
          {diagnostico.nivelUrgencia === 'Normal' && (
            <CheckCircle className="w-8 h-8" />
          )}
        </div>
      </div>

      {/* Problemas detectados */}
      {diagnostico.problemas.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Problemas Detectados ({diagnostico.problemas.length})
          </h4>
          <div className="space-y-3">
            {diagnostico.problemas.map((problema, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeveridadIcon(problema.severidad)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getComponenteIcon(problema.componente)}
                      <span className="font-medium text-gray-900">
                        {problema.componente}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        problema.severidad === 'Crítico' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {problema.severidad}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      {problema.problema}
                    </p>
                    {problema.detalle && (
                      <p className="text-xs text-gray-600 mt-1">
                        {problema.detalle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {diagnostico.recomendaciones.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">
            Recomendaciones
          </h4>
          <ul className="space-y-2">
            {diagnostico.recomendaciones.map((recomendacion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{recomendacion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Métricas detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Temperaturas */}
        {metricas.temperaturas.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-orange-500" />
              Temperaturas
            </h4>
            <div className="space-y-2">
              {metricas.temperaturas.slice(0, 5).map((temp: any, index: number) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{temp.componente}</span>
                  <span className={`font-medium ${
                    temp.valor > 80 ? 'text-red-600' : 
                    temp.valor > 70 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {temp.valor}{temp.unidad}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discos */}
        {metricas.discos.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-purple-500" />
              Estado de Discos
            </h4>
            <div className="space-y-2">
              {metricas.discos.map((disco: any, index: number) => (
                <div key={index} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Disco {index + 1}</span>
                    <span className={`font-medium ${
                      disco.salud === 'Good' || disco.salud === 'OK' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {disco.salud}
                    </span>
                  </div>
                  {disco.temperatura > 0 && (
                    <p className="text-xs text-gray-500">
                      Temp: {disco.temperatura}°C | Horas: {disco.horasUso}h
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RAM */}
        {metricas.ram.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MemoryStick className="w-5 h-5 text-green-500" />
              Memoria RAM
            </h4>
            <div className="space-y-2">
              {metricas.ram.map((test: any, index: number) => (
                <div key={index} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Test {index + 1}</span>
                    <span className={`font-medium ${
                      test.erroresDetectados === 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {test.estado}
                    </span>
                  </div>
                  {test.erroresDetectados > 0 && (
                    <p className="text-xs text-red-600">
                      Errores: {test.erroresDetectados}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GPU */}
        {metricas.gpu.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-500" />
              Tarjeta Gráfica
            </h4>
            <div className="space-y-2">
              {metricas.gpu.map((gpu: any, index: number) => (
                <div key={index} className="text-sm space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Temperatura</span>
                    <span className={`font-medium ${
                      gpu.temperatura > 85 ? 'text-red-600' : 
                      gpu.temperatura > 75 ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {gpu.temperatura}°C
                    </span>
                  </div>
                  {gpu.cargaGPU > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Carga GPU</span>
                      <span className="text-gray-900">{gpu.cargaGPU}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Estimaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Costo Estimado</p>
              <p className="text-2xl font-bold text-green-900">
                ${diagnostico.costoEstimado.min} - ${diagnostico.costoEstimado.max}
              </p>
              <p className="text-xs text-green-600">{diagnostico.costoEstimado.moneda}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Tiempo Estimado</p>
              <p className="text-2xl font-bold text-blue-900">
                {diagnostico.tiempoEstimado.descripcion}
              </p>
              <p className="text-xs text-blue-600">de trabajo técnico</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de acción */}
      {onAplicarAServicio && (
        <Button 
          onClick={onAplicarAServicio}
          className="w-full"
          size="lg"
        >
          Aplicar Diagnóstico al Servicio
        </Button>
      )}

      {/* Síntomas originales */}
      {diagnostico.sintomas && diagnostico.sintomas !== 'No especificados' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">
            Síntomas Reportados
          </h4>
          <p className="text-sm text-gray-700">{diagnostico.sintomas}</p>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-gray-500 text-center">
        Análisis realizado: {new Date(diagnostico.timestamp).toLocaleString('es-ES')}
      </p>
    </div>
  );
}
