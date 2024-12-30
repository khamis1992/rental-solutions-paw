import { operationalGuides } from './operationalGuides';
import { technicalGuides } from './technicalGuides';
import { administrativeGuides } from './administrativeGuides';
import { moduleGuides } from './moduleGuides';
import { financialGuides } from './financialGuides';
import { legalGuides } from './legalGuides';

export const guides = {
  operational: operationalGuides,
  technical: technicalGuides,
  administrative: administrativeGuides,
  module: moduleGuides,
  financial: financialGuides,
  legal: legalGuides
};

export type GuideCategory = keyof typeof guides;