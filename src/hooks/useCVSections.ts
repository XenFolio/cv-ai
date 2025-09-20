import { useState, useCallback } from "react";
import type { SectionConfig } from "../components/CVCreator/types";

const STORAGE_KEY_V2 = "cvSectionsOrder";
const LEGACY_KEYS = ["cvSectionsOrder"];

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "name", name: "Nom", component: "NameSection", visible: true, layer: 1, order: 0, width: "full" },
  { id: "photo", name: "Photo", component: "PhotoSection", visible: true, layer: 2, order: 0, width: "half" },
  { id: "profile", name: "Profil Professionnel", component: "ProfileSection", visible: true, layer: 2, order: 1, width: "half" },
  { id: "contact", name: "Contact", component: "ContactSection", visible: true, layer: 3, order: 0, width: "half" },
  { id: "experience", name: "Expérience Professionnelle", component: "ExperienceSection", visible: true, layer: 3, order: 1, width: "half" },
  { id: "education", name: "Formation", component: "EducationSection", visible: true, layer: 4, order: 0, width: "half" },
  { id: "skills", name: "Compétences", component: "SkillsSection", visible: true, layer: 4, order: 1, width: "half" },
  { id: "languages", name: "Langues", component: "LanguagesSection", visible: true, layer: 5, order: 0, width: "full" },
];

/* ---------------- Type guards ---------------- */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function isString(v: unknown): v is string {
  return typeof v === "string";
}
function isNumber(v: unknown): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}
function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}
function isLeftRight(v: unknown): v is "left" | "right" {
  return v === "left" || v === "right";
}
function isWidth(v: unknown): v is "full" | "half" {
  return v === "full" || v === "half";
}

/* ------------- Migration anciens schémas ------------- */
function migrateSections(raw: unknown): SectionConfig[] | null {
  if (!Array.isArray(raw)) return null;

  const prelim: Array<Partial<SectionConfig> & { id: string }> = raw
    .filter((item: unknown): item is Record<string, unknown> => isRecord(item) && isString(item.id))
    .map((s): Partial<SectionConfig> & { id: string } => {
      const layer = isNumber(s.layer) ? s.layer : 1;

      let order: number | undefined = isNumber(s.order) ? s.order : undefined;
      if (order === undefined && isLeftRight(s.position)) {
        order = s.position === "left" ? 0 : 1;
      }

      const width = isWidth(s.width) ? s.width : undefined;

      return {
        id: s.id as string,
        name: isString(s.name) ? s.name : (s.id as string),
        component: isString(s.component) ? s.component : "",
        visible: isBoolean(s.visible) ? s.visible : true,
        layer,
        order,
        width,
      };
    });

  // attribuer des order manquants par layer
  const byLayer = new Map<number, (Partial<SectionConfig> & { id: string })[]>();
  for (const s of prelim) {
    const L = isNumber(s.layer) ? s.layer : 1;
    const arr = byLayer.get(L);
    if (arr) arr.push(s);
    else byLayer.set(L, [s]);
  }

  for (const arr of byLayer.values()) {
    const needAssign = arr.some((s) => !isNumber(s.order));
    if (needAssign) {
      arr.forEach((s, idx) => {
        if (!isNumber(s.order)) s.order = idx;
      });
    }
  }

  return prelim.map((s) => ({
    id: s.id,
    name: s.name as string,
    component: s.component as string,
    visible: s.visible as boolean,
    layer: (isNumber(s.layer) ? s.layer : 1) as number,
    order: (isNumber(s.order) ? s.order : 0) as number,
    width: s.width,
  })) as SectionConfig[];
}

