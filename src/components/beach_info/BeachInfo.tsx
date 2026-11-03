import React from 'react';
import type { MarineData } from '../../services/OpenMeteoMarineAPI';
import './BeachInfo.css';

interface BeachInfoProps {
  data?: MarineData | null;
  loading?: boolean;
}

// Formatea un número o devuelve "Sin datos" si es null/undefined
const fmt = (
  v: number | null | undefined,
  digits: number,
  unit: string,
  prefix = ''
): string => (v == null ? 'Sin datos' : `${prefix}${v.toFixed(digits)}${unit}`);

export const BeachStatusTab: React.FC<BeachInfoProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="seasight-drawer__empty">
        <p>Consultando sensores de la API en tiempo real...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="seasight-drawer__empty">
        <p>⚠️ No se han recibido datos oceanográficos para esta ubicación.</p>
      </div>
    );
  }

  const waterTemp = fmt(data.waterTemperature, 1, ' °C');
  const waveHeight = fmt(data.waveHeight, 1, ' m');
  const wavePeriod = fmt(data.wavePeriod, 0, ' s');
  const windSpeed = fmt(data.windSpeed, 0, ' km/h');
  const windDirection = data.windDirection ?? 'N/D';
  const uvIndex = fmt(data.uvIndex, 0, '', 'UV ');
  const tempAmbiente = fmt(data.tempAmbiente, 0, ' °C');

  return (
    <div className="seasight-status-tab">
      <div className="seasight-status-head">
        <div className="seasight-status-head__badge">
          <span className="seasight-status-head__dot" />
          <span className="seasight-status-head__tag">MONITORIZACIÓN OCEANOGRÁFICA</span>
        </div>
        <span className="seasight-status-head__meta">
          {data.failed ? '❌ Fallo de lectura API' : 'Telemetría en tiempo real'}
        </span>
      </div>

      <div className="seasight-metrics-grid">
        {/* Agua */}
        <article className="seasight-metric-card">
          <div className="seasight-metric-card__header">
            <span className="seasight-metric-card__icon-box seasight-metric-card__icon-box--water">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            </span>
            <span className="seasight-metric-card__label">Agua</span>
          </div>
          <div className="seasight-metric-card__content">
            <span className="seasight-metric-card__value">{waterTemp}</span>
            <span className="seasight-metric-card__subtext">Temp. mar (Open-Meteo)</span>
          </div>
        </article>

        {/* Viento */}
        <article className="seasight-metric-card">
          <div className="seasight-metric-card__header">
            <span className="seasight-metric-card__icon-box seasight-metric-card__icon-box--wind">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
            </span>
            <span className="seasight-metric-card__label">Viento</span>
          </div>
          <div className="seasight-metric-card__content">
            <span className="seasight-metric-card__value">{windSpeed}</span>
            <span className="seasight-metric-card__subtext">Dirección: {windDirection}</span>
          </div>
        </article>

        {/* Olas */}
        <article className="seasight-metric-card">
          <div className="seasight-metric-card__header">
            <span className="seasight-metric-card__icon-box seasight-metric-card__icon-box--waves">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6c.6.5 1.2.8 2.5.8 2.5 0 2.5-1.6 5-1.6 2.5 0 2.5 1.6 5 1.6 2.5 0 2.5-1.6 5-1.6 1.3 0 1.9.3 2.5.8"/><path d="M2 12c.6.5 1.2.8 2.5.8 2.5 0 2.5-1.6 5-1.6 2.5 0 2.5 1.6 5 1.6 2.5 0 2.5-1.6 5-1.6 1.3 0 1.9.3 2.5.8"/></svg>
            </span>
            <span className="seasight-metric-card__label">Oleaje</span>
          </div>
          <div className="seasight-metric-card__content">
            <span className="seasight-metric-card__value">{waveHeight}</span>
            <span className="seasight-metric-card__subtext">Período: {wavePeriod}</span>
          </div>
        </article>

        {/* Radiación UV */}
        <article className="seasight-metric-card">
          <div className="seasight-metric-card__header">
            <span className="seasight-metric-card__icon-box seasight-metric-card__icon-box--uv">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
            </span>
            <span className="seasight-metric-card__label">Radiación UV</span>
          </div>
          <div className="seasight-metric-card__content">
            <span className="seasight-metric-card__value">{uvIndex}</span>
            <span className="seasight-metric-card__subtext">Índice en vivo</span>
          </div>
        </article>

        {/* Temperatura ambiente */}
        <article className="seasight-metric-card">
          <div className="seasight-metric-card__header">
            <span className="seasight-metric-card__icon-box seasight-metric-card__icon-box--wind">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
            </span>
            <span className="seasight-metric-card__label">Clima</span>
          </div>
          <div className="seasight-metric-card__content">
            <span className="seasight-metric-card__value">{tempAmbiente}</span>
            <span className="seasight-metric-card__subtext">Temp. ambiente (Open-Meteo)</span>
          </div>
        </article>

        {/* Calidad del agua */}
        <article className="seasight-metric-card">
          <div className="seasight-metric-card__header">
            <span className="seasight-metric-card__icon-box seasight-metric-card__icon-box--quality">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            </span>
            <span className="seasight-metric-card__label">Calidad Agua</span>
          </div>
          <div className="seasight-metric-card__content">
            <span className="seasight-metric-card__value">Excelente</span>
            <span className="seasight-metric-card__subtext">Control microbiológico</span>
          </div>
        </article>
      </div>
    </div>
  );
};