/**
 * Observation Score Card — displays AI-scored observation conditions.
 * Shows overall score (color-coded) + 4 factor bars + recommendation.
 */

import { useTranslation } from "react-i18next";
import { useContext } from "react";

import { ConnectionContext } from "@/stores/ConnectionContext";
import { AstroObject } from "@/types";
import { useObservationData } from "@/hooks/useObservationData";
import { calculateObservationScore } from "@/lib/ai/observation_scorer";
import type { DsoTypeCategory } from "@/lib/ai/observation_scorer";
import { computeRaDecToAltAz } from "@/lib/astro_utils";
import {
  convertHMSToDecimalDegrees,
  convertDMSToDecimalDegrees,
} from "@/lib/math_utils";
import { toIsoStringInLocalTime } from "@/lib/date_utils";

type Props = {
  object: AstroObject;
};

// Map recommendation codes from scorer to i18n keys
import type { RecommendationCode } from "@/lib/ai/observation_scorer";

const RECOMMENDATION_KEY_MAP: Record<RecommendationCode, string> = {
  excellent: "cAiRecExcellent",
  good_weather_issue: "cAiRecWeatherIssue",
  good_moon_issue: "cAiRecMoonIssue",
  good_low_alt: "cAiRecLowAlt",
  good: "cAiRecGood",
  challenging: "cAiRecChallenging",
  below_horizon: "cAiRecBelowHorizon",
  poor_weather: "cAiRecPoorWeather",
  marginal: "cAiRecMarginal",
  too_faint: "cAiRecTooFaint",
  poor: "cAiRecPoor",
};

function getScoreColorClass(score: number): string {
  if (score >= 70) return "ai-score-good";
  if (score >= 40) return "ai-score-moderate";
  return "ai-score-poor";
}

function parseAngularSize(sizeStr?: string): number | null {
  if (!sizeStr) return null;
  // Format is like "66'x60'" or "120'x100'"
  const match = sizeStr.match(/^([\d.]+)/);
  if (match) return parseFloat(match[1]);
  return null;
}

export default function ObservationScoreCard({ object }: Props) {
  const { t } = useTranslation();
  const connectionCtx = useContext(ConnectionContext);
  const { weather, moon, equipment, loading, error } = useObservationData();

  // Compute current Alt/Az — no memoization so time-dependent values stay fresh
  const position = (() => {
    if (
      !object.ra ||
      !object.dec ||
      connectionCtx.latitude == null ||
      connectionCtx.longitude == null
    )
      return null;

    const raDecimal = convertHMSToDecimalDegrees(object.ra);
    const decDecimal = convertDMSToDecimalDegrees(object.dec);
    if (isNaN(raDecimal) || isNaN(decDecimal)) return null;

    const results = computeRaDecToAltAz(
      connectionCtx.latitude,
      connectionCtx.longitude,
      raDecimal,
      decDecimal,
      toIsoStringInLocalTime(new Date()),
      connectionCtx.timezone
    );

    return results ? { altitudeDeg: results.alt, azimuthDeg: results.az } : null;
  })();

  // Calculate score when all data is available
  const score = (() => {
    if (!weather || !moon || !equipment || !position) return null;

    const magnitude =
      object.magnitude !== null && object.magnitude !== undefined
        ? typeof object.magnitude === "string"
          ? parseFloat(object.magnitude)
          : object.magnitude
        : null;

    return calculateObservationScore(
      {
        magnitude: magnitude !== null && !isNaN(magnitude) ? magnitude : null,
        angularSizeArcmin: parseAngularSize(object.size),
        typeCategory: (object.typeCategory || "other") as DsoTypeCategory,
      },
      position,
      moon,
      weather,
      equipment
    );
  })();

  // Don't render if location not set
  if (connectionCtx.latitude == null || connectionCtx.longitude == null) return null;

  if (loading) {
    return (
      <div className="ai-score-card mt-2">
        <small className="text-muted">
          <i className="bi bi-hourglass-split"></i> {t("cAiScoreLoading")}
        </small>
      </div>
    );
  }

  if (error || !score) return null;

  const recKey = RECOMMENDATION_KEY_MAP[score.recommendationCode];

  const factors = [
    { label: "cAiScoreAltitude", value: score.factors.altitude },
    { label: "cAiScoreWeather", value: score.factors.weather },
    { label: "cAiScoreMoon", value: score.factors.moonImpact },
    { label: "cAiScoreDifficulty", value: score.factors.targetDifficulty },
  ];

  return (
    <div className="ai-score-card mt-2 mb-2 p-2 border rounded">
      <div className="row align-items-center">
        <div className="col-auto">
          <div
            className={`ai-score-badge ${getScoreColorClass(score.overall)}`}
          >
            {score.overall}
          </div>
        </div>
        <div className="col">
          <strong>{t("cAiScoreTitle")}</strong>
          <div className="mt-1">
            {factors.map((f) => (
              <div key={f.label} className="d-flex align-items-center mb-1">
                <small className="ai-score-label">{t(f.label)}</small>
                <div className="progress ai-score-bar flex-grow-1">
                  <div
                    className={`progress-bar ${getScoreColorClass(f.value)}`}
                    style={{ width: `${f.value}%` }}
                  ></div>
                </div>
                <small className="ai-score-value">{f.value}</small>
              </div>
            ))}
          </div>
          <small className="text-muted">
            {recKey ? t(recKey) : score.recommendation}
          </small>
        </div>
      </div>
    </div>
  );
}