/* ------------- Cleanup qui préserve l’ordre ------------- */
function cleanupLayersPure(sections: SectionConfig[]): SectionConfig[] {
  const layerGroups = new Map<number, SectionConfig[]>();
  for (const section of sections) {
    const L = section.layer ?? 1;
    const arr = layerGroups.get(L);
    if (arr) arr.push(section); else layerGroups.set(L, [section]);
  }

  const sortedLayers = Array.from(layerGroups.keys()).sort((a, b) => a - b);
  const result: SectionConfig[] = [];

  sortedLayers.forEach((oldLayer, index) => {
    const newLayer = index + 1;
    const inLayer = layerGroups.get(oldLayer)!;
    const byOrder = [...inLayer].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const limited = byOrder.slice(0, 2);

    if (limited.length === 2) {
      limited.forEach((s, i) =>
        result.push({ ...s, layer: newLayer, order: i, width: "half" })
      );
    } else if (limited.length === 1) {
      const s = limited[0];
      result.push({
        ...s,
        layer: newLayer,
        order: s.order ?? 0,
        // 🔒 préserver la width choisie (half ou full)
        width: s.width ?? (limited.length === 1 ? "full" : "half"),
      });
    }

    if (byOrder.length > 2) {
      byOrder.slice(2).forEach((s, extraIdx) => {
        result.push({ ...s, layer: sortedLayers.length + extraIdx + 1, order: 0, width: "full" });
      });
    }
  });

  return result;
}



/* ---------------- Lecture initiale ---------------- */
function loadInitialSections(): SectionConfig[] {
  console.log("[useCVSections] Loading initial sections");

  // Essayer de charger depuis localStorage d'abord
  const keysToTry = [STORAGE_KEY_V2, ...LEGACY_KEYS];
  for (const key of keysToTry) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as unknown;
      const migrated = migrateSections(parsed);
      if (migrated && migrated.length) {
        console.log("[useCVSections] Sections loaded from localStorage:", migrated);
        return cleanupLayersPure(migrated);
      }
    } catch (e) {
      console.warn("[useCVSections] Échec lecture/migration localStorage:", e);
    }
  }

  // Si rien n'est trouvé dans localStorage, utiliser les sections par défaut
  console.log("[useCVSections] No sections found in localStorage, using defaults");
  return cleanupLayersPure(DEFAULT_SECTIONS);
}

/* ---------------- Hook public ---------------- */
export const useCVSections = () => {
  const [sections, setSections] = useState<SectionConfig[]>(() => loadInitialSections());

  const cleanupLayers = useCallback((arr: SectionConfig[]): SectionConfig[] => {
    return cleanupLayersPure(arr);
  }, []);

  const setSectionsOrder = useCallback((newOrder: SectionConfig[]) => {
    setSections(newOrder);
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(newOrder));
    } catch (e) {
      console.warn("[useCVSections] Échec écriture localStorage:", e);
    }
  }, []);

  const resetSectionsOrder = useCallback(() => {
    const clean = cleanupLayersPure(DEFAULT_SECTIONS);
    setSections(clean);
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(clean));
    } catch (e) {
      console.warn("[useCVSections] Échec écriture localStorage (reset):", e);
    }
  }, []);

  const toggleSectionVisibility = useCallback((sectionId: string) => {
    setSections((prev) => {
      const next = prev.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      );
      try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(next));
      } catch (e) {
        console.warn("[useCVSections] Échec écriture localStorage (toggle):", e);
      }
      return next;
    });
  }, []);

  const expandSection = useCallback((id: string) => {
    setSections((prev) => {
      const next = prev.map((s) =>
        s.id === id ? { ...s, width: "full" as const } : s
      );
      try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(next));
      } catch (e) {
        console.warn("[useCVSections] Échec écriture localStorage (expand):", e);
      }
      return next;
    });
  }, []);

  const contractSection = useCallback((id: string) => {
    setSections((prev) => {
      const next = prev.map((s) =>
        s.id === id ? { ...s, width: "half" as const } : s
      );
      try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(next));
      } catch (e) {
        console.warn("[useCVSections] Échec écriture localStorage (contract):", e);
      }
      return next;
    });
  }, []);

  return {
    sections,
    setSectionsOrder,
    cleanupLayers,
    resetSectionsOrder,
    toggleSectionVisibility,
    expandSection,
    contractSection,
  };
};
