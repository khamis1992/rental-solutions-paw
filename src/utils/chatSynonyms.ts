interface SynonymGroup {
  terms: string[];
  category: string;
}

const synonymGroups: SynonymGroup[] = [
  {
    terms: ['vehicle', 'car', 'automobile', 'transport'],
    category: 'vehicle'
  },
  {
    terms: ['payment', 'invoice', 'bill', 'transaction'],
    category: 'payment'
  },
  {
    terms: ['agreement', 'contract', 'lease', 'rental'],
    category: 'agreement'
  },
  {
    terms: ['customer', 'client', 'renter'],
    category: 'customer'
  }
];

export function normalizeQuery(query: string): string {
  let normalizedQuery = query.toLowerCase();
  
  synonymGroups.forEach(group => {
    group.terms.forEach(term => {
      // Create regex that matches the term as a whole word
      const regex = new RegExp(`\\b${term}s?\\b`, 'gi');
      normalizedQuery = normalizedQuery.replace(regex, group.category);
    });
  });
  
  return normalizedQuery;
}

export function addSynonym(term: string, category: string) {
  const group = synonymGroups.find(g => g.category === category);
  if (group && !group.terms.includes(term.toLowerCase())) {
    group.terms.push(term.toLowerCase());
  }
}