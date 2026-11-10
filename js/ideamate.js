// Shared local bridge for the standalone IdeaMate idea bank.
export function syncInsightToIdeaMate(insight, source = 'content-mate') {
  if (!insight?.id || !insight.title) return;
  const key = 'ideaBank_ideas';
  const ideas = JSON.parse(localStorage.getItem(key) || '[]');
  const existing = ideas.find((idea) => idea.externalId === insight.id || idea.id === `cm_${insight.id}`);
  const idea = { id: existing?.id || `cm_${insight.id}`, externalId: insight.id, title: insight.title, description: insight.description || insight.supporting_points || '', evidence: insight.supporting_points || '', notes: insight.references || '', category: insight.category || existing?.category || 'Clinical insights', subcategory: insight.subcategory || existing?.subcategory || (source === 'ideamate' ? 'IdeaMate' : 'Content Mate'), status: existing?.status || 'fresh', createdAt: existing?.createdAt || insight.created_at || new Date().toISOString(), usedAt: existing?.usedAt || null, trashedAt: existing?.trashedAt || null, savedAt: existing?.savedAt || null, useNote: existing?.useNote || '', useCount: existing?.useCount || 0, isDefault: false, isUserCreated: true, source };
  const index = ideas.findIndex((item) => item.id === idea.id);
  if (index >= 0) ideas[index] = { ...ideas[index], ...idea }; else ideas.push(idea);
  localStorage.setItem(key, JSON.stringify(ideas));
}
export function getIdeaMateIdeas() { return JSON.parse(localStorage.getItem('ideaBank_ideas') || '[]'); }
