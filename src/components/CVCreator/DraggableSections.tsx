import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable,
  rectIntersection,
  type CollisionDetection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { RotateCcw, Move, Maximize2, Minimize2 } from "lucide-react";
// import { useCVSections } from "../../hooks/useCVSections";
// import { cleanupLayersPure } from "../../hooks/useCVSections";
import { useCVCreator } from "./CVCreatorContext.hook";
import {
  NameSection,
  PhotoSection,
  ProfileSection,
  ContactSection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  LanguagesSection,
  SectionWrapper,
} from "./sections";
import type {
  SectionConfig,
} from "./types";

/* ---------------- Helpers métier ---------------- */

function swapInSameLayer(
  sections: SectionConfig[],
  idA: string,
  idB: string
): SectionConfig[] {
  const a = sections.find((s) => s.id === idA);
  const b = sections.find((s) => s.id === idB);
  if (!a || !b || a.layer !== b.layer) return sections;

  return sections.map((s) =>
    s.id === a.id ? { ...s, order: b.order } : s.id === b.id ? { ...s, order: a.order } : s
  );
}

function moveToLayer(
  sections: SectionConfig[],
  id: string,
  targetLayer: number
): SectionConfig[] {
  const active = sections.find((s) => s.id === id);
  if (!active) return sections;

  const target = sections.filter((s) => s.layer === targetLayer && s.id !== id);

  if (target.length === 0) {
    // première section → full (mais sera visuellement half si un slot vide existe en face)
    return sections.map((s) =>
      s.id === id ? { ...s, layer: targetLayer, order: 0, width: "full" } : s
    );
  }

  if (target.length === 1) {
    // déjà une section → split gauche/droite
    return sections.map((s) => {
      if (s.id === id) return { ...s, layer: targetLayer, order: 1, width: "half" as const };
      if (s.id === target[0].id) return { ...s, order: 0, width: "half" as const };
      return s;
    });
  }

  return sections; // layer plein
}

/* --------- Collision : priorise sections, puis empty-* --------- */
const preferSectionsCollision: CollisionDetection = (args) => {
  const collisions = rectIntersection(args);

  // On exclut seulement layers (mais on garde inter-layers pour permettre le drop entre layers)
  const targets = collisions.filter((c) => {
    const id = String(c.id);
    return !id.startsWith("layer-");
  });

  // Priorité absolue aux inter-layers (pour créer de nouveaux layers)
  const interLayerTargets = targets.filter((c) => String(c.id).startsWith("inter-layer-"));
  if (interLayerTargets.length > 0) {
    return interLayerTargets;
  }

  // Ensuite priorité aux vraies sections
  const sectionsOnly = targets.filter((c) => !String(c.id).startsWith("empty-"));
  return sectionsOnly.length > 0 ? sectionsOnly : targets;
};

/* ---------------- Containers droppables ---------------- */

interface LayerContainerProps {
  layer: number;
  isDragging: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  sections?: SectionConfig[];
  onContract?: (id: string) => void;
}
const LayerContainer: React.FC<LayerContainerProps> = ({
  layer,
  isDragging,
  children,
  disabled = false,
  sections = [],
  onContract,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: `layer-${layer}`, disabled });

  // Vérifier s'il y a une section en pleine largeur dans ce layer
  const hasFullWidthSection = sections.some(s => s.width === "full");
  const fullWidthSection = sections.find(s => s.width === "full");

  return (
    <div
      ref={setNodeRef}
      className={`
        group relative w-full rounded-lg p-0 transition-all duration-200
        ${isDragging && !disabled && isOver
          ? "border-2 border-green-400 border-dashed bg-green-50"
          : isDragging
            ? "border border-gray-200"
            : "hover:border-2 hover:border-violet-500 hover:border-dashed"}
      `}
      style={{ minHeight: "auto" }}
    >
      {children}

      {/* Bouton contract en haut à droite */}
      {hasFullWidthSection && fullWidthSection && onContract && (
        <div className="absolute top-0 right-2 pr-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContract(fullWidthSection.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-gray-100 pointer-events-auto"
            title="Revenir en deux colonnes"
          >
            <Minimize2 className="w-4 h-4 text-gray-500 hover:text-violet-600" />
          </button>
        </div>
      )}
    </div>
  );
};

