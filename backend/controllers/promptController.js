const Prompt = require('../models/Prompt');
const { Groq } = require('groq-sdk');
const { getCache, setCache, delCache } = require('../redis/redis.client');

// Create a new prompt
const createPrompt = async (req, res) => {
  try {
    const { content, tags } = req.body;
    const prompt = new Prompt({
      content,
      tags,
      user: req.userId
    });
    await prompt.save();

    // Invalidate the user's prompt list cache 
    delCache(`prompts:list:${req.userId}:sort=latest`);
    delCache(`prompts:list:${req.userId}:sort=oldest`);

    res.status(201).json(prompt);
  } catch (error) {
    res.status(500).json({ message: 'Error creating prompt', error: error.message });
  }
};

// Get all prompts for a user
const getPrompts = async (req, res) => {
  try {
    const { sort = 'latest', tag } = req.query;
    let query = { user: req.userId };

    if (tag) {
      query.tags = tag;
    }

    const cacheKey = `prompts:list:${req.userId}:sort=${sort}${tag ? `:tag=${tag}` : ''}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const prompts = await Prompt.find(query)
      .sort({ createdAt: sort === 'latest' ? -1 : 1 });

    // Cache for 60 seconds
    setCache(cacheKey, prompts, 60);

    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prompts', error: error.message });
  }
};

// Delete a prompt
const deletePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    // Invalidate the user's prompt list cache (both common sorts)
    delCache(`prompts:list:${req.userId}:sort=latest`);
    delCache(`prompts:list:${req.userId}:sort=oldest`);

    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting prompt', error: error.message });
  }
};

// Enhance prompt using Groq API
const enhancePrompt = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: 'Groq API key is not configured' });
    }

    // cache key per-user to avoid cross-user leakage, plus hash of input
    const cacheKey = `prompts:enhance:${req.userId}:${Buffer.from(prompt).toString('base64').slice(0,64)}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ enhancedPrompt: cached });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // Define the new prompt template
    const PROMPT_TEMPLATE = `
<identity>
You are a world-class prompt engineer. When given a prompt to improve, you have an incredible process to make it better (better = more concise, clear, and more likely to get the LLM to do what you want).
</identity>

<about_your_approach>
A core tenet of your approach is called concept elevation. Concept elevation is the process of taking stock of the disparate yet connected instructions in the prompt, and figuring out higher-level, clearer ways to express the sum of the ideas in a far more compressed way. This allows the LLM to be more adaptable to new situations instead of solely relying on the example situations shown/specific instructions given.

To do this, when looking at a prompt, you start by thinking deeply for at least 25 minutes, breaking it down into the core goals and concepts. Then, you spend 25 more minutes organizing them into groups. Then, for each group, you come up with candidate idea-sums and iterate until you feel you've found the perfect idea-sum for the group.

Finally, you think deeply about what you've done, identify (and re-implement) if anything could be done better, and construct a final, far more effective and concise prompt.
</about_your_approach>

Here is the prompt you'll be improving today:
<prompt_to_improve>
${prompt}
</prompt_to_improve>

In your final response, only include the enhanced version of prompt and nothing else.
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: PROMPT_TEMPLATE.trim()
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    const enhancedContent = completion.choices?.[0]?.message?.content;

    if (!enhancedContent) {
      throw new Error('Invalid response from Groq API');
    }

    // Cache  for 5 minutes
    setCache(cacheKey, enhancedContent, 300);

    res.json({ enhancedPrompt: enhancedContent });

  } catch (error) {
    console.error('Error enhancing prompt:', error);
    res.status(500).json({ 
      message: 'Error enhancing prompt', 
      error: error.message,
      details: error.response?.data || 'No additional details available'
    });
  }
};

module.exports = {
  createPrompt,
  getPrompts,
  deletePrompt,
  enhancePrompt
}; 
