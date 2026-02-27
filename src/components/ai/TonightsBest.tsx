/**
 * Tonight's Best — ranked list of DSO targets for the current session.
 * Integrated into the objects page as a new tab.
 */

import { useTranslation } from "react-i18next";
import { useState, useContext, useMemo, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

import { ConnectionContext } from "@/stores/ConnectionContext";
import { AstroObject } from "@/types";
import { useObservationData } from "@/hooks/useObservationData";
import { rankTargetsForTonight } from "@/lib/ai/tonights_best";
import type { RankedTarget } from "@/lib/ai/tonights_best";
import { processObjectListOpenNGC } from "@/lib/observation_lists_utils";
import DSOObject from "@/components/astroObjects/DSOObject";

import dsoCatalog from "../../../data/catalogs/dso_catalog.json";

const dsoObjects: AstroObject[] = processObjectListOpenNGC(dsoCatalog);

type Props = {
  objectFavoriteNames: string[];
  setObjectFavoriteNames: Dispatch<SetStateAction<string[]>>;
  objectPersonalList: AstroObject[];
  setObjectPersonalList: Dispatch<SetStateAction<AstroObject[]>>;
  setModule: Dispatch<SetStateAction<string | undefined>>;
  setErrors: Dispatch<SetStateAction<string | undefined>>;
  setSuccess: Dispatch<SetStateAction<string | undefined>>;
};

export default function TonightsBest(props: Props) {
  const { t } = useTranslation();
  const connectionCtx = useContext(ConnectionContext);
  const { weather, moon, equipment, loading, error } = useObservationData();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const ranked: RankedTarget[] = useMemo(() => {
    if (
      connectionCtx.latitude == null ||
      connectionCtx.longitude == null ||
      !weather ||
      !moon ||
      !equipment
    )
      return [];

    return rankTargetsForTonight(
      dsoObjects,
      connectionCtx.latitude,
      connectionCtx.longitude,
      connectionCtx.timezone,
      weather,
      moon,
      equipment,
      { limit: 30, minAltitudeDeg: 10 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    connectionCtx.latitude,
    connectionCtx.longitude,
    weather,
    moon,
    equipment,
    refreshKey,
  ]);

  if (connectionCtx.latitude == null || connectionCtx.longitude == null) {
    return (
      <div className="p-3 text-center text-muted">
        <i className="bi bi-geo-alt"></i> {t("cAiTonightNoLocation")}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-3 text-center text-muted">
        <i className="bi bi-hourglass-split"></i> {t("cAiScoreLoading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 text-center text-danger">
        <i className="bi bi-exclamation-triangle"></i> {error}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">
          {t("cAiTonightTitle")} ({ranked.length})
        </h5>
        <button className="btn btn-sm btn-more02" onClick={handleRefresh}>
          <i className="fa fa-refresh"></i> {t("cAiTonightRefresh")}
        </button>
      </div>

      {ranked.length === 0 && (
        <div className="p-3 text-center text-muted">
          {t("cAiTonightEmpty")}
        </div>
      )}

      {ranked.map((item, index) => (
        <div key={item.object.designation} className="position-relative">
          <div className="position-absolute top-0 start-0 p-2" style={{ zIndex: 1 }}>
            <span className={`badge ${getScoreBadgeClass(item.score)} fs-6`}>
              #{index + 1} · {item.score}
            </span>
          </div>
          <DSOObject
            object={item.object}
            objectFavoriteNames={props.objectFavoriteNames}
            setObjectFavoriteNames={props.setObjectFavoriteNames}
            objectPersonalList={props.objectPersonalList}
            setObjectPersonalList={props.setObjectPersonalList}
            isInObjectPersonalList={false}
            setModule={props.setModule}
            setErrors={props.setErrors}
            setSuccess={props.setSuccess}
          />
        </div>
      ))}
    </div>
  );
}

function getScoreBadgeClass(score: number): string {
  if (score >= 70) return "bg-success";
  if (score >= 40) return "bg-warning text-dark";
  return "bg-danger";
}