const InterLayerDropZone: React.FC<{ index: number; isDragging: boolean }> = ({ index, isDragging }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `inter-layer-${index}` });
  return (
    <div
      ref={setNodeRef}
      className={`
        w-full my-2 transition-all duration-300 ease-in-out relative
        ${isDragging ? "opacity-100" : "opacity-0 hover:opacity-50"}
        ${isDragging ? "h-3" : "h-1"}
      `}
    >
      <div
        className={`
          w-full h-full rounded-full transition-all duration-300
          ${isOver
            ? "bg-gradient-to-r from-violet-400 to-purple-400 scale-y-200 shadow-md"
            : "bg-gray-400 hover:bg-violet-300"}
          ${isDragging ? "animate-pulse" : ""}
        `}
      />
      {/* Indicateur textuel lors du hover */}
      {isOver && isDragging && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-violet-600 text-white text-xs px-1 py-0.5 rounded shadow-md whitespace-nowrap z-50">
          Déposer ici pour créer un nouveau layer
        </div>
      )}
    </div>
  );
};

/* ---------------- SectionDroppable ---------------- */

interface SectionDroppableProps {
  section: SectionConfig;
  isDragging: boolean;
  activeSection: string | null;
  children: React.ReactNode;
  forceHalf?: boolean;
}
const SectionDroppable: React.FC<SectionDroppableProps> = ({
  section,
  isDragging,
  activeSection,
  children,
  forceHalf = false,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: section.id });

  const widthClass = forceHalf || section.width === "half" ? "w-1/2" : "w-full";

  return (
    <div
      ref={setNodeRef}
      className={`
        ${widthClass} h-full
        relative transition-colors
        ${isOver ? "bg-violet-50" : ""}
      `}
      style={{
        minHeight: section.id === "name" ? "auto" : "80px",
        display: "flex",
        flexDirection: "column",
        opacity: isDragging && activeSection === section.id ? 0 : 1,
      }}
    >
      {children}

    </div>
  );
};

/* ---------------- EmptySlot ---------------- */

