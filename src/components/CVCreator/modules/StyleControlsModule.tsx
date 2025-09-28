import React from 'react';
import { StyleControls } from '../StyleControls';
import { useCVCreator } from '../CVCreatorContext.hook';

export const StyleControlsModule: React.FC = () => {
  const {
    customFont,
    setCustomFont,
    customColor,
    setCustomColor,
    titleColor,
    setTitleColor,
    layoutColumns,
    setLayoutColumns,
    sectionSpacing,
    setSectionSpacing,
    nameAlignment,
    setNameAlignment,
    photoAlignment,
    setPhotoAlignment,
    photoSize,
    setPhotoSize,
    photoShape,
    setPhotoShape,
    nameFontSize,
    setNameFontSize,
    photoZoom,
    setPhotoZoom,
    photoPositionX,
    setPhotoPositionX,
    photoPositionY,
    setPhotoPositionY,
    photoRotation,
    setPhotoRotation,
    photoObjectFit,
    setPhotoObjectFit,
    selectedSection,
    availableFonts,
    availableColors,
    editableContent,
    sections,
    toggleSectionVisibility,
    pageMarginHorizontal,
    setPageMarginHorizontal,
    pageMarginVertical,
    setPageMarginVertical
  } = useCVCreator();

  return (
    <StyleControls
      customFont={customFont}
      setCustomFont={setCustomFont}
      customColor={customColor}
      setCustomColor={setCustomColor}
      titleColor={titleColor}
      setTitleColor={setTitleColor}
      layoutColumns={layoutColumns}
      setLayoutColumns={setLayoutColumns}
      sectionSpacing={sectionSpacing}
      setSectionSpacing={setSectionSpacing}
      nameAlignment={nameAlignment}
      setNameAlignment={setNameAlignment}
      photoAlignment={photoAlignment}
      setPhotoAlignment={setPhotoAlignment}
      photoSize={photoSize}
      setPhotoSize={setPhotoSize}
      photoShape={photoShape}
      setPhotoShape={setPhotoShape}
      nameFontSize={nameFontSize}
      setNameFontSize={setNameFontSize}
      photoZoom={photoZoom}
      setPhotoZoom={setPhotoZoom}
      photoPositionX={photoPositionX}
      setPhotoPositionX={setPhotoPositionX}
      photoPositionY={photoPositionY}
      setPhotoPositionY={setPhotoPositionY}
      photoRotation={photoRotation}
      setPhotoRotation={setPhotoRotation}
      photoObjectFit={photoObjectFit}
      setPhotoObjectFit={setPhotoObjectFit}
      availableFonts={availableFonts}
      availableColors={availableColors}
      selectedSection={selectedSection}
      hasPhoto={!!editableContent.photo}
      sections={sections?.map(s => ({ id: s.id, name: s.name, visible: s.visible }))}
      toggleSectionVisibility={toggleSectionVisibility}
      pageMarginHorizontal={pageMarginHorizontal}
      setPageMarginHorizontal={setPageMarginHorizontal}
      pageMarginVertical={pageMarginVertical}
      setPageMarginVertical={setPageMarginVertical}
    />
  );
};