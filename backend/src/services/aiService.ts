export async function getAIResponse(
  message: string,
  history: { role: "user" | "assistant"; content: string }[] = []
) {
  const text = message.toLowerCase();

  const previousMessages = history
    .map((item) => item.content.toLowerCase())
    .join(" ");

  const conversation = `${previousMessages} ${text}`;

  // Conversation-aware response
  if (
    conversation.includes("react") &&
    (text.includes("next") ||
      text.includes("after") ||
      text.includes("learn"))
  ) {
    return "Since you're learning React, your next step should be building a small project. Try a task manager, expense tracker, or simple portfolio. This will help you turn React concepts into something you can actually show employers.";
  }

  if (text.includes("react")) {
    return "If you're learning React, start with components, JSX, props, state, and hooks. Then build a small project to practice them together.";
  }

  if (text.includes("backend")) {
    return "For backend development, focus on HTTP, REST APIs, Node.js, Express, databases, authentication, and building real projects.";
  }

  if (text.includes("dsa")) {
    return "For DSA, start with arrays and strings, then move to linked lists, stacks, queues, trees, graphs, recursion, and dynamic programming.";
  }

  if (text.includes("resume")) {
    return "A strong developer resume should highlight measurable projects, technical skills, internships or experience, and links to your GitHub and portfolio.";
  }

  return "I'm De Zero, your developer career companion. Ask me about coding, DSA, projects, resumes, interviews, or your learning roadmap.";
}