interface EmptySlotProps {
  half?: boolean;
  onExpand?: () => void;
  id: string;
  isDragging?: boolean;
}
const EmptySlot: React.FC<EmptySlotProps> = ({
  half = false,
  onExpand,
  id,
  isDragging,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        ${half ? "w-1/2" : "w-full"}
        min-h-[40px] height-auto rounded-md border-2 border-dashed 
        flex items-center justify-center text-gray-400 text-xs italic relative
        transition-colors
        ${isOver ? "border-violet-500 bg-violet-50" : "border-gray-300 bg-gray-50"}
        ${isDragging ? "opacity-100" : "opacity-50"}
      `}
    >
      Emplacement vide
      {onExpand && (
        <button
          onClick={onExpand}
          className="absolute top-0 right-3 z-20 p-1 rounded-full hover:bg-gray-100 pointer-events-auto"
          title="Étendre en pleine largeur"
        >
          <Maximize2 className="w-4 h-4 text-gray-500 hover:text-violet-600" />
        </button>
      )}
    </div>
  );
};


/* ---------------- Composant principal ---------------- */

export const DraggableSections: React.FC = () => {
  const {
    editableContent,
    setEditableContent,
    experiences,
    setExperiences,
    skills,
    setSkills,
    languages,
    setLanguages,
    educations,
    setEducations,
    editingField,
    setEditingField,
    customColor,
    titleColor,
    addExperience,
    removeExperience,
    addSkill,
    removeSkill,
    addLanguage,
    removeLanguage,
    addEducation,
    removeEducation,
    generateWithAI,
    isLoading,
    nameAlignment,
    photoAlignment,
    photoSize,
    photoShape,
    nameFontSize,
    photoZoom,
    photoPositionX,
    photoPositionY,
    photoRotation,
    photoObjectFit,
    setSelectedSection,
    sections,
    setSectionsOrder,
    cleanupLayers,
    expandSection,
    contractSection,
  } = useCVCreator();

  const [isDragging, setIsDragging] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    setActiveSection(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    setActiveSection(null);
    if (!over) return;

    let next: SectionConfig[] = [];

    if (typeof over.id === "string" && over.id.startsWith("inter-layer-")) {
      // drop entre 2 layers → crée un nouveau layer pour cette section seulement
      const idx = parseInt(over.id.replace("inter-layer-", ""), 10);

      // Créer un nouveau layer spécifiquement pour cette section
      next = sections.map((s) => {
        if (s.id === active.id) {
          // La section draggée va dans le nouveau layer
          return { ...s, layer: idx + 1, order: 0, width: "full" };
        }
        // Décaler les autres layers vers le bas
        else if (s.layer > idx) {
          return { ...s, layer: s.layer + 1 };
        }
        return s;
      });

    } else if (typeof over.id === "string" && over.id.startsWith("layer-")) {
      // drop dans un layer sans slot précis
      const targetLayer = parseInt(over.id.replace("layer-", ""), 10);
      next = moveToLayer(sections, active.id as string, targetLayer);

    } else if (typeof over.id === "string" && over.id.startsWith("empty-")) {
      // drop sur un slot vide (0 = gauche, 1 = droite)
      const [, layerStr, slotStr] = over.id.split("-");
      const targetLayer = parseInt(layerStr, 10);
      const targetSlot = parseInt(slotStr, 10);
      next = sections.map((s) =>
        s.id === active.id
          ? { ...s, layer: targetLayer, order: targetSlot, width: "half" as const }
          : s
      );

    } else if (active.id !== over.id) {
      // drop sur une autre section
      const a = sections.find((s) => s.id === active.id);
      const b = sections.find((s) => s.id === over.id);
      if (a && b) {
        if (a.layer === b.layer) {
          next = swapInSameLayer(sections, a.id, b.id);
        } else {
          // b = cible ; si b est full → split ; sinon, on se met en face
          next = sections.map((s) => {
            if (s.id === a.id) {
              return {
                ...s,
                layer: b.layer,
                order: b.width === "full" ? 1 : b.order === 0 ? 1 : 0,
                width: "half" as const,
              };
            }
            if (s.id === b.id) {
              return {
                ...s,
                width: "half" as const,
                order: b.width === "full" ? 0 : b.order,
              };
            }
            return s;
          });
        }
      }
    }

    if (next.length > 0) {
      setSectionsOrder(cleanupLayers(next));
    }
  };

  const commonSectionProps = {
    editableContent,
    setEditableContent,
    editingField,
    setEditingField,
    customColor,
    titleColor,
    generateWithAI,
    isLoading,
  };

  // Fonction de callback pour la sélection de section
  const handleSectionClick = (sectionId: string) => {
    setSelectedSection?.(sectionId);
  };

  const DragOverlayContent = () => {
    if (!activeSection) return null;
    const section = sections.find((s) => s.id === activeSection);
    if (!section) return null;
    return (
      <div
        className="bg-white border-2 border-violet-500 rounded-lg p-2 shadow-lg flex items-center gap-2"
        style={{ minHeight: "30px", maxWidth: "120px" }}
      >
        <Move className="w-3 h-3 text-violet-600" />
        <span className="font-medium text-gray-800 text-xs whitespace-nowrap">
          {section.name}
        </span>
      </div>
    );
  };

  const visible = sections.filter((s) => s.visible);
  console.log('All sections:', sections);
  console.log('Visible sections:', visible);
  const layersMap = new Map<number, { capacity: number; sections: SectionConfig[] }>();

  visible.forEach((s) => {
    const key = s.layer ?? 1;
    if (!layersMap.has(key)) layersMap.set(key, { capacity: 2, sections: [] });
    layersMap.get(key)!.sections.push(s);
  });

  // capacité = 1 si une section est full
  layersMap.forEach((entry) => {
    if (entry.sections.some((s) => s.width === "full")) entry.capacity = 1;
  });

  // utilitaire de rendu de contenu
  const renderContent = (id: string) => {
    switch (id) {
      case "name": return <NameSection {...commonSectionProps} nameAlignment={nameAlignment} nameFontSize={nameFontSize} />;
      case "photo": return (
        <PhotoSection
          editableContent={editableContent}
          setEditableContent={setEditableContent}
          photoAlignment={photoAlignment}
          photoSize={photoSize}
          photoShape={photoShape}
          // Props pour les ajustements d'image
          photoZoom={photoZoom}
          photoPositionX={photoPositionX}
          photoPositionY={photoPositionY}
          photoRotation={photoRotation}
          photoObjectFit={photoObjectFit}
        />
      );
      case "profile": return <ProfileSection {...commonSectionProps} />;
      case "contact": return <ContactSection {...commonSectionProps} />;
      case "experience": return (
        <ExperienceSection
          {...commonSectionProps}
          experiences={experiences}
          setExperiences={setExperiences}
          addExperience={addExperience}
          removeExperience={removeExperience}
        />
      );
      case "education": return (
        <EducationSection
          {...commonSectionProps}
          educations={educations}
          setEducations={setEducations}
          addEducation={addEducation}
          removeEducation={removeEducation}
        />
      );
      case "skills": return (
        <SkillsSection
          {...commonSectionProps}
          skills={skills}
          setSkills={setSkills}
          addSkill={addSkill}
          removeSkill={removeSkill}
        />
      );
      case "languages": return (
        <LanguagesSection
          {...commonSectionProps}
          languages={languages}
          setLanguages={setLanguages}
          addLanguage={addLanguage}
          removeLanguage={removeLanguage}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setSectionsOrder(cleanupLayers(sections))}
          className="flex items-center gap-1 px-2 py-0 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all duration-200"
          title="Réinitialiser l'ordre des sections"
        >
          <RotateCcw className="w-3 h-3" />
          Réinitialiser l'ordre
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={preferSectionsCollision}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-1">
          {Array.from(layersMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([layer, { capacity, sections: layerSections }], index, arr) => {
              const sorted = [...layerSections].sort((a, b) => a.order - b.order);

              return (
                <React.Fragment key={layer}>
                  <LayerContainer
                    layer={layer}
                    isDragging={isDragging}
                    disabled={sorted.length >= capacity}
                    sections={sorted}
                    onContract={contractSection}
                  >
                    <SortableContext items={sorted.map((s) => s.id)} strategy={rectSortingStrategy}>
                      {capacity === 2 ? (
                        <div className="flex items-stretch gap-2">
                          {(() => {
                            const left = sorted.find((s) => s.order === 0);
                            const right = sorted.find((s) => s.order === 1);

                            // cellule gauche
                            const cellLeft = left ? (
                              <SectionDroppable
                                key={left.id}
                                section={left}
                                isDragging={isDragging}
                                activeSection={activeSection}
                                forceHalf={!right}
                              >
                                <SectionWrapper id={left.id} title={left.name} position="left" onSectionClick={handleSectionClick}>
                                  {renderContent(left.id)}
                                </SectionWrapper>
                              </SectionDroppable>
                            ) : (
                              <EmptySlot
                                key={`empty-${layer}-0`}
                                id={`empty-${layer}-0`}
                                isDragging={isDragging}
                                half
                                onExpand={right ? () => expandSection(right.id) : undefined}
                              />
                            );

                            // cellule droite
                            const cellRight = right ? (
                              <SectionDroppable
                                key={right.id}
                                section={right}
                                isDragging={isDragging}
                                activeSection={activeSection}
                                forceHalf={!left}
                              >
                                <SectionWrapper id={right.id} title={right.name} position="right" onSectionClick={handleSectionClick}>
                                  {renderContent(right.id)}
                                </SectionWrapper>
                              </SectionDroppable>
                            ) : (
                              <EmptySlot
                                key={`empty-${layer}-1`}
                                id={`empty-${layer}-1`}
                                isDragging={isDragging}
                                half
                                onExpand={left ? () => expandSection(left.id) : undefined}
                              />
                            );

                            return (
                              <>
                                {cellLeft}
                                {cellRight}
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        // capacité 1 : rendu plein
                        <div className="flex items-stretch">
                          {sorted.map((section) => (
                            <SectionDroppable
                              key={section.id}
                              section={section}
                              isDragging={isDragging}
                              activeSection={activeSection}
                            >
                              <SectionWrapper
                                id={section.id}
                                title={section.name}
                                position="left"
                                onSectionClick={handleSectionClick}
                              >
                                {renderContent(section.id)}
                              </SectionWrapper>
                            </SectionDroppable>
                          ))}
                        </div>
                      )}
                    </SortableContext>
                  </LayerContainer>

                  {index < arr.length - 1 && (
                    <InterLayerDropZone key={`inter-${index}`} index={index + 1} isDragging={isDragging} />
                  )}
                </React.Fragment>
              );
            })}
        </div>

        <DragOverlay>
          <DragOverlayContent />
        </DragOverlay>
      </DndContext>
    </div>
  );
};