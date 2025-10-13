import React from 'react';
import { StyleControls } from '../StyleControls';
import { useCVStyle, useCVContent, useCVUI } from '../contexts';

export const StyleControlsModule: React.FC = () => {
  // Utiliser les contextes spécialisés pour optimiser les re-rendus
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
    columnRatio,
    setColumnRatio,
    availableFonts,
    availableColors,
    pageMarginHorizontal,
    setPageMarginHorizontal,
    pageMarginVertical,
    setPageMarginVertical
  } = useCVStyle();

  const { editableContent } = useCVContent();

  const {
    selectedSection,
    sections,
    setSectionsOrder,
    toggleSectionVisibility
  } = useCVUI();

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
      columnRatio={columnRatio}
      setColumnRatio={setColumnRatio}
      hasPhoto={!!editableContent.photo}
      sections={sections}
      setSectionsOrder={setSectionsOrder}
      toggleSectionVisibility={toggleSectionVisibility}
      pageMarginHorizontal={pageMarginHorizontal}
      setPageMarginHorizontal={setPageMarginHorizontal}
      pageMarginVertical={pageMarginVertical}
      setPageMarginVertical={setPageMarginVertical}
    />
  );
};