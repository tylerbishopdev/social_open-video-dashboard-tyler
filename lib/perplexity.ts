import axios from "axios";
import { Discussion } from "@/types";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

export async function searchWithPerplexity(
  query: string
): Promise<Discussion[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    throw new Error("Perplexity API key not configured");
  }

  try {
    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content:
              "You are a research assistant that finds recent online discussions about video platforms, monetization, creator economy, and social media. Return findings in a structured JSON format with title, description, platform, and link for each discussion found. Focus on recent discussions from Reddit, Hacker News, Product Hunt, Twitter/X, LinkedIn, and Discord.",
          },
          {
            role: "user",
            content: `Find recent online discussions about: ${query}. Please return results in JSON format with an array of discussions, each containing: title, description, platform, link, and date.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content;

    // Parse the response and extract discussions
    return parseDiscussionsFromContent(content);
  } catch (error) {
    console.error("Perplexity API error:", error);
    throw new Error("Failed to fetch discussions from Perplexity");
  }
}

function parseDiscussionsFromContent(content: string): Discussion[] {
  try {
    // First try to parse as JSON
    const jsonData = JSON.parse(content);
    if (jsonData.discussions && Array.isArray(jsonData.discussions)) {
      return jsonData.discussions.map((item: any) => ({
        id: generateId(),
        link: item.link || "#",
        title: item.title || "Discussion",
        description: item.description || "No description available",
        platform: item.platform || extractPlatform(item.link || ""),
        date: item.date || new Date().toISOString(),
        category: categorizeDiscussion(item.description || item.title || ""),
      }));
    }
  } catch (jsonError) {
    // If JSON parsing fails, fall back to text parsing
    console.log("JSON parsing failed, using text parsing fallback");
  }

  // Fallback: parse as plain text
  const discussions: Discussion[] = [];
  const lines = content.split("\n");
  let currentDiscussion: Partial<Discussion> | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) continue;

    // Check for URLs
    const urlMatch = trimmedLine.match(/https?:\/\/[^\s\)]+/);

    if (urlMatch) {
      // If we have a current discussion, complete it
      if (currentDiscussion && currentDiscussion.description) {
        discussions.push({
          id: generateId(),
          link: urlMatch[0],
          title: extractTitle(currentDiscussion.description),
          description: currentDiscussion.description,
          platform: extractPlatform(urlMatch[0]),
          date: new Date().toISOString(),
          category: categorizeDiscussion(currentDiscussion.description),
        });
      }

      // Start a new discussion with this URL
      currentDiscussion = {
        link: urlMatch[0],
        description: trimmedLine.replace(urlMatch[0], "").trim(),
      };
    } else if (
      trimmedLine.length > 15 &&
      !trimmedLine.match(/^(\d+\.|\*|\-)/)
    ) {
      // This looks like descriptive content
      if (currentDiscussion) {
        currentDiscussion.description =
          (currentDiscussion.description || "") + " " + trimmedLine;
      } else {
        currentDiscussion = { description: trimmedLine };
      }
    }
  }

  // Don't forget the last discussion if there is one
  if (
    currentDiscussion &&
    currentDiscussion.link &&
    currentDiscussion.description
  ) {
    discussions.push({
      id: generateId(),
      link: currentDiscussion.link,
      title: extractTitle(currentDiscussion.description),
      description: currentDiscussion.description,
      platform: extractPlatform(currentDiscussion.link),
      date: new Date().toISOString(),
      category: categorizeDiscussion(currentDiscussion.description),
    });
  }

  // Remove duplicates and filter out invalid entries
  const validDiscussions = discussions
    .filter(
      (d) =>
        d.link && d.link !== "#" && d.description && d.description.length > 10
    )
    .filter(
      (discussion, index, self) =>
        index === self.findIndex((d) => d.link === discussion.link)
    );

  return validDiscussions;
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function extractTitle(text: string): string {
  // Extract first meaningful part as title
  const words = text.split(" ").slice(0, 10).join(" ");
  return words.length > 80 ? words.substring(0, 77) + "..." : words;
}

function extractPlatform(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes("reddit.com")) return "Reddit";
    if (hostname.includes("twitter.com") || hostname.includes("x.com"))
      return "Twitter/X";
    if (hostname.includes("linkedin.com")) return "LinkedIn";
    if (hostname.includes("facebook.com")) return "Facebook";
    if (hostname.includes("discord.com")) return "Discord";
    if (hostname.includes("news.ycombinator.com")) return "Hacker News";
    if (hostname.includes("producthunt.com")) return "Product Hunt";
    if (hostname.includes("youtube.com")) return "YouTube";
    return hostname.replace("www.", "").split(".")[0];
  } catch {
    return "Unknown";
  }
}

function categorizeDiscussion(text: string): string {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("monetiz") ||
    lowerText.includes("revenue") ||
    lowerText.includes("earning")
  ) {
    return "Monetization";
  }
  if (lowerText.includes("alternative") || lowerText.includes("platform")) {
    return "Platform Alternatives";
  }
  if (lowerText.includes("creator") || lowerText.includes("content")) {
    return "Creator Economy";
  }
  if (
    lowerText.includes("seo") ||
    lowerText.includes("traffic") ||
    lowerText.includes("growth")
  ) {
    return "Growth & SEO";
  }
  if (
    lowerText.includes("technical") ||
    lowerText.includes("api") ||
    lowerText.includes("integration")
  ) {
    return "Technical";
  }

  return "General Discussion";
}
