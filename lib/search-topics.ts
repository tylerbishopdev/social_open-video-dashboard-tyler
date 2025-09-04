export const searchTopics = [
  // Direct company mentions
  "Open Video platform",
  "open.video alternative YouTube",
  
  // Creator ownership topics
  "creator owned video platforms",
  "own your video content",
  "YouTube alternatives for creators",
  "video platform 100% revenue",
  "creator monetization platforms",
  
  // Content creator pain points
  "YouTube demonetization problems",
  "content creator platform control",
  "video hosting own domain",
  "building creator brand online",
  "independent video platforms",
  
  // Business/entrepreneurship topics
  "content creator business models",
  "video content monetization strategies",
  "building online video business",
  "creator economy platforms",
  "video channel website builder",
  
  // Technical/SEO topics
  "video SEO optimization",
  "custom domain video hosting",
  "video platform migration",
  "import YouTube videos platform",
  
  // Community discussions
  "best YouTube alternatives 2025",
  "video platform recommendations creators",
  "leaving YouTube for",
  "video hosting control revenue",
  "creator platform independence"
];

export function generateDailySearchQuery(): string {
  const baseQuery = `
    Find recent discussions (past 2 weeks) in online forums, Reddit, Discord servers, 
    Twitter/X threads, Facebook groups, LinkedIn discussions, Hacker News, 
    ProductHunt comments, and creator community forums about:
    
    1. Content creators seeking alternatives to YouTube
    2. Discussions about platform revenue sharing and creator monetization
    3. Video hosting with custom domains and full control
    4. Creator economy and building independent brands
    5. Open Video platform mentions or similar services
    6. Problems with traditional video platforms (demonetization, algorithm changes)
    7. Success stories of creators going independent
    
    Focus on: ${searchTopics.slice(0, 10).join(', ')}
    
    For each relevant discussion found, provide:
    - Direct link to the discussion
    - Brief description of what's being discussed
    - Platform where discussion is happening
    - Number of participants/engagement level if available
  `;
  
  return baseQuery;
}